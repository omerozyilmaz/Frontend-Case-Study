from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError

from app.core.deps import AdminUser, CurrentUser, DbSession
from app.models.person import Person
from app.schemas.common import MessageResponse, PaginatedResponse
from app.schemas.person import PersonCreate, PersonListItem, PersonResponse, PersonUpdate
from app.services.person_service import get_person_or_none, list_persons, ensure_profession_group_exists

router = APIRouter(prefix="/persons", tags=["persons"])


@router.get("", response_model=PaginatedResponse[PersonListItem])
def get_persons(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    sort: str | None = Query(None),
    profession_group_ids: list[int] | None = Query(None),
    name_contains: str | None = Query(None),
    tckn_prefix: str | None = Query(None, max_length=11),
) -> PaginatedResponse[PersonListItem]:
    items, total = list_persons(
        db,
        page=page,
        size=size,
        sort=sort,
        profession_group_ids=profession_group_ids,
        name_contains=name_contains,
        tckn_prefix=tckn_prefix,
    )
    return PaginatedResponse(
        items=[PersonListItem.from_orm_person(p) for p in items],
        page=page,
        size=size,
        total=total,
    )


@router.get("/{person_id}", response_model=PersonResponse)
def get_person(person_id: int, db: DbSession, _: CurrentUser) -> Person:
    person = get_person_or_none(db, person_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")
    return person


@router.post("", response_model=PersonResponse, status_code=status.HTTP_201_CREATED)
def create_person(body: PersonCreate, db: DbSession, _: AdminUser) -> Person:
    if ensure_profession_group_exists(db, body.profession_group_id) is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz meslek grubu")

    person = Person(
        first_name=body.first_name.strip(),
        last_name=body.last_name.strip(),
        tckn=body.tckn,
        email=body.email.lower(),
        profession_group_id=body.profession_group_id,
    )
    db.add(person)
    try:
        db.commit()
        db.refresh(person)
        loaded = get_person_or_none(db, person.id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu TCKN veya e-posta zaten kayıtlı",
        ) from None
    if loaded is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")
    return loaded


@router.put("/{person_id}", response_model=PersonResponse)
def update_person(person_id: int, body: PersonUpdate, db: DbSession, _: AdminUser) -> Person:
    person = get_person_or_none(db, person_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")

    update_data = body.model_dump(exclude_unset=True)
    if "profession_group_id" in update_data:
        if ensure_profession_group_exists(db, update_data["profession_group_id"]) is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Geçersiz meslek grubu")

    if "email" in update_data and update_data["email"]:
        update_data["email"] = update_data["email"].lower()

    for key, value in update_data.items():
        if isinstance(value, str):
            value = value.strip() if key in ("first_name", "last_name") else value
        setattr(person, key, value)

    try:
        db.commit()
        db.refresh(person)
        loaded = get_person_or_none(db, person.id)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu TCKN veya e-posta zaten kayıtlı",
        ) from None
    if loaded is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")
    return loaded


@router.delete("/{person_id}", response_model=MessageResponse)
def delete_person(person_id: int, db: DbSession, _: AdminUser) -> MessageResponse:
    person = get_person_or_none(db, person_id)
    if person is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Kayıt bulunamadı")
    db.delete(person)
    db.commit()
    return MessageResponse(detail="Kayıt silindi")
