import os
from datetime import datetime
from intuned_runtime import attempt_store


async def setup_context(*, api_name: str, api_parameters: str, cdp_url: str):
    """
    Setup Hook - Runs before your API executes

    Purpose: Prepare data, configuration, or state that your API will need

    This hook demonstrates:
    1. Storing the CDP URL for browser connection
    2. Storing API metadata (name and parameters)
    3. Adding custom configuration or computed values
    4. Setting up timestamps for tracking
    """
    print("🔧 Setup Hook: Preparing environment...")

    # 1. Store CDP URL for browser operations
    attempt_store.set("cdp_url", cdp_url)
    print(f"  ✓ CDP URL stored: {cdp_url}")

    # 2. Store API metadata for reference
    attempt_store.set("api_name", api_name)
    attempt_store.set("api_parameters", api_parameters)
    print(f"  ✓ API Name: {api_name}")
    print(f"  ✓ Parameters: {api_parameters}")

    # 3. Add execution timestamp
    start_time = datetime.now().isoformat()
    attempt_store.set("execution_start_time", start_time)
    print(f"  ✓ Execution Start Time: {start_time}")

    # 4. Custom configuration example
    config = {
        "timeout": 30000,
        "retries": 3,
        "environment": os.getenv("ENV", "development"),
    }
    attempt_store.set("config", config)
    print(f"  ✓ Configuration stored: {config}")

    # 5. Computed values example
    user_agent = "Intuned-Bot/1.0"
    attempt_store.set("user_agent", user_agent)
    print(f"  ✓ User Agent: {user_agent}")

    print("🔧 Setup Hook: Complete!\n")
