from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.core.deps import AdminUser, CurrentUser, DbSession
from app.models.profession_group import ProfessionGroup
from app.schemas.profession_group import ProfessionGroupCreate, ProfessionGroupResponse

router = APIRouter(prefix="/profession-groups", tags=["profession-groups"])


@router.get("", response_model=list[ProfessionGroupResponse])
def list_profession_groups(db: DbSession, _: CurrentUser) -> list[ProfessionGroup]:
    return list(db.scalars(select(ProfessionGroup).order_by(ProfessionGroup.name)).all())


@router.post("", response_model=ProfessionGroupResponse, status_code=status.HTTP_201_CREATED)
def create_profession_group(body: ProfessionGroupCreate, db: DbSession, _: AdminUser) -> ProfessionGroup:
    group = ProfessionGroup(name=body.name.strip())
    db.add(group)
    try:
        db.commit()
        db.refresh(group)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Bu meslek grubu adı zaten kayıtlı",
        ) from None
    return group
