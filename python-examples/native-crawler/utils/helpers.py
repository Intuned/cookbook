import uuid
from runtime.context import IntunedContext


def sanitize_key(key: str) -> str:
    for char in ["://", "/", ":", "#", "?", "&", "=", ".", "-"]:
        key = key.replace(char, "_")
    while "__" in key:
        key = key.replace("__", "_")
    return key.strip("_")


def get_job_run_id():
    run_context = IntunedContext.current().run_context
    if not run_context or not run_context.job_run_id:
        return f"local-{uuid.uuid4()}"
    return run_context.job_run_id
