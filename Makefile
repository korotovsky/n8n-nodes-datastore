# Read package metadata
PKG_NAME := $(shell node -p "require('./package.json').name")
PKG_VER  := $(shell node -p "require('./package.json').version")

# Default target
.PHONY: all
all: build

# Build your project (if you have a build step)
.PHONY: build
build:
	@echo "Building project…"
	npm run build

# Bump version WITHOUT creating a Git tag or committing
# Usage: make bump-patch   or   make bump-minor   or   make bump-major
.PHONY: bump-patch bump-minor bump-major
bump-patch:
	@echo "Bumping patch version…"
	npm version patch --no-git-tag-version

bump-minor:
	@echo "Bumping minor version…"
	npm version minor --no-git-tag-version

bump-major:
	@echo "Bumping major version…"
	npm version major --no-git-tag-version

# Publish to npm registry
.PHONY: publish
publish: all
	@echo "Publishing $(PKG_NAME)@$(PKG_VER) to npm…"
	# make sure you have run `npm login` beforehand
	npm publish --access public

# Clean up build artifacts and node_modules
.PHONY: clean
clean:
	@echo "Cleaning…"
	rm -rf node_modules dist
