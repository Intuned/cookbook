from datetime import datetime

from intuned_browser import go_to_url
from intuned_runtime import attempt_store
from playwright.async_api import Page
from pydantic import ValidationError
from utils.types_and_schemas import (
    DataFromHook,
    DemoHookParams,
    HookDemoResult,
)


async def automation(page: Page, params: dict | None = None, **_kwargs) -> dict:
    """
    Setup Hooks Demo API

    This function demonstrates how to:
    1. Retrieve data stored by the setup hook
    2. Use the stored CDP URL for browser operations
    3. Calculate execution time using hook timestamps
    """
    print("=== Setup Hooks Demo API ===\n")

    # Validate parameters using Pydantic schema
    if not params:
        params = {}

    try:
        validated_params = DemoHookParams(**params)
    except ValidationError as e:
        errors = ", ".join([f"{err['loc'][0]}: {err['msg']}" for err in e.errors()])
        raise ValueError(f"Parameter validation failed: {errors}")

    message = validated_params.message or "Hello from Setup Hooks!"

    # Step 1: Retrieve data that was stored by the setup hook
    print("📦 Retrieving data from setup hook...\n")

    cdp_url = attempt_store.get("cdp_url")
    api_name = attempt_store.get("api_name")
    api_parameters = attempt_store.get("api_parameters")
    execution_start_time = attempt_store.get("execution_start_time")
    config = attempt_store.get("config")
    user_agent = attempt_store.get("user_agent")

    print("✓ Data retrieved from attempt_store:")
    print(f"  - CDP URL: {cdp_url}")
    print(f"  - API Name: {api_name}")
    print(f"  - Execution Start: {execution_start_time}")
    print(f"  - User Agent: {user_agent}")
    print(f"  - Config: {config}")

    # Step 2: Use the page (connected via CDP thanks to the hook)
    print("\n🌐 Navigating to example.com...")
    await go_to_url(page, url="https://example.com")
    page_title = await page.title()
    print(f"✓ Page Title: {page_title}")

    # Step 3: Calculate execution time
    end_time = datetime.now()
    start_time = datetime.fromisoformat(execution_start_time)
    execution_ms = int((end_time - start_time).total_seconds() * 1000)
    execution_time = f"{execution_ms}ms"
    print(f"\n⏱️  Total Execution Time: {execution_time}")

    print("\n✅ Setup Hooks Demo Complete!\n")

    result = HookDemoResult(
        message=message,
        data_from_hook=DataFromHook(
            cdp_url=cdp_url,
            api_name=api_name,
            api_parameters=api_parameters,
            execution_start_time=execution_start_time,
            config=config,
            user_agent=user_agent,
        ),
        execution_time=execution_time,
        page_title=page_title,
    )

    # Use mode='json' to serialize all Pydantic types to JSON-compatible primitives
    return result.model_dump(mode="json")
