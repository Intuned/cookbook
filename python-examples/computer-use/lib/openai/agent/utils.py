import os

import requests


def sanitize_message(msg: dict) -> dict:
    """Return a copy of the message with image_url omitted for computer_call_output messages."""
    if msg.get("type") == "computer_call_output":
        output = msg.get("output", {})
        if isinstance(output, dict):
            sanitized = msg.copy()
            sanitized["output"] = {**output, "image_url": "[omitted]"}
            return sanitized
    return msg


def create_response(api_key: str, base_url: str | None = None, **kwargs):
    """Call OpenAI's responses API."""
    url = (
        f"{base_url.rstrip('/')}/responses"
        if base_url
        else "https://api.openai.com/v1/responses"
    )
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    openai_org = os.getenv("OPENAI_ORG")
    if openai_org:
        headers["Openai-Organization"] = openai_org

    response = requests.post(url, headers=headers, json=kwargs)

    if response.status_code != 200:
        print(f"Error: {response.status_code} {response.text}")
        raise Exception(f"OpenAI API error: {response.status_code} {response.text}")

    return response.json()
