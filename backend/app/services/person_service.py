from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models.person import Person
from app.models.profession_group import ProfessionGroup

SORTABLE_FIELDS = {
    "first_name": Person.first_name,
    "last_name": Person.last_name,
    "created_at": Person.created_at,
    "email": Person.email,
}


def list_persons(
    db: Session,
    *,
    page: int = 1,
    size: int = 20,
    sort: str | None = None,
    profession_group_ids: list[int] | None = None,
    name_contains: str | None = None,
    tckn_prefix: str | None = None,
) -> tuple[list[Person], int]:
    query = select(Person).options(joinedload(Person.profession_group))

    if profession_group_ids:
        query = query.where(Person.profession_group_id.in_(profession_group_ids))

    if name_contains:
        term = f"%{name_contains.strip()}%"
        query = query.where(
            or_(
                Person.first_name.ilike(term),
                Person.last_name.ilike(term),
            )
        )

    if tckn_prefix:
        prefix = tckn_prefix.strip()
        if not prefix.isdigit():
            return [], 0
        query = query.where(Person.tckn.startswith(prefix))

    count_query = select(func.count()).select_from(query.subquery())
    total = db.scalar(count_query) or 0

    if sort:
        parts = sort.split(",")
        field_name = parts[0].strip()
        direction = parts[1].strip().lower() if len(parts) > 1 else "asc"
        column = SORTABLE_FIELDS.get(field_name)
        if column is not None:
            query = query.order_by(column.desc() if direction == "desc" else column.asc())
    else:
        query = query.order_by(Person.created_at.desc())

    offset = (page - 1) * size
    query = query.offset(offset).limit(size)

    items = list(db.scalars(query).unique().all())
    return items, total


def get_person_or_none(db: Session, person_id: int) -> Person | None:
    return db.scalar(
        select(Person)
        .options(joinedload(Person.profession_group))
        .where(Person.id == person_id)
    )


def ensure_profession_group_exists(db: Session, group_id: int) -> ProfessionGroup | None:
    return db.get(ProfessionGroup, group_id)
