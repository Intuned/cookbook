def sanitize_key(key: str) -> str:
    for char in ["://", "/", ":", "#", "?", "&", "=", ".", "-"]:
        key = key.replace(char, "_")
    while "__" in key:
        key = key.replace("__", "_")
    return key.strip("_")
