from pydantic import BaseModel, Field


class Consultation(BaseModel):
    id: str = Field(default=None, description="The ID of the consultation")
    created_at: str | None = Field(
        default=None, description="The date and time the consultation was created"
    )
    name: str = Field(..., description="The name of the consultation")
    email: str | None = Field(default=None, description="The email of the consultation")
    phone: str | None = Field(
        default=None, description="The phone number of the consultation"
    )
    preferred_date: str | None = Field(
        default=None, description="The preferred date of the consultation"
    )
    preferred_time: str | None = Field(
        default=None, description="The preferred time of the consultation"
    )
    topic: str | None = Field(default=None, description="The topic of the consultation")
    status: str | None = Field(
        default=None, description="The status of the consultation"
    )
    user_id: str | None = Field(
        default=None, description="The ID of the user who created the consultation"
    )


class Params(BaseModel):
    url: str = Field(..., description="The URL to navigate to")
    api_pattern: str = Field(
        default="/api/", description="The pattern to match in API URLs"
    )
    max_pages: int = Field(
        default=10, description="The maximum number of pages to fetch"
    )
