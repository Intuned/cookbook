#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0
declare -a ERROR_MESSAGES=()
declare -a WARNING_MESSAGES=()

# Allowed tags - only these tags are permitted in Intuned.jsonc files
ALLOWED_TAGS=(
    "starter"
    "scraping"
    "rpa"
    "crawling"
    "auth-sessions"
    "2fa"
    "captcha"
    "computer-use"
    "stagehand"
    "browser-use"
    "browser-sdk"
    "e-commerce"
    "crawl4ai"
)

error() {
    echo -e "${RED}ERROR:${NC} $1"
    ERROR_MESSAGES+=("$1")
    ERRORS=$((ERRORS + 1))
}

warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
    WARNING_MESSAGES+=("$1")
    WARNINGS=$((WARNINGS + 1))
}

success() {
    echo -e "${GREEN}OK:${NC} $1"
}

info() {
    echo -e "INFO: $1"
}

# Validate template name format (lowercase with hyphens only)
validate_template_name() {
    local name="$1"
    if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        return 1
    fi
    return 0
}

# Validate API filename format (kebab-case: lowercase letters, numbers, and hyphens)
validate_api_name() {
    local name="$1"
    # Remove extension and check format
    local base_name="${name%.*}"
    if [[ ! "$base_name" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
        return 1
    fi
    return 0
}

# Check a single template directory
validate_template() {
    local dir="$1"
    local lang="$2"  # "typescript" or "python"
    local template_name
    template_name=$(basename "$dir")
    local full_path="$lang-examples/$template_name"

    echo ""
    echo "=========================================="
    echo "Validating: $full_path"
    echo "File: $dir/Intuned.jsonc"
    echo "=========================================="

    local ext="ts"
    [[ "$lang" == "python" ]] && ext="py"

    # -------------------------------------------
    # 1. Check Intuned.jsonc exists (not .json)
    # -------------------------------------------
    if [[ -f "$dir/Intuned.json" ]]; then
        error "[$full_path] Found Intuned.json - must use Intuned.jsonc instead"
    fi

    if [[ ! -f "$dir/Intuned.jsonc" ]]; then
        error "[$full_path] Missing Intuned.jsonc"
        return
    fi
    success "[$full_path] Intuned.jsonc exists"

    # Parse Intuned.jsonc (strip comments for jq)
    # Use a more precise pattern that only removes line comments starting with // at line start or after whitespace
    # but preserves // inside strings (like URLs)
    local config
    config=$(grep -v '^\s*//' "$dir/Intuned.jsonc" | sed 's|/\*.*\*/||g')

    # -------------------------------------------
    # 1a. Validate JSON syntax first
    # -------------------------------------------
    local jq_error
    jq_error=$(echo "$config" | jq empty 2>&1)
    if [ $? -ne 0 ]; then
        error "[$full_path] Invalid JSON syntax in Intuned.jsonc"
        error "[$full_path] JSON error: $jq_error"
        error "[$full_path] Fix: Check for trailing commas, missing braces, or other syntax errors in $dir/Intuned.jsonc"
        return
    fi
    success "[$full_path] JSON syntax is valid"

    # -------------------------------------------
    # 1b. Check for workspaceId field (should not be committed)
    # -------------------------------------------
    local workspace_id
    workspace_id=$(echo "$config" | jq -r '.workspaceId // empty' 2>/dev/null || echo "")

    if [[ -n "$workspace_id" && "$workspace_id" != "null" ]]; then
        error "[$full_path] Intuned.jsonc contains 'workspaceId' field - this should not be committed"
        error "[$full_path] Quick fix: jq 'del(.workspaceId)' $dir/Intuned.jsonc | sponge $dir/Intuned.jsonc"
    else
        success "[$full_path] No workspaceId field found"
    fi

    # -------------------------------------------
    # 2. Validate metadata.template.name
    # -------------------------------------------
    local meta_name
    meta_name=$(echo "$config" | jq -r '.metadata.template.name // empty' 2>/dev/null || echo "")

    if [[ -z "$meta_name" ]]; then
        error "[$full_path] Missing metadata.template.name in Intuned.jsonc"
        error "[$full_path] Add this field to metadata.template section in $dir/Intuned.jsonc"
    else
        if ! validate_template_name "$meta_name"; then
            error "[$full_path] metadata.template.name '$meta_name' must be lowercase with hyphens only (e.g., 'my-template')"
        else
            success "[$full_path] metadata.template.name is valid: $meta_name"
        fi
    fi

    # -------------------------------------------
    # 3. Validate metadata.template.description
    # -------------------------------------------
    local meta_desc
    meta_desc=$(echo "$config" | jq -r '.metadata.template.description // empty' 2>/dev/null || echo "")

    if [[ -z "$meta_desc" ]]; then
        error "[$full_path] Missing metadata.template.description in Intuned.jsonc"
        error "[$full_path] Add this field to metadata.template section in $dir/Intuned.jsonc"
    else
        success "[$full_path] metadata.template.description is set"
    fi

    # -------------------------------------------
    # 3b. Check tags (validate against allowed list)
    # Tags can be at metadata.template.tags or metadata.tags
    # -------------------------------------------
    local tags_location=""
    local tags_count=0

    # Check metadata.template.tags first (preferred location)
    local template_tags
    template_tags=$(echo "$config" | jq -r '.metadata.template.tags // empty' 2>/dev/null || echo "")
    if [[ -n "$template_tags" && "$template_tags" != "null" ]]; then
        tags_count=$(echo "$config" | jq '.metadata.template.tags | length' 2>/dev/null || echo "0")
        if [[ "$tags_count" -gt 0 ]]; then
            tags_location="metadata.template.tags"
        fi
    fi

    # If not found at correct location, check metadata.tags (wrong location)
    if [[ -z "$tags_location" ]]; then
        local meta_tags
        meta_tags=$(echo "$config" | jq -r '.metadata.tags // empty' 2>/dev/null || echo "")
        if [[ -n "$meta_tags" && "$meta_tags" != "null" ]]; then
            tags_count=$(echo "$config" | jq '.metadata.tags | length' 2>/dev/null || echo "0")
            if [[ "$tags_count" -gt 0 ]]; then
                tags_location="metadata.tags"
            fi
        fi
    fi

    if [[ -z "$tags_location" ]]; then
        error "[$full_path] tags not set (required for categorization)"
        error "[$full_path] Add tags to metadata.template.tags. Allowed: ${ALLOWED_TAGS[*]}"
    elif [[ "$tags_count" -eq 0 ]]; then
        error "[$full_path] tags array is empty (at least one tag required)"
        error "[$full_path] Allowed tags: ${ALLOWED_TAGS[*]}"
    else
        # Report location error if tags are in wrong place
        if [[ "$tags_location" == "metadata.tags" ]]; then
            error "[$full_path] tags found at wrong location (metadata.tags) - must be inside metadata.template.tags"
            error "[$full_path] Move tags array from metadata.tags to metadata.template.tags in $dir/Intuned.jsonc"
        else
            success "[$full_path] tags found at $tags_location with $tags_count tag(s)"
        fi

        # Validate each tag against allowed list (regardless of location)
        local invalid_tags=()
        local jq_path=".metadata.template.tags[]"
        [[ "$tags_location" == "metadata.tags" ]] && jq_path=".metadata.tags[]"

        while IFS= read -r tag; do
            [[ -z "$tag" ]] && continue
            local is_valid=false
            for allowed in "${ALLOWED_TAGS[@]}"; do
                if [[ "$tag" == "$allowed" ]]; then
                    is_valid=true
                    break
                fi
            done
            if [[ "$is_valid" == "false" ]]; then
                invalid_tags+=("$tag")
            fi
        done < <(echo "$config" | jq -r "$jq_path" 2>/dev/null)

        if [[ ${#invalid_tags[@]} -gt 0 ]]; then
            error "[$full_path] Invalid tag(s): ${invalid_tags[*]}"
            error "[$full_path] Allowed tags: ${ALLOWED_TAGS[*]}"
        else
            success "[$full_path] All tags are valid"
        fi
    fi

    # -------------------------------------------
    # 3c. Check defaultRunPlaygroundInput structure
    # -------------------------------------------
    local playground_input
    playground_input=$(echo "$config" | jq '.metadata.defaultRunPlaygroundInput // empty' 2>/dev/null || echo "")

    if [[ -n "$playground_input" && "$playground_input" != "null" && "$playground_input" != "{}" ]]; then
        # Check if it uses wrong key "api" instead of "apiName"
        local has_api_key
        has_api_key=$(echo "$config" | jq '.metadata.defaultRunPlaygroundInput | has("api")' 2>/dev/null || echo "false")
        local has_apiName_key
        has_apiName_key=$(echo "$config" | jq '.metadata.defaultRunPlaygroundInput | has("apiName")' 2>/dev/null || echo "false")

        if [[ "$has_api_key" == "true" ]]; then
            error "[$full_path] metadata.defaultRunPlaygroundInput uses 'api' key - should be 'apiName'"
        elif [[ "$has_apiName_key" == "true" ]]; then
            success "[$full_path] metadata.defaultRunPlaygroundInput uses correct 'apiName' key"

            # Validate that the referenced API actually exists
            local referenced_api
            referenced_api=$(echo "$config" | jq -r '.metadata.defaultRunPlaygroundInput.apiName // empty' 2>/dev/null || echo "")
            if [[ -n "$referenced_api" ]]; then
                if [[ ! -f "$dir/api/$referenced_api.$ext" ]]; then
                    error "[$full_path] metadata.defaultRunPlaygroundInput.apiName '$referenced_api' references non-existent API (expected: api/$referenced_api.$ext)"
                else
                    success "[$full_path] metadata.defaultRunPlaygroundInput.apiName '$referenced_api' references existing API"
                fi
            fi
        else
            warning "[$full_path] metadata.defaultRunPlaygroundInput is set but missing 'apiName' key"
        fi
    else
        # Warn if defaultRunPlaygroundInput is missing (useful for templates to set a default)
        warning "[$full_path] metadata.defaultRunPlaygroundInput is not set (recommended to specify default API for playground)"
    fi

    # -------------------------------------------
    # 4. Check authSessions configuration
    # -------------------------------------------
    local auth_enabled
    auth_enabled=$(echo "$config" | jq -r '.authSessions.enabled // false' 2>/dev/null || echo "false")

    # -------------------------------------------
    # 5. Check apiAccess.enabled (only warn if auth is enabled)
    # -------------------------------------------
    local api_access
    api_access=$(echo "$config" | jq '.apiAccess.enabled' 2>/dev/null || echo "null")

    if [[ "$api_access" == "null" && "$auth_enabled" == "true" ]]; then
        error "[$full_path] apiAccess.enabled is not explicitly set in Intuned.jsonc (required when auth is enabled)"
    elif [[ "$api_access" != "null" ]]; then
        success "[$full_path] apiAccess.enabled is set to: $api_access"
    fi

    if [[ "$auth_enabled" == "true" ]]; then
        info "[$full_path] Auth sessions are enabled"

        # Check testAuthSessionInput exists
        local test_auth_input
        test_auth_input=$(echo "$config" | jq '.metadata.testAuthSessionInput // empty' 2>/dev/null || echo "")
        if [[ -z "$test_auth_input" || "$test_auth_input" == "{}" || "$test_auth_input" == "null" ]]; then
            warning "[$full_path] authSessions.enabled=true but metadata.testAuthSessionInput is not set"
        else
            success "[$full_path] metadata.testAuthSessionInput is set"
        fi

        # Check auth-sessions/check exists
        if [[ ! -f "$dir/auth-sessions/check.$ext" ]]; then
            error "[$full_path] authSessions.enabled=true but auth-sessions/check.$ext is missing"
            error "[$full_path] Create file: $dir/auth-sessions/check.$ext"
        else
            success "[$full_path] auth-sessions/check.$ext exists"
        fi

        # Check auth-sessions/create exists
        if [[ ! -f "$dir/auth-sessions/create.$ext" ]]; then
            error "[$full_path] authSessions.enabled=true but auth-sessions/create.$ext is missing"
            error "[$full_path] Create file: $dir/auth-sessions/create.$ext"
        else
            success "[$full_path] auth-sessions/create.$ext exists"
        fi

        # Check auth-sessions-instances directory
        if [[ ! -d "$dir/auth-sessions-instances/test-auth-session" ]]; then
            error "[$full_path] auth-sessions-instances/test-auth-session/ directory is missing"
            error "[$full_path] Run: cd $dir && intuned run authsession create .parameters/auth-sessions/create/default.json --id test-auth-session"
        else
            success "[$full_path] auth-sessions-instances/test-auth-session/ exists"
        fi

        # Check .parameters/auth-sessions
        if [[ ! -f "$dir/.parameters/auth-sessions/check/default.json" ]]; then
            error "[$full_path] Missing .parameters/auth-sessions/check/default.json"
        else
            success "[$full_path] .parameters/auth-sessions/check/default.json exists"
        fi

        if [[ ! -f "$dir/.parameters/auth-sessions/create/default.json" ]]; then
            error "[$full_path] Missing .parameters/auth-sessions/create/default.json"
        else
            success "[$full_path] .parameters/auth-sessions/create/default.json exists"
        fi
    fi

    # -------------------------------------------
    # 6. Check .parameters/api folder structure
    # -------------------------------------------
    if [[ ! -d "$dir/.parameters/api" ]]; then
        error "[$full_path] Missing .parameters/api/ directory"
        error "[$full_path] Create directory: mkdir -p $dir/.parameters/api"
    else
        success "[$full_path] .parameters/api/ directory exists"

        # Check each API has corresponding parameters (including nested APIs)
        # Also validate API filenames use kebab-case
        if [[ -d "$dir/api" ]]; then
            while IFS= read -r api_file; do
                [[ -z "$api_file" ]] && continue
                # Get relative path from api/ directory without extension
                local relative_path
                relative_path="${api_file#$dir/api/}"
                relative_path="${relative_path%.$ext}"

                # Get just the filename for kebab-case validation
                local api_filename
                api_filename=$(basename "$api_file")

                # Validate API filename is kebab-case
                if ! validate_api_name "$api_filename"; then
                    error "[$full_path] API filename '$api_filename' must be kebab-case (lowercase letters, numbers, and hyphens)"
                    error "[$full_path] Example: 'get-user.$ext' or '01-intro.$ext' | File: $api_file"
                else
                    success "[$full_path] API filename '$api_filename' uses correct kebab-case format"
                fi

                # Check that at least one parameter file exists (not necessarily default.json)
                if [[ ! -d "$dir/.parameters/api/$relative_path" ]]; then
                    error "[$full_path] API '$relative_path' missing .parameters/api/$relative_path/ directory"
                    error "[$full_path] Create: mkdir -p $dir/.parameters/api/$relative_path && echo '{}' > $dir/.parameters/api/$relative_path/default.json"
                else
                    local param_count
                    param_count=$(find "$dir/.parameters/api/$relative_path" -maxdepth 1 -type f -name "*.json" 2>/dev/null | wc -l)
                    if [[ "$param_count" -eq 0 ]]; then
                        error "[$full_path] API '$relative_path' has no parameter files in .parameters/api/$relative_path/"
                        error "[$full_path] Create: echo '{}' > $dir/.parameters/api/$relative_path/default.json"
                    else
                        success "[$full_path] .parameters/api/$relative_path/ has $param_count parameter file(s)"
                    fi
                fi
            done < <(find "$dir/api" -type f -name "*.$ext" 2>/dev/null)
        fi

        # Check for extra parameter directories that don't have corresponding APIs
        while IFS= read -r param_dir; do
            [[ -z "$param_dir" ]] && continue
            # Get relative path: .parameters/api/{path} -> {path}
            local param_path
            param_path="${param_dir#$dir/.parameters/api/}"
            
            # Skip if this directory has subdirectories (nested structure)
            if find "$param_dir" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | grep -q .; then
                continue
            fi

            # Check if corresponding API file exists
            if [[ ! -f "$dir/api/$param_path.$ext" ]]; then
                warning "[$full_path] Parameter directory '.parameters/api/$param_path/' has no corresponding API file"
            fi
        done < <(find "$dir/.parameters/api" -mindepth 1 -type d 2>/dev/null)
    fi

    # -------------------------------------------
    # 7. Check README.md quality
    # -------------------------------------------
    if [[ -f "$dir/README.md" ]]; then
        # Check for Intuned.json reference (should be Intuned.jsonc)
        if grep -q "intuned\.json" "$dir/README.md" 2>/dev/null || grep -q "Intuned\.json[^c]" "$dir/README.md" 2>/dev/null; then
            warning "[$full_path] README.md references 'Intuned.json' - should be 'Intuned.jsonc'"
        fi

        # Check for inline JSON in run commands
        if grep -E "intuned run .+ '\{\}'" "$dir/README.md" 2>/dev/null || grep -E 'intuned run .+ "\{\}"' "$dir/README.md" 2>/dev/null; then
            warning "[$full_path] README.md uses inline JSON '{}' - should use .parameters/ paths"
        fi

        # Check for unsubstituted template placeholders in run commands
        if grep -E "<api-name>|<parameters>" "$dir/README.md" 2>/dev/null; then
            error "[$full_path] README.md contains placeholder '<api-name>' or '<parameters>'"
            error "[$full_path] Add concrete run examples using .parameters/api/{api-name}/default.json paths"
        fi

        # Check for poetry/pip references in Python projects (should use uv)
        if [[ "$lang" == "python" ]]; then
            if grep -qiE '\bpoetry\b' "$dir/README.md" 2>/dev/null; then
                error "[$full_path] README.md references 'poetry' - should use 'uv' instead"
            fi
            if grep -qiE '\bpip install\b' "$dir/README.md" 2>/dev/null; then
                error "[$full_path] README.md references 'pip install' - should use 'uv' instead"
            fi
        fi

        success "[$full_path] README.md exists"
    else
        warning "[$full_path] README.md is missing"
    fi
}

# Main execution
echo "============================================"
echo "  Intuned Template Validation"
echo "============================================"

# Get the repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Validate TypeScript examples
if [[ -d "$REPO_ROOT/typescript-examples" ]]; then
    for template_dir in "$REPO_ROOT/typescript-examples"/*/; do
        [[ -d "$template_dir" ]] || continue
        # Skip if it's just a file, not a directory with Intuned.jsonc
        if [[ -f "${template_dir}Intuned.jsonc" ]] || [[ -f "${template_dir}Intuned.json" ]]; then
            validate_template "$template_dir" "typescript"
        fi
    done
fi

# Validate Python examples
if [[ -d "$REPO_ROOT/python-examples" ]]; then
    for template_dir in "$REPO_ROOT/python-examples"/*/; do
        [[ -d "$template_dir" ]] || continue
        # Skip if it's just a file, not a directory with Intuned.jsonc
        if [[ -f "${template_dir}Intuned.jsonc" ]] || [[ -f "${template_dir}Intuned.json" ]]; then
            validate_template "$template_dir" "python"
        fi
    done
fi

# -------------------------------------------
# README Sync Validation
# -------------------------------------------
echo ""
echo "=========================================="
echo "Validating README Sync"
echo "=========================================="

# Get list of actual template directories (with Intuned.jsonc)
declare -a TS_TEMPLATES=()
declare -a PY_TEMPLATES=()

for template_dir in "$REPO_ROOT/typescript-examples"/*/; do
    [[ -d "$template_dir" ]] || continue
    if [[ -f "${template_dir}Intuned.jsonc" ]]; then
        TS_TEMPLATES+=("$(basename "$template_dir")")
    fi
done

for template_dir in "$REPO_ROOT/python-examples"/*/; do
    [[ -d "$template_dir" ]] || continue
    if [[ -f "${template_dir}Intuned.jsonc" ]]; then
        PY_TEMPLATES+=("$(basename "$template_dir")")
    fi
done

# Extract template links from README files
# Pattern matches: [name](./path/) or [name](./typescript-examples/path/) etc.
extract_readme_links() {
    local readme_file="$1"
    local prefix="$2"  # e.g., "./typescript-examples/" or "./"

    if [[ ! -f "$readme_file" ]]; then
        return
    fi

    # Extract folder names from markdown links
    grep -oE "\]\($prefix[^/)]+/?\)" "$readme_file" 2>/dev/null | \
        sed -E "s|\]\($prefix||g; s|/?\)||g" | \
        sort -u
}

# Check Root README
echo ""
echo "--- Root README.md ---"

if [[ -f "$REPO_ROOT/README.md" ]]; then
    # Extract TypeScript links from root README
    ROOT_TS_LINKS=$(extract_readme_links "$REPO_ROOT/README.md" "\./typescript-examples/")

    # Check each TS template is in root README
    for template in "${TS_TEMPLATES[@]}"; do
        if ! echo "$ROOT_TS_LINKS" | grep -qx "$template"; then
            error "[Root README] TypeScript template '$template' is missing from README.md"
        fi
    done

    # Check for stale TS links in root README
    while IFS= read -r linked; do
        [[ -z "$linked" ]] && continue
        found=false
        for template in "${TS_TEMPLATES[@]}"; do
            if [[ "$template" == "$linked" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            warning "[Root README] TypeScript link '$linked' references non-existent template"
        fi
    done <<< "$ROOT_TS_LINKS"

    # Extract Python links from root README
    ROOT_PY_LINKS=$(extract_readme_links "$REPO_ROOT/README.md" "\./python-examples/")

    # Check each PY template is in root README
    for template in "${PY_TEMPLATES[@]}"; do
        if ! echo "$ROOT_PY_LINKS" | grep -qx "$template"; then
            error "[Root README] Python template '$template' is missing from README.md"
        fi
    done

    # Check for stale PY links in root README
    while IFS= read -r linked; do
        [[ -z "$linked" ]] && continue
        found=false
        for template in "${PY_TEMPLATES[@]}"; do
            if [[ "$template" == "$linked" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            warning "[Root README] Python link '$linked' references non-existent template"
        fi
    done <<< "$ROOT_PY_LINKS"

    success "[Root README] Checked for sync with template directories"
else
    error "[Root README] README.md is missing"
fi

# Check typescript-examples/README.md
echo ""
echo "--- typescript-examples/README.md ---"

if [[ -f "$REPO_ROOT/typescript-examples/README.md" ]]; then
    TS_README_LINKS=$(extract_readme_links "$REPO_ROOT/typescript-examples/README.md" "\./")

    # Check each TS template is in TS README
    for template in "${TS_TEMPLATES[@]}"; do
        if ! echo "$TS_README_LINKS" | grep -qx "$template"; then
            error "[typescript-examples/README] Template '$template' is missing"
        fi
    done

    # Check for stale links
    while IFS= read -r linked; do
        [[ -z "$linked" ]] && continue
        # Skip links that go to parent directories
        [[ "$linked" == typescript-examples* ]] && continue
        found=false
        for template in "${TS_TEMPLATES[@]}"; do
            if [[ "$template" == "$linked" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            warning "[typescript-examples/README] Link '$linked' references non-existent template"
        fi
    done <<< "$TS_README_LINKS"

    success "[typescript-examples/README] Checked for sync"
else
    error "[typescript-examples/README] README.md is missing"
fi

# Check python-examples/README.md
echo ""
echo "--- python-examples/README.md ---"

if [[ -f "$REPO_ROOT/python-examples/README.md" ]]; then
    PY_README_LINKS=$(extract_readme_links "$REPO_ROOT/python-examples/README.md" "\./")

    # Check each PY template is in PY README
    for template in "${PY_TEMPLATES[@]}"; do
        if ! echo "$PY_README_LINKS" | grep -qx "$template"; then
            error "[python-examples/README] Template '$template' is missing"
        fi
    done

    # Check for stale links
    while IFS= read -r linked; do
        [[ -z "$linked" ]] && continue
        found=false
        for template in "${PY_TEMPLATES[@]}"; do
            if [[ "$template" == "$linked" ]]; then
                found=true
                break
            fi
        done
        if [[ "$found" == "false" ]]; then
            warning "[python-examples/README] Link '$linked' references non-existent template"
        fi
    done <<< "$PY_README_LINKS"

    success "[python-examples/README] Checked for sync"
else
    error "[python-examples/README] README.md is missing"
fi

# Summary
echo ""
echo "============================================"
echo "  Validation Summary"
echo "============================================"
echo -e "Errors:   ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"

# Display all errors
if [[ $ERRORS -gt 0 ]]; then
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}All Errors:${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    for i in "${!ERROR_MESSAGES[@]}"; do
        echo -e "${RED}$((i + 1)).${NC} ${ERROR_MESSAGES[$i]}"
    done
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

# Display all warnings
if [[ $WARNINGS -gt 0 ]]; then
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}All Warnings:${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    for i in "${!WARNING_MESSAGES[@]}"; do
        echo -e "${YELLOW}$((i + 1)).${NC} ${WARNING_MESSAGES[$i]}"
    done
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

if [[ $ERRORS -gt 0 ]]; then
    echo ""
    echo -e "${RED}Validation failed with $ERRORS error(s)${NC}"
    exit 1
fi

if [[ $WARNINGS -gt 0 ]]; then
    echo ""
    echo -e "${YELLOW}Validation passed with $WARNINGS warning(s)${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}All validations passed!${NC}"
exit 0
