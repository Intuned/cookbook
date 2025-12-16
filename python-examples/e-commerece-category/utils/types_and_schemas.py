from pydantic import BaseModel, Field
from typing import Optional, List


class EcommereceCategoryParams(BaseModel):
    store_url: str = Field(..., description="The URL of the store to scrape")


class EcommereceListParams(BaseModel):
    category_name: str = Field(..., description="The name of the category")
    category_url: str = Field(..., description="The URL of the category")


class EcommereceDetailsParams(BaseModel):
    name: str = Field(..., description="The name of the product")
    price: str = Field(..., description="The price of the product")
    details_url: str = Field(..., description="The URL of the product details")


class Category(BaseModel):
    category_name: str = Field(..., description="The name of the category")
    category_url: str = Field(..., description="The URL of the category")


class Product(BaseModel):
    name: str = Field(..., description="The name of the product")
    price: str = Field(..., description="The price of the product")
    details_url: str = Field(..., description="The URL of the product details")


class Size(BaseModel):
    size: str = Field(..., description="The size of the product")
    is_available: bool = Field(
        default=True, description="Whether the size is available"
    )


class ProductDetails(BaseModel):
    source_url: str = Field(..., description="The URL of the product details")
    name: str = Field(..., description="The name of the product")
    price: str = Field(..., description="The price of the product")
    sale_price: Optional[str] = Field(
        default=None, description="The sale price of the product"
    )
    sale_offer: Optional[str] = Field(
        default=None, description="The sale offer of the product"
    )
    sizes: List[Size] = Field(
        default_factory=list, description="The sizes of the product"
    )
    description: Optional[str] = Field(
        default=None, description="The description of the product"
    )
    shipping_and_returns: Optional[str] = Field(
        default=None, description="The shipping and returns of the product"
    )
