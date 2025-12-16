from pydantic import BaseModel, Field
from typing import List


class Insuree(BaseModel):
    chfId: str = Field(..., description="The CHF ID of the insuree")
    lastName: str = Field(..., description="The last name of the insuree")
    otherNames: str = Field(..., description="The other names of the insuree")
    dob: str = Field(..., description="The date of birth of the insuree")


class InsureeNode(BaseModel):
    node: Insuree


class InsureeEdges(BaseModel):
    edges: List[InsureeNode]


class InsureeData(BaseModel):
    insurees: InsureeEdges


class InsureeResponse(BaseModel):
    data: InsureeData


class Params(BaseModel):
    url: str = Field(..., description="The URL to navigate to")
    api_url: str = Field(..., description="The URL to the API")
    query: str | None = Field(default=None, description="The query to execute")
    username: str = Field(..., description="The username to use for authentication")
    password: str = Field(..., description="The password to use for authentication")
    login_url: str | None = Field(default=None, description="The URL to the login page")
