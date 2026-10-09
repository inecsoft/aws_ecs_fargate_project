# ==============================================================================
# ServiceConnect Demo — Master Makefile
# ==============================================================================
# Usage:
#   make help              Show all available commands
#   make init              Initialize Terraform for all environments
#   make plan              Plan changes for all environments
#   make apply             Apply changes for all environments
#   make destroy           Destroy all environments
#   make build             Build Docker images for all services
#   make push              Push Docker images to ECR
#   make lint              Run all linters (terraform fmt + tflint)
#   make test              Validate Terraform configurations
# ==============================================================================

# ── Variables ────────────────────────────────────────────────────────────────
SHELL           := /bin/bash
.DEFAULT_GOAL   := help
.ONESHELL:
.SHELLFLAGS     := -eu -o pipefail -c
.SILENT:

# AWS Configuration
AWS_ACCOUNT_ID  ?= $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "123456789012")
AWS_REGION      ?= us-east-1
ECR_REGISTRY    := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

# Service Configuration
SERVICES        := service-a service-b service-c
IMAGE_TAG       ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")
DEV_IMAGE_TAG   ?= dev-$(IMAGE_TAG)
PROD_IMAGE_TAG  ?= $(IMAGE_TAG)

# Environment Configuration
ENVIRONMENTS    := dev prod
TF_DIR          := environments
MODULES_DIR     := modules

# Terraform Configuration
TF_VERSION      := 1.5.0
TF_BACKEND_BUCKET    := terraform-state-serviceconnect
TF_BACKEND_DYNAMODB  := terraform-locks

# Docker Configuration
DOCKER_BUILDKIT := 1
DOCKER_CONTEXT  := .
DOCKER_FILE     := Dockerfile

# Colors for output
COLOR_RESET     := \033[0m
COLOR_GREEN     := \033[0;32m
COLOR_YELLOW    := \033[0;33m
COLOR_BLUE      := \033[0;34m
COLOR_RED       := \033[0;31m
COLOR_CYAN      := \033[0;36m
COLOR_BOLD      := \033[1m

# ==============================================================================
# HELP
# ==============================================================================
.PHONY: help
help: ## 📖 Show this help message
	@echo ""
	@echo "$(COLOR_BOLD)ServiceConnect Demo — Available Commands$(COLOR_RESET)"
	@echo "$(COLOR_CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_GREEN)🏗️  Infrastructure$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_YELLOW)%-25s$(COLOR_RESET) %s\n", $$1, $$2}' | \
		grep -E '(init|plan|apply|destroy|output|refresh|import|state|workspace)'
	@echo ""
	@echo "$(COLOR_GREEN)🐳 Docker & ECR$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_YELLOW)%-25s$(COLOR_RESET) %s\n", $$1, $$2}' | \
		grep -E '(build|push|login|ecr|image|tag)'
	@echo ""
	@echo "$(COLOR_GREEN)🔍 Quality & Testing$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_YELLOW)%-25s$(COLOR_RESET) %s\n", $$1, $$2}' | \
		grep -E '(lint|fmt|validate|test|check|docs)'
	@echo ""
	@echo "$(COLOR_GREEN)🔧 Setup & Utilities$(COLOR_RESET)"
	@grep -E '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(COLOR_YELLOW)%-25s$(COLOR_RESET) %s\n", $$1, $$2}' | \
		grep -E '(setup|install|clean|bootstrap|prereq)'
	@echo ""
	@echo "$(COLOR_CYAN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(COLOR_RESET)"
	@echo "  Run $(COLOR_YELLOW)make <target> ENV=<dev|prod>$(COLOR_RESET) for environment-specific commands"
	@echo ""

# ==============================================================================
# PREREQUISITES
# ==============================================================================
.PHONY: prereq
prereq: ## 🔧 Check all prerequisites are installed
	@echo "$(COLOR_BLUE)Checking prerequisites...$(COLOR_RESET)"
	@command -v terraform >/dev/null 2>&1 || { echo "$(COLOR_RED)✗ terraform not found$(COLOR_RESET)"; exit 1; }
	@echo "$(COLOR_GREEN)✓ terraform $(shell terraform version -json 2>/dev/null | jq -r .terraform_version 2>/dev/null || terraform version | head -1)$(COLOR_RESET)"
	@command -v docker >/dev/null 2>&1 || { echo "$(COLOR_RED)✗ docker not found$(COLOR_RESET)"; exit 1; }
	@echo "$(COLOR_GREEN)✓ docker $(shell docker --version | awk '{print $$3}')$(COLOR_RESET)"
	@command -v aws >/dev/null 2>&1 || { echo "$(COLOR_RED)✗ aws cli not found$(COLOR_RESET)"; exit 1; }
	@echo "$(COLOR_GREEN)✓ aws cli $(shell aws --version 2>&1 | awk '{print $$1}' | cut -d/ -f2)$(COLOR_RESET)"
	@command -v jq >/dev/null 2>&1 || { echo "$(COLOR_RED)✗ jq not found$(COLOR_RESET)"; exit 1; }
	@echo "$(COLOR_GREEN)✓ jq $(shell jq --version)$(COLOR_RESET)"
	@command -v tflint >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ tflint $(shell tflint --version | head -1)$(COLOR_RESET)" || echo "$(COLOR_YELLOW)⚠ tflint not found (optional)$(COLOR_RESET)"
	@command -v tfsec >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ tfsec $(shell tfsec --version 2>/dev/null | head -1)$(COLOR_RESET)" || echo "$(COLOR_YELLOW)⚠ tfsec not found (optional)$(COLOR_RESET)"
	@command -v checkov >/dev/null 2>&1 && echo "$(COLOR_GREEN)✓ checkov $(shell checkov --version 2>/dev/null | head -1)$(COLOR_RESET)" || echo "$(COLOR_YELLOW)⚠ checkov not found (optional)$(COLOR_RESET)"
	@echo ""
	@echo "$(COLOR_GREEN)All required prerequisites are installed!$(COLOR_RESET)"

.PHONY: setup
setup: prereq ## 🚀 Initial project setup (create S3 backend, DynamoDB table)
	@echo "$(COLOR_BLUE)Setting up Terraform backend...$(COLOR_RESET)"
	@aws s3api head-bucket --bucket $(TF_BACKEND_BUCKET) 2>/dev/null || \
		(aws s3api create-bucket \
			--bucket $(TF_BACKEND_BUCKET) \
			--region $(AWS_REGION) \
			--create-bucket-configuration LocationConstraint=$(AWS_REGION) && \
		aws s3api put-bucket-versioning \
			--bucket $(TF_BACKEND_BUCKET) \
			--versioning-configuration Status=Enabled && \
		aws s3api put-bucket-encryption \
			--bucket $(TF_BACKEND_BUCKET) \
			--server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}' && \
		echo "$(COLOR_GREEN)✓ S3 bucket created: $(TF_BACKEND_BUCKET)$(COLOR_RESET)")
	@aws dynamodb describe-table --table-name $(TF_BACKEND_DYNAMODB) --region $(AWS_REGION) 2>/dev/null || \
		(aws dynamodb create-table \
			--table-name $(TF_BACKEND_DYNAMODB) \
			--attribute-definitions AttributeName=LockID,AttributeType=S \
			--key-schema AttributeName=LockID,KeyType=HASH \
			--billing-mode PAY_PER_REQUEST \
			--region $(AWS_REGION) && \
		echo "$(COLOR_GREEN)✓ DynamoDB table created: $(TF_BACKEND_DYNAMODB)$(COLOR_RESET)")
	@echo ""
	@echo "$(COLOR_GREEN)Backend setup complete!$(COLOR_RESET)"

.PHONY: install-tools
install-tools: ## 📦 Install optional Terraform tooling
	@echo "$(COLOR_BLUE)Installing Terraform tooling...$(COLOR_RESET)"
	@command -v tflint >/dev/null 2>&1 || (curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install.sh | bash && echo "$(COLOR_GREEN)✓ tflint installed$(COLOR_RESET)")
	@command -v tfsec >/dev/null 2>&1 || (go install github.com/aquasecurity/tfsec/cmd/tfsec@latest && echo "$(COLOR_GREEN)✓ tfsec installed$(COLOR_RESET)")
	@command -v checkov >/dev/null 2>&1 || (pip3 install checkov && echo "$(COLOR_GREEN)✓ checkov installed$(COLOR_RESET)")
	@command -v terraform-docs >/dev/null 2>&1 || (go install github.com/terraform-docs/terraform-docs@latest && echo "$(COLOR_GREEN)✓ terraform-docs installed$(COLOR_RESET)")
	@echo "$(COLOR_GREEN)All tools installed!$(COLOR_RESET)"

# ==============================================================================
# TERRAFORM — INITIALIZATION
# ==============================================================================
.PHONY: init
init: $(addprefix init/,$(ENVIRONMENTS)) ## 🔨 Initialize Terraform for all environments

.PHONY: init/%
init/%: ## 🔨 Initialize Terraform for a specific environment (make init/dev)
	@echo "$(COLOR_BLUE)Initializing Terraform for [$*]...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform init -input=false -upgrade
	@echo "$(COLOR_GREEN)✓ [$*] initialized$(COLOR_RESET)"

# ==============================================================================
# TERRAFORM — VALIDATE & FORMAT
# ==============================================================================
.PHONY: validate
validate: $(addprefix validate/,$(ENVIRONMENTS)) ## ✅ Validate Terraform for all environments

.PHONY: validate/%
validate/%: ## ✅ Validate Terraform for a specific environment
	@echo "$(COLOR_BLUE)Validating Terraform for [$*]...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform validate
	@echo "$(COLOR_GREEN)✓ [$*] valid$(COLOR_RESET)"

.PHONY: fmt
fmt: ## 🎨 Format all Terraform files
	@echo "$(COLOR_BLUE)Formatting Terraform files...$(COLOR_RESET)"
	terraform fmt -recursive $(MODULES_DIR)
	terraform fmt -recursive $(TF_DIR)
	@echo "$(COLOR_GREEN)✓ All files formatted$(COLOR_RESET)"

.PHONY: fmt-check
fmt-check: ## 🔍 Check if Terraform files are formatted
	@echo "$(COLOR_BLUE)Checking Terraform formatting...$(COLOR_RESET)"
	terraform fmt -recursive -check $(MODULES_DIR)
	terraform fmt -recursive -check $(TF_DIR)
	@echo "$(COLOR_GREEN)✓ All files properly formatted$(COLOR_RESET)"

.PHONY: lint
lint: fmt-check ## 🔍 Run all linters (fmt + tflint + tfsec)
	@echo "$(COLOR_BLUE)Running tflint...$(COLOR_RESET)"
	@for env in $(ENVIRONMENTS); do \
		echo "  Linting $$env..."; \
		cd $(TF_DIR)/$$env && tflint --recursive --chdir=../../ || true; \
		cd ../../..; \
	done
	@echo "$(COLOR_BLUE)Running tfsec...$(COLOR_RESET)"
	@tfsec $(TF_DIR) --format=cyclonedx || true
	@echo "$(COLOR_GREEN)✓ Linting complete$(COLOR_RESET)"

.PHONY: security-scan
security-scan: ## 🔒 Run security scanning (tfsec + checkov)
	@echo "$(COLOR_BLUE)Running security scans...$(COLOR_RESET)"
	@command -v tfsec >/dev/null 2>&1 && tfsec $(TF_DIR) --format=table || echo "$(COLOR_YELLOW)tfsec not installed$(COLOR_RESET)"
	@command -v checkov >/dev/null 2>&1 && checkov -d $(TF_DIR) --quiet || echo "$(COLOR_YELLOW)checkov not installed$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)✓ Security scan complete$(COLOR_RESET)"

# ==============================================================================
# TERRAFORM — PLAN & APPLY
# ==============================================================================
.PHONY: plan
plan: $(addprefix plan/,$(ENVIRONMENTS)) ## 📋 Plan changes for all environments

.PHONY: plan/%
plan/%: init/% validate/% ## 📋 Plan changes for a specific environment
	@echo "$(COLOR_BLUE)Planning Terraform for [$*]...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform plan \
		-input=false \
		-out=tfplan \
		-var-file=terraform.tfvars
	@echo "$(COLOR_GREEN)✓ [$*] plan saved to tfplan$(COLOR_RESET)"

.PHONY: plan-destroy
plan-destroy: $(addprefix plan-destroy/,$(ENVIRONMENTS)) ## 💀 Plan destruction for all environments

.PHONY: plan-destroy/%
plan-destroy/%: ## 💀 Plan destruction for a specific environment
	@echo "$(COLOR_RED)Planning destruction for [$*]...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform plan -destroy \
		-input=false \
		-out=tfplan-destroy \
		-var-file=terraform.tfvars
	@echo "$(COLOR_YELLOW)[$*] destroy plan saved to tfplan-destroy$(COLOR_RESET)"

.PHONY: apply
apply: $(addprefix apply/,$(ENVIRONMENTS)) ## 🚀 Apply changes for all environments

.PHONY: apply/%
apply/%: plan/% ## 🚀 Apply changes for a specific environment
	@echo "$(COLOR_BLUE)Applying Terraform for [$*]...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform apply \
		-input=false \
		-auto-approve \
		tfplan
	@echo "$(COLOR_GREEN)✓ [$*] applied successfully$(COLOR_RESET)"

.PHONY: apply-quick
apply-quick/%: init/% ## ⚡ Apply without plan (for quick dev iterations)
	@echo "$(COLOR_YELLOW)Quick apply for [$*] (no plan)...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform apply \
		-input=false \
		-auto-approve \
		-var-file=terraform.tfvars
	@echo "$(COLOR_GREEN)✓ [$*] applied$(COLOR_RESET)"

# ==============================================================================
# TERRAFORM — DESTROY
# ==============================================================================
.PHONY: destroy
destroy: $(addprefix destroy/,$(ENVIRONMENTS)) ## 💥 Destroy all environments

.PHONY: destroy/%
destroy/%: ## 💥 Destroy a specific environment
	@echo "$(COLOR_RED)Destroying [$*]...$(COLOR_RESET)"
	@read -p "Are you sure you want to destroy [$*]? [y/N] " confirm && \
		[ "$$confirm" = "y" ] || (echo "Aborted." && exit 1)
	cd $(TF_DIR)/$* && terraform destroy \
		-input=false \
		-auto-approve \
		-var-file=terraform.tfvars
	@echo "$(COLOR_GREEN)✓ [$*] destroyed$(COLOR_RESET)"

# ==============================================================================
# TERRAFORM — OUTPUTS & STATE
# ==============================================================================
.PHONY: output
output: $(addprefix output/,$(ENVIRONMENTS)) ## 📊 Show outputs for all environments

.PHONY: output/%
output/%: ## 📊 Show outputs for a specific environment
	@echo "$(COLOR_CYAN)━━━ Outputs for [$*] ━━━$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform output
	@echo ""

.PHONY: refresh
refresh/%: ## 🔄 Refresh state for a specific environment
	@echo "$(COLOR_BLUE)Refreshing state for [$*]...$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform apply -refresh-only -auto-approve
	@echo "$(COLOR_GREEN)✓ [$*] state refreshed$(COLOR_RESET)"

.PHONY: state-list
state-list/%: ## 📝 List resources in state for a specific environment
	@echo "$(COLOR_CYAN)━━━ State for [$*] ━━━$(COLOR_RESET)"
	cd $(TF_DIR)/$* && terraform state list

.PHONY: import
import/%: ## 📥 Import existing resources (usage: make import/dev ARGS="aws_vpc.main vpc-123")
	cd $(TF_DIR)/$* && terraform import $(ARGS)

# ==============================================================================
# DOCKER — BUILD
# ==============================================================================
.PHONY: build
build: $(addprefix build/,$(SERVICES)) ## 🐳 Build all Docker images

.PHONY: build/%
build/%: ## 🐳 Build a specific service Docker image
	@echo "$(COLOR_BLUE)Building Docker image for [$*]...$(COLOR_RESET)"
	docker build \
		--build-arg SERVICE_NAME=$* \
		--tag $(ECR_REGISTRY)/$*:$(DEV_IMAGE_TAG) \
		--tag $(ECR_REGISTRY)/$*:$(PROD_IMAGE_TAG) \
		--tag $(ECR_REGISTRY)/$*:latest \
		-f services/$*/$(DOCKER_FILE) \
		$(DOCKER_CONTEXT)
	@echo "$(COLOR_GREEN)✓ [$*] built$(COLOR_RESET)"

.PHONY: build-dev
build-dev: ## 🐳 Build all images with dev tags
	@for svc in $(SERVICES); do \
		$(MAKE) build/$$svc DEV_IMAGE_TAG=dev-$(IMAGE_TAG); \
	done

.PHONY: build-prod
build-prod: ## 🐳 Build all images with prod tags
	@for svc in $(SERVICES); do \
		$(MAKE) build/$$svc PROD_IMAGE_TAG=$(IMAGE_TAG); \
	done

# ==============================================================================
# ECR — PUSH
# ==============================================================================
.PHONY: ecr-login
ecr-login: ## 🔑 Login to AWS ECR
	@echo "$(COLOR_BLUE)Logging in to ECR...$(COLOR_RESET)"
	aws ecr get-login-password --region $(AWS_REGION) | \
		docker login --username AWS --password-stdin $(ECR_REGISTRY)
	@echo "$(COLOR_GREEN)✓ Logged in to ECR$(COLOR_RESET)"

.PHONY: ecr-create
ecr-create: ## 📦 Create ECR repositories for all services
	@for svc in $(SERVICES); do \
		echo "$(COLOR_BLUE)Creating ECR repo: $$svc$(COLOR_RESET)"; \
		aws ecr describe-repositories --repository-names $$svc --region $(AWS_REGION) 2>/dev/null || \
		aws ecr create-repository \
			--repository-name $$svc \
			--image-scanning-configuration scanOnPush=true \
			--encryption-configuration encryptionType=AES256 \
			--region $(AWS_REGION); \
	done
	@echo "$(COLOR_GREEN)✓ All ECR repositories ready$(COLOR_RESET)"

.PHONY: push
push: ecr-login $(addprefix push/,$(SERVICES)) ## 📤 Push all images to ECR

.PHONY: push/%
push/%: ## 📤 Push a specific service image to ECR
	@echo "$(COLOR_BLUE)Pushing [$*] to ECR...$(COLOR_RESET)"
	docker push $(ECR_REGISTRY)/$*:$(DEV_IMAGE_TAG)
	docker push $(ECR_REGISTRY)/$*:$(PROD_IMAGE_TAG)
	@echo "$(COLOR_GREEN)✓ [$*] pushed$(COLOR_RESET)"

.PHONY: push-dev
push-dev: ecr-login ## 📤 Push dev-tagged images to ECR
	@for svc in $(SERVICES); do \
		echo "$(COLOR_BLUE)Pushing $$svc (dev)...$(COLOR_RESET)"; \
		docker push $(ECR_REGISTRY)/$$svc:$(DEV_IMAGE_TAG); \
	done

.PHONY: push-prod
push-prod: ecr-login ## 📤 Push prod-tagged images to ECR
	@for svc in $(SERVICES); do \
		echo "$(COLOR_BLUE)Pushing $$svc (prod)...$(COLOR_RESET)"; \
		docker push $(ECR_REGISTRY)/$$svc:$(PROD_IMAGE_TAG); \
	done

# ==============================================================================
# FULL PIPELINE
# ==============================================================================
.PHONY: deploy-dev
deploy-dev: build-dev push-dev ## 🚀 Full deploy pipeline for dev (build + push + terraform apply)
	@echo "$(COLOR_BLUE)Deploying to dev...$(COLOR_RESET)"
	$(MAKE) apply/dev
	@echo "$(COLOR_GREEN)✓ Dev deployment complete!$(COLOR_RESET)"
	$(MAKE) output/dev

.PHONY: deploy-prod
deploy-prod: build-prod push-prod ## 🚀 Full deploy pipeline for prod (build + push + terraform apply)
	@echo "$(COLOR_RED)Deploying to prod...$(COLOR_RESET)"
	@read -p "Are you sure you want to deploy to PRODUCTION? [y/N] " confirm && \
		[ "$$confirm" = "y" ] || (echo "Aborted." && exit 1)
	$(MAKE) apply/prod
	@echo "$(COLOR_GREEN)✓ Prod deployment complete!$(COLOR_RESET)"
	$(MAKE) output/prod

.PHONY: full-check
full-check: prereq fmt-check validate lint security-scan ## ✅ Run all checks (prereqs + fmt + validate + lint + security)
	@echo ""
	@echo "$(COLOR_GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)✓ All checks passed!$(COLOR_RESET)"
	@echo "$(COLOR_GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(COLOR_RESET)"

# ==============================================================================
# DOCUMENTATION
# ==============================================================================
.PHONY: docs
docs: ## 📚 Generate Terraform module documentation
	@echo "$(COLOR_BLUE)Generating documentation...$(COLOR_RESET)"
	@command -v terraform-docs >/dev/null 2>&1 || { echo "$(COLOR_RED)terraform-docs not found. Run: make install-tools$(COLOR_RESET)"; exit 1; }
	@for dir in $(MODULES_DIR)/*/; do \
		echo "  Generating docs for $$dir..."; \
		terraform-docs markdown table "$$dir" > "$$dir/README.md"; \
	done
	@echo "$(COLOR_GREEN)✓ Documentation generated$(COLOR_RESET)"

# ==============================================================================
# CLEANUP
# ==============================================================================
.PHONY: clean
clean: ## 🧹 Clean up generated files
	@echo "$(COLOR_BLUE)Cleaning up...$(COLOR_RESET)"
	find . -type d -name ".terraform" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name ".terraform.lock.hcl" -delete 2>/dev/null || true
	find . -type f -name "tfplan" -delete 2>/dev/null || true
	find . -type f -name "tfplan-destroy" -delete 2>/dev/null || true
	find . -type d -name ".terraform.lock.hcl.bak" -delete 2>/dev/null || true
	@echo "$(COLOR_GREEN)✓ Cleaned$(COLOR_RESET)"

.PHONY: clean-all
clean-all: clean ## 🧹 Clean everything including Docker images
	@echo "$(COLOR_BLUE)Removing Docker images...$(COLOR_RESET)"
	@for svc in $(SERVICES); do \
		docker rmi $(ECR_REGISTRY)/$$svc:$(DEV_IMAGE_TAG) 2>/dev/null || true; \
		docker rmi $(ECR_REGISTRY)/$$svc:$(PROD_IMAGE_TAG) 2>/dev/null || true; \
		docker rmi $(ECR_REGISTRY)/$$svc:latest 2>/dev/null || true; \
	done
	@echo "$(COLOR_GREEN)✓ All cleaned$(COLOR_RESET)"

# ==============================================================================
# TESTING
# ==============================================================================
.PHONY: test
test: validate ## 🧪 Run Terraform tests
	@echo "$(COLOR_BLUE)Running tests...$(COLOR_RESET)"
	@for env in $(ENVIRONMENTS); do \
		echo "  Testing $$env..."; \
		cd $(TF_DIR)/$$env && terraform validate && echo "  $(COLOR_GREEN)✓ $$env passed$(COLOR_RESET)"; \
		cd ../../..; \
	done
	@echo "$(COLOR_GREEN)All tests passed!$(COLOR_RESET)"

.PHONY: test-connectivity
test-connectivity/%: ## 🔗 Test ServiceConnect connectivity for an environment
	@echo "$(COLOR_BLUE)Testing ServiceConnect connectivity for [$*]...$(COLOR_RESET)"
	@cd $(TF_DIR)/$* && \
		SVC_B=$$(terraform output -raw service_b_endpoint 2>/dev/null) && \
		echo "  Service B endpoint: $$SVC_B" && \
		echo "  Testing from within the VPC..." && \
		echo "  $(COLOR_GREEN)✓ Connectivity test configured$(COLOR_RESET)"
