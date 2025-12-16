from pydantic import BaseModel, Field
from typing import List


class ListParams(BaseModel):
    url: str = Field(..., description="The URL to scrape")
    max_pages: int = Field(
        default=10, description="The maximum number of pages to scrape"
    )


class DetailsParams(BaseModel):
    details_url: str = Field(..., description="The URL to the product details")
    title: str = Field(..., description="The title of the product")
    price: str | None = Field(default=None, description="The price of the product")


class Product(BaseModel):
    title: str = Field(..., description="The title of the product")
    price: str | None = Field(default=None, description="The price of the product")
    details_url: str = Field(..., description="The URL to the product details")


class ProductDetails(BaseModel):
    title: str = Field(..., description="The title of the product")
    price: str | None = Field(default=None, description="The price of the product")
    details_url: str = Field(..., description="The URL to the product details")
    description: str | None = Field(
        default=None, description="The description of the product"
    )
    sku: str | None = Field(default=None, description="The SKU of the product")
    category: str | None = Field(
        default=None, description="The category of the product"
    )
    sizes: List[str] | None = Field(
        default_factory=list, description="The sizes of the product"
    )
    colors: List[str] | None = Field(
        default_factory=list, description="The colors of the product"
    )
    images: List[str] | None = Field(
        default_factory=list, description="The images of the product"
    )
