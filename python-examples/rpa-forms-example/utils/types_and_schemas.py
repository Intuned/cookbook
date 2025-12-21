from typing import Optional, Literal
from pydantic import BaseModel, Field, model_validator


# ---------- Metadata ----------


class Metadata(BaseModel):
    site: str
    run_mode: Literal["human", "fast"] = "human"
    checkpointing: bool = True
    insurance_object_type: Literal[
        "auto", "homeowners", "renters", "motorcycle", "boat", "commercial_auto"
    ]


# ---------- Applicant ----------


class Applicant(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: str
    gender: Literal["male", "female", "other"]
    marital_status: Literal["single", "married", "divorced", "widowed"]


# ---------- Address ----------


class Address(BaseModel):
    street_line1: str
    street_line2: Optional[str] = None  # Apt / Unit
    city: str
    state: str = Field(..., min_length=2, max_length=2)
    zip_code: str = Field(..., pattern=r"^\d{5}$")
    residence_type: Literal["apartment", "house", "condo", "townhouse"]


# ---------- Vehicle ----------


class Vehicle(BaseModel):
    has_vin: bool
    vin: Optional[str] = None

    year: Optional[int] = None
    make: Optional[str] = None
    model: Optional[str] = None

    ownership: Optional[Literal["owned", "leased", "financed"]] = None
    primary_use: Optional[Literal["commute", "pleasure", "business"]] = None
    annual_mileage: Optional[int] = None

    @model_validator(mode="after")
    def validate_vin_path(self):
        if self.has_vin:
            if not self.vin:
                raise ValueError("vin is required when has_vin is true")
            if any([self.year, self.make, self.model]):
                raise ValueError("year/make/model must be omitted when vin is provided")
        else:
            if self.vin is not None:
                raise ValueError("vin must be null when has_vin is false")
            if not all([self.year, self.make, self.model]):
                raise ValueError(
                    "year, make, and model are required when has_vin is false"
                )
        return self


# ---------- Driving History ----------


class DrivingHistory(BaseModel):
    licensed_since: int
    accidents_last_5_years: int = Field(ge=0)
    violations_last_5_years: int = Field(ge=0)
    claims_last_5_years: int = Field(ge=0)


# ---------- Coverage ----------


class CoveragePreferences(BaseModel):
    liability: Literal["state_minimum", "standard", "premium"]
    collision: bool
    comprehensive: bool
    deductible: int = Field(ge=0)


# ---------- Constraints ----------


class Constraints(BaseModel):
    do_not_proceed_without_validation: bool = True
    stop_after_step: Optional[str] = None


# ---------- Root Model ----------


class ListParameters(BaseModel):
    metadata: Metadata
    applicant: Applicant
    address: Address
    vehicle: Vehicle
    # driving_history: DrivingHistory
    # coverage_preferences: CoveragePreferences
    # constraints: Constraints
