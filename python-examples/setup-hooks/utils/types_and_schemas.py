from typing import Any

from pydantic import BaseModel


class DemoHookParams(BaseModel):
    """Parameters for demo-hook API"""

    message: str | None = None


class DataFromHook(BaseModel):
    """Data retrieved from setup hook"""

    cdp_url: str
    api_name: str
    api_parameters: Any  # Can be dict, string, or any type
    execution_start_time: str
    config: Any  # Can be any type
    user_agent: str


class HookDemoResult(BaseModel):
    """Result returned from demo-hook API"""

    message: str
    data_from_hook: DataFromHook
    execution_time: str
    page_title: str
