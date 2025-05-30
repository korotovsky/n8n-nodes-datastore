import type { INodeProperties } from 'n8n-workflow';

export const datastoreNodeFields: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Set',
				value: 'set',
				action: 'Set a key value pair',
				description: 'Store a value associated with a key',
			},
			{
				name: 'Get',
				value: 'get',
				action: 'Get a value by key',
				description: 'Retrieve a value using its key',
			},
			{
				name: 'Clear',
				value: 'clear',
				action: 'Clear a value by key',
				description: 'Remove a specific key-value pair',
			},
			{
				name: 'Clear All',
				value: 'clearAll',
				action: 'Clear all stored values',
				description: 'Remove all key-value pairs from the store',
			},
		],
		default: 'set',
	},

	// Common field for Set, Get, Clear
	{
		displayName: 'Key Name',
		name: 'keyName',
		type: 'string',
		default: '',
		required: true,
		description: 'The unique key for the data',
		displayOptions: {
			show: {
				operation: ['set', 'get', 'clear'],
			},
		},
	},

	// Fields for 'Set' operation
	{
		displayName: 'Value Data Type',
		name: 'valueDataType',
		type: 'options',
		options: [
			{
				name: 'String',
				value: 'string',
			},
			{
				name: 'JSON',
				value: 'json',
			},
		],
		default: 'string',
		displayOptions: {
			show: {
				operation: ['set'],
			},
		},
		description: 'The type of data to store as the value',
	},
	{
		displayName: 'Value',
		name: 'valueString',
		type: 'string',
		default: '',
		required: true,
		typeOptions: {
			rows: 3,
		},
		displayOptions: {
			show: {
				operation: ['set'],
				valueDataType: ['string'],
			},
		},
		description: 'The string value to store',
	},
	{
		displayName: 'Value',
		name: 'valueJson',
		type: 'json',
		default: '',
		required: true,
		displayOptions: {
			show: {
				operation: ['set'],
				valueDataType: ['json'],
			},
		},
		description: 'The JSON value to store',
	},
	{
		displayName: 'Output for Set/Clear',
		name: 'outputForSetClear',
		type: 'options',
		options: [
			{
				name: 'Pass Through',
				value: 'passThrough',
				description: 'Outputs the same data it received as input in full.',
			},
			{
				name: 'Output Key',
				value: 'status',
				description: 'Outputs only status, operation and key.',
			},
			{
				name: 'Output Value',
				value: 'affectedValue',
				description: "Outputs only status, operation and saved value.",
			},
		],
		default: 'passThrough',
		displayOptions: {
			show: {
				operation: ['set', 'clear', 'clearAll'],
			},
		},
		description: 'Define what the node should output after a Set or Clear operation',
	},
]
