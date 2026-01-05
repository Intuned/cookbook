from pydantic import BaseModel, EmailStr


class CreateAuthSessionParams(BaseModel):
    username: EmailStr
    password: str


class Contract(BaseModel):
    id: str
    name: str
    supplier_name: str
    supplier_phone_number: str
    effective_date: str
    expiration_date: str
    state: str
    details_url: str
