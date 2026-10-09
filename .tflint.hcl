# TFLint Configuration
# https://github.com/terraform-linters/tflint

config {
  call_module_type = "all"
  force            = false
  disabled_by_default = false
}

# ── AWS Rules ────────────────────────────────────────────────────────────────

# Enforce naming conventions
rule "aws_resource_missing_tags" {
  enabled = true
  tags    = ["Environment", "Project", "ManagedBy"]
}

# Require encryption for EBS volumes
rule "aws_ebs_volume_without_encryption" {
  enabled = true
}

# Check for unrestricted security group ingress
rule "aws_security_group_invalid_protocol" {
  enabled = true
}

# Ensure VPC flow logs are enabled (warn only)
rule "aws_vpc_without_flow_logs" {
  enabled = true
}

# ── General Terraform Rules ──────────────────────────────────────────────────

# Disallow deprecated (0.11-style) interpolation
rule "terraform_deprecated_interpolation" {
  enabled = true
}

# Disallow legacy dot notation syntax
rule "terraform_deprecated_index" {
  enabled = true
}

# Ensure module sources use a version
rule "terraform_module_version" {
  enabled = true
}

# Disallow outputs without description
rule "terraform_documented_outputs" {
  enabled = true
}

# Disallow variables without description
rule "terraform_documented_variables" {
  enabled = true
}

# Ensure required providers specify version constraints
rule "terraform_required_providers" {
  enabled = true
}

# Ensure Terraform version is pinned
rule "terraform_required_version" {
  enabled = true
}

# Disallow variable declarations without type
rule "terraform_typed_variables" {
  enabled = true
}

# Ensure naming convention for resources
rule "terraform_naming_convention" {
  enabled = true
}

# Ensure standard comments are present
rule "terraform_standard_module_structure" {
  enabled = true
}

# Disallow workspace interpolation
rule "terraform_workspace_remote" {
  enabled = true
}
