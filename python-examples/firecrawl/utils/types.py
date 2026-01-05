from typing import Literal, TypedDict


class LocationParams(TypedDict, total=False):
    country: str
    languages: list[str]


FormatType = Literal["markdown", "html", "rawHtml", "links", "images", "screenshot"]
