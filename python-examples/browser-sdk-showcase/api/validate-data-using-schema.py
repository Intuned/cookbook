# https://docs.intunedhq.com/automation-sdks/intuned-sdk/python/helpers/functions/validate_data_using_schema
from typing import TypedDict

from intuned_browser import validate_data_using_schema
from playwright.async_api import Page


class Params(TypedDict):
    pass

async def automation(page: Page, params: Params | None = None, **_kwargs):
    upload_data = {
        "file": {
            "file_name": "documents/report.pdf",
            "bucket": "my-bucket",
            "region": "us-east-1",
            "key": "documents/report.pdf",
            "endpoint": None,
            "suggested_file_name": "Monthly Report.pdf",
            "file_type": "document"
        },
        "name": "Test File Upload"
    }
    upload_schema = {
        "type": "object",
        "required": ["file", "name"],
        "properties": {
            "file": {"type": "attachment"},
            "name": {"type": "string"}
        }
    }
    validate_data_using_schema(upload_data, upload_schema)
    # Validation passes with Attachment type, it also validates Pydantic Attachment type.
    print("Validation passed")
    return {
        "status": "valid",
        "message": "Data validation passed successfully",
        "validated_data": upload_data
    }
