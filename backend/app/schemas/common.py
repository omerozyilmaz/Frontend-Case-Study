from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    page: int
    size: int
    total: int


class MessageResponse(BaseModel):
    detail: str = Field(..., examples=["İşlem başarılı"])
