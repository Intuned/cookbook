import re

# Default tags to exclude for onlyMainContent
MAIN_CONTENT_EXCLUDED_TAGS = [
    "nav",
    "header",
    "footer",
    "aside",
    "noscript",
    "script",
    "style",
]


def get_excluded_tags(
    exclude_tags: list[str] | None = None,
    only_main_content: bool = True,
) -> list[str]:
    excluded = list(exclude_tags or [])

    if only_main_content:
        excluded.extend(
            tag for tag in MAIN_CONTENT_EXCLUDED_TAGS if tag not in excluded
        )

    return excluded


def remove_base64_images(text: str) -> str:
    return re.sub(
        r"data:image/[^;]+;base64,[A-Za-z0-9+/=]+", "[base64 image removed]", text
    )


def build_css_selector(include_tags: list[str] | None) -> str | None:
    if not include_tags:
        return None
    return ", ".join(include_tags)
