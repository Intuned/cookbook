from pydantic import BaseModel, Field


class NetworkInterceptorParams(BaseModel):
    username: str = Field(..., description="Email used to log in to sandbox.intuned.dev")
    password: str = Field(..., description="Password used to log in to sandbox.intuned.dev")
    limit: int = Field(default=5, description="Maximum number of consultations to fetch")


class ApiInterceptorParams(BaseModel):
    url: str = Field(..., description="The URL to navigate to")
    api_pattern: str = Field(
        default="/api/",
        description="Pattern to match in API URLs (e.g., '/rest/v1/consultations')",
    )
    max_pages: int = Field(
        default=10, description="Maximum number of pages to fetch (default: 10)"
    )


class Consultation(BaseModel):
    id: str = Field(..., description="The ID of the consultation")
    created_at: str = Field(
        ..., description="The date and time the consultation was created"
    )
    name: str = Field(..., description="The name of the consultation")
    email: str = Field(..., description="The email of the consultation")
    phone: str = Field(..., description="The phone number of the consultation")
    preferred_date: str = Field(
        ..., description="The preferred date of the consultation"
    )
    preferred_time: str = Field(
        ..., description="The preferred time of the consultation"
    )
    topic: str = Field(..., description="The topic of the consultation")
    status: str = Field(..., description="The status of the consultation")
    user_id: str = Field(
        ..., description="The ID of the user who created the consultation"
    )
