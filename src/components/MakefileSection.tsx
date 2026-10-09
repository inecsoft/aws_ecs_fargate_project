import CodeBlock from './CodeBlock';

export default function MakefileSection() {
  return (
    <section id="makefile-integrations" className="mb-16">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-mono">⚙️</span>
        Build Automation & Integrations
      </h2>
      <p className="text-gray-300 leading-relaxed mb-6">
        A comprehensive <strong className="text-green-400">Makefile</strong> orchestrates the entire project lifecycle — from local development to production deployment. Combined with CI/CD pipelines, linting, security scanning, and Docker automation, you get a complete DevOps workflow.
      </p>

      {/* Integration Overview Cards */}
      <div className="my-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: '🏗️', title: 'Terraform', desc: 'Init, plan, apply, destroy per environment', color: 'purple' },
          { icon: '🐳', title: 'Docker & ECR', desc: 'Build, tag, push images to ECR', color: 'blue' },
          { icon: '🔍', title: 'Linting', desc: 'terraform fmt, tflint, tfsec', color: 'yellow' },
          { icon: '🚀', title: 'CI/CD', desc: 'GitHub Actions with plan/apply', color: 'green' },
        ].map((item, i) => (
          <div key={i} className={`p-4 rounded-xl bg-${item.color}-500/5 border border-${item.color}-500/20`}>
            <div className="text-2xl mb-2">{item.icon}</div>
            <h4 className="text-white font-semibold text-sm mb-1">{item.title}</h4>
            <p className="text-gray-400 text-xs">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Project Structure */}
      <div id="project-files" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">Complete Project Files</h3>
        <div className="my-8 p-6 rounded-xl bg-gray-900/80 border border-gray-800">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            Full Project Layout
          </h4>
          <div className="font-mono text-sm space-y-0.5">
            <div className="text-green-400">serviceconnect-demo/</div>
            <div className="pl-4 text-green-400">├── Makefile <span className="text-gray-500">← Build automation</span></div>
            <div className="pl-4 text-green-400">├── Dockerfile <span className="text-gray-500">← Multi-stage Rust build</span></div>
            <div className="pl-4 text-green-400">├── docker-compose.yml <span className="text-gray-500">← Local dev</span></div>
            <div className="pl-4 text-gray-500">├── .tflint.hcl <span className="text-gray-500">← Linter config</span></div>
            <div className="pl-4 text-gray-500">├── .tfsec.yml <span className="text-gray-500">← Security scanner</span></div>
            <div className="pl-4 text-gray-500">├── .pre-commit-config.yaml <span className="text-gray-500">← Git hooks</span></div>
            <div className="pl-4 text-gray-500">├── .editorconfig <span className="text-gray-500">← Editor settings</span></div>
            <div className="pl-4 text-gray-500">├── .gitignore</div>
            <div className="pl-4 text-purple-400">├── modules/</div>
            <div className="pl-8 text-gray-500">├── vpc/</div>
            <div className="pl-8 text-gray-500">├── ecs-cluster/</div>
            <div className="pl-8 text-gray-500">└── ecs-service/</div>
            <div className="pl-4 text-orange-400">├── environments/</div>
            <div className="pl-8 text-cyan-400">│   ├── dev/</div>
            <div className="pl-8 text-orange-400">│   └── prod/</div>
            <div className="pl-4 text-blue-400">├── services/</div>
            <div className="pl-8 text-gray-500">├── service-a/</div>
            <div className="pl-8 text-gray-500">├── service-b/</div>
            <div className="pl-8 text-gray-500">└── service-c/</div>
            <div className="pl-4 text-emerald-400">└── .github/</div>
            <div className="pl-8 text-gray-500">└── workflows/</div>
            <div className="pl-12 text-gray-500">└── terraform.yml <span className="text-gray-500">← CI/CD</span></div>
          </div>
        </div>
      </div>

      {/* Makefile */}
      <div id="makefile" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center text-green-400 text-xs">M</span>
            Makefile
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          The Makefile provides a unified interface for all project operations. Run <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">make help</code> to see all available commands.
        </p>

        <CodeBlock
          title="Makefile"
          language="makefile"
          code={`# ==============================================================================
# ServiceConnect Demo — Master Makefile
# ==============================================================================

SHELL           := /bin/bash
.DEFAULT_GOAL   := help
.ONESHELL:
.SHELLFLAGS     := -eu -o pipefail -c

# AWS Configuration
AWS_ACCOUNT_ID  ?= $(shell aws sts get-caller-identity \\
                     --query Account --output text)
AWS_REGION      ?= us-east-1
ECR_REGISTRY    := $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

# Service Configuration
SERVICES        := service-a service-b service-c
IMAGE_TAG       ?= $(shell git rev-parse --short HEAD)
DEV_IMAGE_TAG   ?= dev-$(IMAGE_TAG)
PROD_IMAGE_TAG  ?= $(IMAGE_TAG)

# Environment Configuration
ENVIRONMENTS    := dev prod
TF_DIR          := environments
MODULES_DIR     := modules

# Terraform Backend
TF_BACKEND_BUCKET   := terraform-state-serviceconnect
TF_BACKEND_DYNAMODB := terraform-locks

# ── Help ──────────────────────────────────────────────────────────────────
.PHONY: help
help: ## 📖 Show all available commands
\t@echo ""
\t@echo "ServiceConnect Demo — Available Commands"
\t@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
\t@grep -E '^[a-zA-Z_/-]+:.*?## .*$$' $(MAKEFILE_LIST) | \\
\t\tawk 'BEGIN {FS = ":.*?## "}; \\
\t\t{printf "  %-25s %s\\n", $$1, $$2}'
\t@echo ""

# ── Prerequisites ─────────────────────────────────────────────────────────
.PHONY: prereq
prereq: ## 🔧 Check all prerequisites
\t@command -v terraform >/dev/null 2>&1 || \\
\t\t{ echo "✗ terraform not found"; exit 1; }
\t@command -v docker >/dev/null 2>&1 || \\
\t\t{ echo "✗ docker not found"; exit 1; }
\t@command -v aws >/dev/null 2>&1 || \\
\t\t{ echo "✗ aws cli not found"; exit 1; }
\t@echo "✓ All prerequisites installed!"

.PHONY: setup
setup: prereq ## 🚀 Initial setup (S3 backend + DynamoDB)
\t@aws s3api head-bucket --bucket $(TF_BACKEND_BUCKET) 2>/dev/null || \\
\t\t(aws s3api create-bucket \\
\t\t\t--bucket $(TF_BACKEND_BUCKET) \\
\t\t\t--region $(AWS_REGION) \\
\t\t\t--create-bucket-configuration \\
\t\t\t\tLocationConstraint=$(AWS_REGION))
\t@aws dynamodb describe-table \\
\t\t--table-name $(TF_BACKEND_DYNAMODB) \\
\t\t--region $(AWS_REGION) 2>/dev/null || \\
\t\t(aws dynamodb create-table \\
\t\t\t--table-name $(TF_BACKEND_DYNAMODB) \\
\t\t\t--attribute-definitions \\
\t\t\t\tAttributeName=LockID,AttributeType=S \\
\t\t\t--key-schema \\
\t\t\t\tAttributeName=LockID,KeyType=HASH \\
\t\t\t--billing-mode PAY_PER_REQUEST \\
\t\t\t--region $(AWS_REGION))
\t@echo "✓ Backend setup complete!"

# ── Terraform ─────────────────────────────────────────────────────────────
.PHONY: init
init: $(addprefix init/,$(ENVIRONMENTS)) ## 🔨 Init all environments

.PHONY: init/%
init/%:
\tcd $(TF_DIR)/$* && terraform init -input=false -upgrade

.PHONY: plan
plan: $(addprefix plan/,$(ENVIRONMENTS)) ## 📋 Plan all environments

.PHONY: plan/%
plan/%: init/%
\tcd $(TF_DIR)/$* && terraform plan \\
\t\t-input=false -out=tfplan \\
\t\t-var-file=terraform.tfvars

.PHONY: apply
apply: $(addprefix apply/,$(ENVIRONMENTS)) ## 🚀 Apply all environments

.PHONY: apply/%
apply/%: plan/%
\tcd $(TF_DIR)/$* && terraform apply \\
\t\t-input=false -auto-approve tfplan

.PHONY: destroy/%
destroy/%: ## 💥 Destroy a specific environment
\tcd $(TF_DIR)/$* && terraform destroy \\
\t\t-input=false -auto-approve \\
\t\t-var-file=terraform.tfvars

.PHONY: fmt
fmt: ## 🎨 Format all Terraform files
\tterraform fmt -recursive $(MODULES_DIR)
\tterraform fmt -recursive $(TF_DIR)

.PHONY: lint
lint: fmt ## 🔍 Run linters
\t@for env in $(ENVIRONMENTS); do \\
\t\tcd $(TF_DIR)/$$env && tflint --recursive; \\
\tdone

# ── Docker ────────────────────────────────────────────────────────────────
.PHONY: build
build: $(addprefix build/,$(SERVICES)) ## 🐳 Build all images

.PHONY: build/%
build/%:
\tdocker build \\
\t\t--build-arg SERVICE_NAME=$* \\
\t\t--tag $(ECR_REGISTRY)/$*:$(DEV_IMAGE_TAG) \\
\t\t--tag $(ECR_REGISTRY)/$*:$(PROD_IMAGE_TAG) \\
\t\t-f Dockerfile .

.PHONY: ecr-login
ecr-login: ## 🔑 Login to ECR
\taws ecr get-login-password --region $(AWS_REGION) | \\
\t\tdocker login --username AWS --password-stdin $(ECR_REGISTRY)

.PHONY: push
push: ecr-login $(addprefix push/,$(SERVICES)) ## 📤 Push all images

.PHONY: push/%
push/%:
\tdocker push $(ECR_REGISTRY)/$*:$(DEV_IMAGE_TAG)
\tdocker push $(ECR_REGISTRY)/$*:$(PROD_IMAGE_TAG)

# ── Full Pipeline ─────────────────────────────────────────────────────────
.PHONY: deploy-dev
deploy-dev: build push ## 🚀 Full dev pipeline
\t$(MAKE) apply/dev

.PHONY: deploy-prod
deploy-prod: build push ## 🚀 Full prod pipeline
\t$(MAKE) apply/prod

# ── Cleanup ───────────────────────────────────────────────────────────────
.PHONY: clean
clean: ## 🧹 Clean generated files
\tfind . -type d -name ".terraform" -exec rm -rf {} +
\tfind . -name "tfplan" -delete
\tfind . -name ".terraform.lock.hcl" -delete`}
        />
      </div>

      {/* Docker Compose */}
      <div id="docker-compose" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">🐳</span>
            Docker Compose (Local Dev)
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          Test your services locally before deploying to AWS. Docker Compose simulates the ServiceConnect mesh using Docker networking.
        </p>

        <CodeBlock
          title="docker-compose.yml"
          language="yaml"
          code={`version: "3.9"

services:
  service-a:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: service-a
    environment:
      - BIND_ADDRESS=0.0.0.0:3000
      - RUST_LOG=debug
    ports:
      - "3001:3000"
    networks:
      - serviceconnect
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3

  service-b:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: service-b
    environment:
      - BIND_ADDRESS=0.0.0.0:3000
      - RUST_LOG=debug
      - SERVICE_A_URL=http://service-a:3000
      - SERVICE_C_URL=http://service-c:3000
    ports:
      - "3000:3000"
    depends_on:
      service-a:
        condition: service_healthy
      service-c:
        condition: service_healthy
    networks:
      - serviceconnect

  service-c:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        SERVICE_NAME: service-c
    environment:
      - BIND_ADDRESS=0.0.0.0:3000
      - RUST_LOG=debug
    ports:
      - "3002:3000"
    networks:
      - serviceconnect

networks:
  serviceconnect:
    driver: bridge`}
        />
      </div>

      {/* Dockerfile */}
      <div id="dockerfile" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs">📦</span>
            Multi-Stage Dockerfile
          </span>
        </h3>

        <CodeBlock
          title="Dockerfile"
          language="dockerfile"
          code={`# Multi-stage build for Rust ECS services
ARG SERVICE_NAME=service-b

# ── Stage 1: Build ─────────────────────────────────────────
FROM rust:1.75-slim-bookworm AS builder

ARG SERVICE_NAME

RUN apt-get update && apt-get install -y \\
    pkg-config libssl-dev curl \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Cache dependencies
COPY services/\${SERVICE_NAME}/Cargo.toml \\
     services/\${SERVICE_NAME}/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && \\
    cargo build --release && rm -rf src

# Build actual binary
COPY services/\${SERVICE_NAME}/src ./src
RUN cargo build --release && \\
    strip target/release/\${SERVICE_NAME}

# ── Stage 2: Minimal Runtime ───────────────────────────────
FROM debian:bookworm-slim AS runtime

ARG SERVICE_NAME

RUN apt-get update && apt-get install -y \\
    ca-certificates curl \\
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && \\
    useradd -r -g appuser -m appuser

WORKDIR /app
COPY --from=builder /build/target/release/\${SERVICE_NAME} \\
     /app/server

RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s \\
    CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["/app/server"]`}
        />
      </div>

      {/* CI/CD Pipeline */}
      <div id="cicd" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">🔄</span>
            GitHub Actions CI/CD
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          Automated pipeline that runs on every PR: lint → validate → plan (with PR comments) → apply on merge.
        </p>

        {/* Pipeline Visualization */}
        <div className="my-8 p-6 rounded-xl bg-gray-900/80 border border-gray-800">
          <h4 className="text-white font-semibold mb-4">Pipeline Flow</h4>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              Push / PR
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              Lint & Validate
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              Plan (Dev)
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400">
              Plan (Prod)
            </div>
            <span className="text-gray-600">→</span>
            <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400">
              Apply (on merge)
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-gray-500 text-xs">Features:</span>
            <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs">OIDC Auth</span>
            <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs">PR Comments</span>
            <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs">tfsec</span>
            <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs">tflint</span>
            <span className="px-2 py-1 rounded bg-gray-800 text-gray-400 text-xs">Manual Prod Approval</span>
          </div>
        </div>

        <CodeBlock
          title=".github/workflows/terraform.yml (excerpt)"
          language="yaml"
          code={`name: Terraform CI/CD

on:
  push:
    branches: [main, develop]
    paths: ["environments/**", "modules/**"]
  pull_request:
    branches: [main]

env:
  TF_VERSION: "1.5.0"
  AWS_REGION: us-east-1

permissions:
  id-token: write   # OIDC
  contents: read
  pull-requests: write

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: \${{ env.TF_VERSION }}
      - run: terraform fmt -check -recursive
      - uses: terraform-linters/setup-tflint@v4
      - run: |
          tflint --init
          tflint --recursive

  plan-dev:
    needs: lint
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_DEV_ROLE_ARN }}
          aws-region: \${{ env.AWS_REGION }}
      - uses: hashicorp/setup-terraform@v3
      - run: |
          cd environments/dev
          terraform init
          terraform plan -out=tfplan

  apply-dev:
    needs: plan-dev
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: dev
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: \${{ secrets.AWS_DEV_ROLE_ARN }}
      - run: |
          cd environments/dev
          terraform init
          terraform apply -auto-approve tfplan`}
        />
      </div>

      {/* Pre-commit */}
      <div id="pre-commit" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center text-red-400 text-xs">🪝</span>
            Pre-commit Hooks
          </span>
        </h3>
        <p className="text-gray-300 leading-relaxed mb-6">
          Catch issues before they reach CI. Install with <code className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded">pip install pre-commit && pre-commit install</code>.
        </p>

        <CodeBlock
          title=".pre-commit-config.yaml"
          language="yaml"
          code={`repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: detect-private-key
      - id: no-commit-to-branch
        args: ['--branch', 'main']

  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.83.5
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_tflint
      - id: terraform_tfsec
      - id: terraform_docs

  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets`}
        />
      </div>

      {/* Quick Start Commands */}
      <div id="quick-start" className="mt-10">
        <h3 className="text-2xl font-bold text-white mb-4">Quick Start Commands</h3>

        <div className="my-8 space-y-4">
          <div className="p-5 rounded-xl bg-gray-900/80 border border-gray-800">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-cyan-400">1.</span> First-time Setup
            </h4>
            <div className="font-mono text-sm space-y-1 text-gray-400">
              <div><span className="text-green-400">$</span> make prereq          <span className="text-gray-600"># Check prerequisites</span></div>
              <div><span className="text-green-400">$</span> make setup           <span className="text-gray-600"># Create S3 backend + DynamoDB</span></div>
              <div><span className="text-green-400">$</span> make install-tools   <span className="text-gray-600"># Install tflint, tfsec, etc.</span></div>
              <div><span className="text-green-400">$</span> pre-commit install   <span className="text-gray-600"># Setup git hooks</span></div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gray-900/80 border border-gray-800">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-cyan-400">2.</span> Local Development
            </h4>
            <div className="font-mono text-sm space-y-1 text-gray-400">
              <div><span className="text-green-400">$</span> docker-compose up -d   <span className="text-gray-600"># Start services locally</span></div>
              <div><span className="text-green-400">$</span> curl localhost:3000/api <span className="text-gray-600"># Test Service-B endpoint</span></div>
              <div><span className="text-green-400">$</span> docker-compose logs -f  <span className="text-gray-600"># Follow logs</span></div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gray-900/80 border border-gray-800">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-cyan-400">3.</span> Deploy to Dev
            </h4>
            <div className="font-mono text-sm space-y-1 text-gray-400">
              <div><span className="text-green-400">$</span> make full-check       <span className="text-gray-600"># Run all checks</span></div>
              <div><span className="text-green-400">$</span> make build-dev        <span className="text-gray-600"># Build Docker images</span></div>
              <div><span className="text-green-400">$</span> make push-dev         <span className="text-gray-600"># Push to ECR</span></div>
              <div><span className="text-green-400">$</span> make apply/dev        <span className="text-gray-600"># Deploy infrastructure</span></div>
              <div><span className="text-green-400">$</span> make output/dev       <span className="text-gray-600"># Show endpoints</span></div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gray-900/80 border border-gray-800">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-cyan-400">4.</span> Deploy to Prod
            </h4>
            <div className="font-mono text-sm space-y-1 text-gray-400">
              <div><span className="text-green-400">$</span> make plan/prod        <span className="text-gray-600"># Preview changes</span></div>
              <div><span className="text-green-400">$</span> make apply/prod       <span className="text-gray-600"># Deploy (with confirmation)</span></div>
              <div><span className="text-green-400">$</span> make output/prod      <span className="text-gray-600"># Verify endpoints</span></div>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-gray-900/80 border border-gray-800">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span className="text-cyan-400">5.</span> Cleanup
            </h4>
            <div className="font-mono text-sm space-y-1 text-gray-400">
              <div><span className="text-green-400">$</span> make destroy/dev      <span className="text-gray-600"># Tear down dev</span></div>
              <div><span className="text-green-400">$</span> make destroy/prod     <span className="text-gray-600"># Tear down prod</span></div>
              <div><span className="text-green-400">$</span> make clean-all        <span className="text-gray-600"># Clean everything</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
