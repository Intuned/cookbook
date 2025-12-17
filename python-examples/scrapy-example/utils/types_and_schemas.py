from pydantic import BaseModel, Field


class ListParams(BaseModel):
    url: str = Field(..., description="The URL to scrape")
    max_pages: int = Field(5, description="The maximum number of pages to scrape")


class Quote(BaseModel):
    text: str = Field(..., description="The text of the quote")
    author: str = Field(..., description="The author of the quote")
    tags: list[str] = Field(default_factory=list, description="The tags of the quote")
