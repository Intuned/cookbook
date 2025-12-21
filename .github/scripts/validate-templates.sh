#!/bin/bash
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

error() {
    echo -e "${RED}ERROR:${NC} $1"
    ERRORS=$((ERRORS + 1))
}

warning() {
    echo -e "${YELLOW}WARNING:${NC} $1"
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

# Check a single template directory
validate_template() {
    local dir="$1"
    local lang="$2"  # "typescript" or "python"
    local template_name
    template_name=$(basename "$dir")

    echo ""
    echo "=========================================="
    echo "Validating: $lang/$template_name"
    echo "=========================================="

    local ext="ts"
    [[ "$lang" == "python" ]] && ext="py"

    # -------------------------------------------
    # 1. Check Intuned.jsonc exists (not .json)
    # -------------------------------------------
    if [[ -f "$dir/Intuned.json" ]]; then
        error "[$template_name] Found Intuned.json - must use Intuned.jsonc instead"
    fi

    if [[ ! -f "$dir/Intuned.jsonc" ]]; then
        error "[$template_name] Missing Intuned.jsonc"
        return
    fi
    success "[$template_name] Intuned.jsonc exists"

    # Parse Intuned.jsonc (strip comments for jq)
    # Use a more precise pattern that only removes line comments starting with // at line start or after whitespace
    # but preserves // inside strings (like URLs)
    local config
    config=$(grep -v '^\s*//' "$dir/Intuned.jsonc" | sed 's|/\*.*\*/||g')

    # -------------------------------------------
    # 2. Validate metadata.template.name
    # -------------------------------------------
    local meta_name
    meta_name=$(echo "$config" | jq -r '.metadata.template.name // empty' 2>/dev/null || echo "")

    if [[ -z "$meta_name" ]]; then
        error "[$template_name] Missing metadata.template.name in Intuned.jsonc"
    else
        if ! validate_template_name "$meta_name"; then
            error "[$template_name] metadata.template.name '$meta_name' must be lowercase with hyphens only (e.g., 'my-template')"
        else
            success "[$template_name] metadata.template.name is valid: $meta_name"
        fi
    fi

    # -------------------------------------------
    # 3. Validate metadata.template.description
    # -------------------------------------------
    local meta_desc
    meta_desc=$(echo "$config" | jq -r '.metadata.template.description // empty' 2>/dev/null || echo "")

    if [[ -z "$meta_desc" ]]; then
        error "[$template_name] Missing metadata.template.description in Intuned.jsonc"
    else
        success "[$template_name] metadata.template.description is set"
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
        error "[$template_name] apiAccess.enabled is not explicitly set in Intuned.jsonc (required when auth is enabled)"
    elif [[ "$api_access" != "null" ]]; then
        success "[$template_name] apiAccess.enabled is set to: $api_access"
    fi

    if [[ "$auth_enabled" == "true" ]]; then
        info "[$template_name] Auth sessions are enabled"

        # Check testAuthSessionInput exists
        local test_auth_input
        test_auth_input=$(echo "$config" | jq '.metadata.testAuthSessionInput // empty' 2>/dev/null || echo "")
        if [[ -z "$test_auth_input" || "$test_auth_input" == "{}" || "$test_auth_input" == "null" ]]; then
            warning "[$template_name] authSessions.enabled=true but metadata.testAuthSessionInput is not set"
        else
            success "[$template_name] metadata.testAuthSessionInput is set"
        fi

        # Check auth-sessions/check exists
        if [[ ! -f "$dir/auth-sessions/check.$ext" ]]; then
            error "[$template_name] authSessions.enabled=true but auth-sessions/check.$ext is missing"
        else
            success "[$template_name] auth-sessions/check.$ext exists"
        fi

        # Check auth-sessions/create exists
        if [[ ! -f "$dir/auth-sessions/create.$ext" ]]; then
            error "[$template_name] authSessions.enabled=true but auth-sessions/create.$ext is missing"
        else
            success "[$template_name] auth-sessions/create.$ext exists"
        fi

        # Check auth-sessions-instances directory
        if [[ ! -d "$dir/auth-sessions-instances/test-auth-session" ]]; then
            error "[$template_name] auth-sessions-instances/test-auth-session/ directory is missing (run 'intuned run authsession create .parameters/auth-sessions/create/default.json --id test-auth-session' to create it)"
        else
            success "[$template_name] auth-sessions-instances/test-auth-session/ exists"
        fi

        # Check .parameters/auth-sessions
        if [[ ! -f "$dir/.parameters/auth-sessions/check/default.json" ]]; then
            error "[$template_name] Missing .parameters/auth-sessions/check/default.json"
        else
            success "[$template_name] .parameters/auth-sessions/check/default.json exists"
        fi

        if [[ ! -f "$dir/.parameters/auth-sessions/create/default.json" ]]; then
            error "[$template_name] Missing .parameters/auth-sessions/create/default.json"
        else
            success "[$template_name] .parameters/auth-sessions/create/default.json exists"
        fi
    fi

    # -------------------------------------------
    # 6. Check .parameters/api folder structure
    # -------------------------------------------
    if [[ ! -d "$dir/.parameters/api" ]]; then
        error "[$template_name] Missing .parameters/api/ directory"
    else
        success "[$template_name] .parameters/api/ directory exists"

        # Check each API has corresponding parameters
        if [[ -d "$dir/api" ]]; then
            for api_file in "$dir/api"/*."$ext"; do
                [[ -e "$api_file" ]] || continue
                local api_name
                api_name=$(basename "$api_file" ".$ext")

                if [[ ! -f "$dir/.parameters/api/$api_name/default.json" ]]; then
                    error "[$template_name] API '$api_name' missing .parameters/api/$api_name/default.json"
                else
                    success "[$template_name] .parameters/api/$api_name/default.json exists"
                fi
            done
        fi
    fi

    # -------------------------------------------
    # 7. Check README.md quality
    # -------------------------------------------
    if [[ -f "$dir/README.md" ]]; then
        # Check for Intuned.json reference (should be Intuned.jsonc)
        if grep -q "intuned\.json" "$dir/README.md" 2>/dev/null || grep -q "Intuned\.json[^c]" "$dir/README.md" 2>/dev/null; then
            warning "[$template_name] README.md references 'Intuned.json' - should be 'Intuned.jsonc'"
        fi

        # Check for inline JSON in run commands
        if grep -E "intuned run .+ '\{\}'" "$dir/README.md" 2>/dev/null || grep -E 'intuned run .+ "\{\}"' "$dir/README.md" 2>/dev/null; then
            warning "[$template_name] README.md uses inline JSON '{}' - should use .parameters/ paths"
        fi

        success "[$template_name] README.md exists"
    else
        warning "[$template_name] README.md is missing"
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
