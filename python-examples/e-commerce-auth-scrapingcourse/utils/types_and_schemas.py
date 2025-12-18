from intuned_browser import Attachment
from pydantic import BaseModel, HttpUrl, field_validator
from typing import List


class DetailsSchema(BaseModel):
    name: str
    detailsUrl: HttpUrl

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or len(v.strip()) < 1:
            raise ValueError("Product name is required")
        return v


class ProductVariant(BaseModel):
    sku: str
    size: str
    color: str
    availability: str
    stock: int


class ProductDetails(BaseModel):
    name: str
    detailsUrl: str
    price: str
    id: str
    category: str
    shortDescription: str
    fullDescription: str
    availableSizes: List[str]
    availableColors: List[str]
    variants: List[ProductVariant]
    imageAttachments: List[Attachment]
