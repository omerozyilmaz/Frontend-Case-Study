from datetime import datetime
from typing import Annotated, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.utils.tckn import mask_tckn, validate_tckn


class ProfessionGroupBrief(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class PersonBase(BaseModel):
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    tckn: Annotated[str, Field(min_length=11, max_length=11, pattern=r"^\d{11}$")]
    email: EmailStr
    profession_group_id: int

    @field_validator("tckn")
    @classmethod
    def validate_tckn_field(cls, v: str) -> str:
        return validate_tckn(v)


class PersonCreate(PersonBase):
    pass


class PersonUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=2, max_length=100)
    last_name: Optional[str] = Field(None, min_length=2, max_length=100)
    tckn: Annotated[Optional[str], Field(None, min_length=11, max_length=11, pattern=r"^\d{11}$")]
    email: Optional[EmailStr] = None
    profession_group_id: Optional[int] = None

    @field_validator("tckn")
    @classmethod
    def validate_tckn_field(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validate_tckn(v)


class PersonResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    tckn: str
    email: EmailStr
    profession_group_id: int
    profession_group: Optional[ProfessionGroupBrief] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class PersonListItem(BaseModel):
    id: int
    first_name: str
    last_name: str
    tckn_masked: str
    email: EmailStr
    profession_group_id: int
    profession_group: Optional[ProfessionGroupBrief] = None
    created_at: datetime

    @classmethod
    def from_orm_person(cls, person) -> "PersonListItem":
        return cls(
            id=person.id,
            first_name=person.first_name,
            last_name=person.last_name,
            tckn_masked=mask_tckn(person.tckn),
            email=person.email,
            profession_group_id=person.profession_group_id,
            profession_group=person.profession_group,
            created_at=person.created_at,
        )
