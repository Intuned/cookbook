from typing import Literal

from pydantic import BaseModel, EmailStr, field_validator


class BookConsultationSchema(BaseModel):
    name: str
    email: EmailStr
    phone: str
    date: str
    time: str
    topic: Literal[
        "web-scraping", "data-extraction", "automation", "api-integration", "other"
    ]

    @field_validator("name", "phone", "date", "time")
    @classmethod
    def validate_not_empty(cls, v: str) -> str:
        if not v or len(v.strip()) < 1:
            raise ValueError("Field is required")
        return v


class GetConsultationsByEmailSchema(BaseModel):
    email: EmailStr


class Consultation(BaseModel):
    id: str
    status: str
    clientName: str
    email: str
    phone: str
    date: str
    time: str
    topic: str
