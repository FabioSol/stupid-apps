.DEFAULT_GOAL := help
.PHONY: help install dev build preview lint typecheck check clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start the dev server (http://localhost:5173)
	npm run dev

build: ## Production build to dist/
	npm run build

preview: ## Preview the production build locally
	npm run preview

lint: ## Run oxlint
	npm run lint

typecheck: ## Type-check without emitting
	npx tsc -b

check: lint typecheck build ## Lint, type-check and build (run before pushing)

clean: ## Remove build output and caches
	rm -rf dist node_modules/.tmp
