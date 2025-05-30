import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';
import { datastoreNodeFields } from "./Datastore.description";

export class Datastore implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Datastore',
		name: 'datastore',
		icon: 'fa:database',
		group: ['utility'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'A simple in-memory key-value datastore for sharing data within the n8n instance.',
		defaults: {
			name: 'Datastore',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			...datastoreNodeFields,
		],
	};

	private static memoryStore: Map<string, any> = new Map();

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;
		const outputForSetClear = this.getNodeParameter('outputForSetClear', 0, 'passThrough') as string;

		if (operation === 'clearAll') {
			Datastore.memoryStore.clear();
			if (items.length === 0) {
				if (outputForSetClear === 'status' || outputForSetClear === 'affectedValue' || outputForSetClear === 'affectedValueOnly') {
					returnData.push({ json: { success: true, operation: 'clearAll' } });
				}
				return [returnData];
			}
		}

		for (let i = 0; i < items.length; i++) {
			const keyName = operation !== 'clearAll' ? (this.getNodeParameter('keyName', i, '') as string) : '';

			try {
				if (operation === 'set') {
					if (!keyName) {
						throw new NodeOperationError(this.getNode(), 'Key Name is required for "Set" operation.', { itemIndex: i });
					}
					const valueDataType = this.getNodeParameter('valueDataType', i, 'string') as string;
					let valueToStore: any;

					if (valueDataType === 'string') {
						valueToStore = this.getNodeParameter('valueString', i, '') as string;
					} else if (valueDataType === 'json') {
						const jsonString = this.getNodeParameter('valueJson', i, '') as string;
						try {
							valueToStore = JSON.parse(jsonString);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON provided for key "${keyName}": ${error.message}`,
								{ itemIndex: i },
							);
						}
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown data type: ${valueDataType}`, {
							itemIndex: i,
						});
					}

					Datastore.memoryStore.set(keyName, valueToStore);

					if (outputForSetClear === 'status') {
						returnData.push({ json: { success: true, operation: 'set', key: keyName }, pairedItem: { item: i } });
					} else if (outputForSetClear === 'affectedValue') {
						returnData.push({ json: { success: true, operation: 'set', value: valueToStore }, pairedItem: { item: i } });
					} else if (outputForSetClear === 'affectedValueOnly') {
						returnData.push({ json: { [keyName]: valueToStore }, pairedItem: { item: i } });
					} else {
						returnData.push(items[i]);
					}

				} else if (operation === 'get') {
					if (!keyName) {
						throw new NodeOperationError(this.getNode(), 'Key Name is required for "Get" operation.', { itemIndex: i });
					}
					if (Datastore.memoryStore.has(keyName)) {
						const retrievedValue = Datastore.memoryStore.get(keyName);
						returnData.push({
							json: { key: keyName, value: retrievedValue, found: true },
							pairedItem: { item: i },
						});
					} else {
						returnData.push({
							json: { key: keyName, value: null, found: false },
							pairedItem: { item: i },
						});
					}
				} else if (operation === 'clear') {
					if (!keyName) {
						throw new NodeOperationError(this.getNode(), 'Key Name is required for "Clear" operation.', { itemIndex: i });
					}
					let valueBeforeClear: any = null;
					let keyExisted = false;
					if (outputForSetClear === 'affectedValue' && Datastore.memoryStore.has(keyName)) {
						valueBeforeClear = Datastore.memoryStore.get(keyName);
						keyExisted = true;
					}

					const cleared = Datastore.memoryStore.delete(keyName);

					if (outputForSetClear === 'status') {
						returnData.push({ json: { success: true, operation: 'clear', key: keyName, cleared }, pairedItem: { item: i } });
					} else if (outputForSetClear === 'affectedValue') {
						returnData.push({ json: { operation: 'clear', key: keyName, value: keyExisted ? valueBeforeClear : null, cleared }, pairedItem: { item: i } });
					} else if (outputForSetClear === 'affectedValueOnly') {
						returnData.push({ json: { [keyName]: keyExisted ? valueBeforeClear : null }, pairedItem: { item: i } });
					} else {
						returnData.push(items[i]);
					}
				} else if (operation === 'clearAll') {
					if (outputForSetClear === 'status' || outputForSetClear === 'affectedValue' || outputForSetClear === 'affectedValueOnly') {
						returnData.push({ json: { success: true, operation: 'clearAll' }, pairedItem: { item: i } });
					} else {
						returnData.push(items[i]);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message }, pairedItem: { item: i } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
