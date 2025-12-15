from pydantic import BaseModel, Field
from typing import List


class ListParams(BaseModel):
    url: str = Field(..., description="The URL to scrape")


class Quote(BaseModel):
    text: str = Field(..., description="The text of the quote")
    author: str | None = Field(None, description="The author of the quote")
    tags: List[str] | None = Field(
        default_factory=list, description="The tags of the quote"
    )
