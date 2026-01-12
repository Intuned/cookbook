from pydantic import BaseModel, Field


class Insuree(BaseModel):
    chfId: str = Field(..., description="The CHF ID of the insuree")
    lastName: str = Field(..., description="The last name of the insuree")
    otherNames: str = Field(..., description="The other names of the insuree")
    dob: str = Field(..., description="The date of birth of the insuree")


class InsureeNode(BaseModel):
    node: Insuree


class InsureeEdges(BaseModel):
    edges: list[InsureeNode]


class InsureeData(BaseModel):
    insurees: InsureeEdges


class InsureeResponse(BaseModel):
    data: InsureeData


class NetworkInterceptorParams(BaseModel):
    url: str = Field(..., description="The URL to navigate to")
    api_url: str = Field(..., description="The URL to the API")
    query: str | None = Field(default=None, description="The query to execute")
    username: str = Field(..., description="The username to use for authentication")
    password: str = Field(..., description="The password to use for authentication")
    login_url: str | None = Field(default=None, description="The URL to the login page")


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
