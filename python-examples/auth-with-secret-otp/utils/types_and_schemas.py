from pydantic import BaseModel, EmailStr, Field


class CreateAuthSessionParams(BaseModel):
    username: EmailStr
    password: str = Field(min_length=1, description="Password is required")
    secret: str = Field(min_length=1, description="Secret is required")


class Contract(BaseModel):
    id: str
    name: str
    supplier_name: str
    supplier_phone_number: str
    effective_date: str
    expiration_date: str
    state: str
    details_url: str
