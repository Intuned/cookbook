from typing import Optional, Literal
from pydantic import BaseModel, Field


# ---------- Metadata ----------


class Metadata(BaseModel):
    site: str = Field(..., format="uri")
    insurance_type: Literal[
        "auto", "homeowners", "renters", "motorcycle", "boat", "commercial_auto"
    ]


# ---------- Applicant ----------


class Applicant(BaseModel):
    first_name: str = Field(
        ..., min_length=1, description="The first name of the applicant"
    )
    last_name: str = Field(
        ..., min_length=1, description="The last name of the applicant"
    )
    date_of_birth: str = Field(
        ..., format="date", description="The date of birth of the applicant"
    )
    gender: Literal["male", "female", "other"] = Field(
        ..., description="The gender of the applicant"
    )
    marital_status: Literal["single", "married", "divorced", "widowed"] = Field(
        ..., description="The marital status of the applicant"
    )
    accident_prevention_course: Optional[bool] = Field(
        default=False,
        description="Whether the applicant has completed an accident prevention course",
    )
    email: str = Field(
        ..., format="email", description="The email address of the applicant"
    )
    phone_number: str = Field(..., description="The phone number of the applicant")
    is_cell_phone: bool = Field(
        ..., description="Whether the phone number is a cell phone"
    )
    can_text: bool = Field(
        ..., description="Can an ERIE Agent text you about this quote?"
    )
    preferred_name: Optional[str] = Field(
        default=None, description="The preferred name of the applicant"
    )
    home_multi_policy_discount: bool = Field(
        ...,
        description="Would you like our Home Multi-Policy Discount applied to your quote?",
    )
    currently_has_auto_insurance: bool = Field(
        ..., description="Do you currently have auto insurance?"
    )
    coverage_effective_date: str = Field(
        ...,
        pattern=r"^\d{2}/\d{2}/\d{4}$",
        description="When does coverage need to be effective? (mm/dd/yyyy format)",
    )


# ---------- Address ----------


class Address(BaseModel):
    street_line1: str = Field(
        ..., min_length=1, description="The street address of the applicant"
    )
    street_line2: Optional[str] = None  # Apt / Unit
    city: str = Field(..., min_length=1, description="The city of the applicant")
    state: str = Field(
        ..., min_length=2, max_length=2, description="The state of the applicant"
    )
    zip_code: str = Field(
        ..., pattern=r"^\d{5}$", description="The zip code of the applicant"
    )


# ---------- Vehicle ----------


class Vehicle(BaseModel):
    vehicle_type: Literal[
        "Automobile",
        "Travel Trailer",
        "ATV",
        "Utility Trailer",
        "Snowmobile",
        "Motor Home",
        "Camper",
        "Moped",
        "Trail Bike",
        "Dune Buggy",
        "Mini Bike",
        "Golf Cart",
        "Recreational Trailer",
    ] = Field(..., description="The type of vehicle")
    year: int = Field(..., description="The year of the vehicle")
    make: str = Field(..., min_length=1, description="The make of the vehicle")
    model: str = Field(..., min_length=1, description="The model of the vehicle")
    primary_use: Literal["Farm", "Business", "Pleasure", "Work/School"] | None = Field(
        default=None, description="The primary use of the vehicle"
    )
    annual_mileage: int | None = Field(
        default=None, description="The annual mileage of the vehicle"
    )
    days_driven_per_week: int | None = Field(
        default=None, description="The number of days driven per week"
    )
    miles_driven_one_way: int | None = Field(
        default=None, description="The number of miles driven one way"
    )
    model_details: str | None = Field(
        ..., description="The details of the model of the vehicle"
    )


# ---------- Root Model ----------


class ListParameters(BaseModel):
    metadata: Metadata
    applicant: Applicant
    address: Address
    vehicle: Vehicle
