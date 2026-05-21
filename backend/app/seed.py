import random

from sqlalchemy import select, func

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.database import SessionLocal
from app.models.person import Person
from app.models.profession_group import ProfessionGroup
from app.models.user import User, UserRole
from app.utils.tckn import validate_tckn

PROFESSION_NAMES = [
    "Mühendis",
    "Doktor",
    "Öğretmen",
    "Avukat",
    "Mimar",
    "Hemşire",
    "Eczacı",
    "Muhasebeci",
]

FIRST_NAMES = ["Ahmet", "Mehmet", "Ayşe", "Fatma", "Ali", "Zeynep", "Mustafa", "Elif", "Hasan", "Emine"]
LAST_NAMES = ["Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Öztürk", "Aydın", "Arslan", "Doğan"]


def _generate_valid_tckn() -> str:
    while True:
        digits = [random.randint(1, 9)] + [random.randint(0, 9) for _ in range(8)]
        odd_sum = sum(digits[0:9:2])
        even_sum = sum(digits[1:8:2])
        tenth = ((odd_sum * 7) - even_sum) % 10
        digits.append(tenth)
        eleventh = sum(digits) % 10
        digits.append(eleventh)
        tckn = "".join(str(d) for d in digits)
        try:
            return validate_tckn(tckn)
        except ValueError:
            continue


def run_seed(*, person_count: int = 1000, force_persons: bool = False) -> None:
    settings = get_settings()
    db = SessionLocal()
    try:
        admin = db.scalar(select(User).where(User.email == settings.seed_admin_email))
        if admin is None:
            admin = User(
                email=settings.seed_admin_email,
                hashed_password=get_password_hash(settings.seed_admin_password),
                role=UserRole.ADMIN,
            )
            db.add(admin)

        normal = db.scalar(select(User).where(User.email == "user@example.com"))
        if normal is None:
            normal = User(
                email="user@example.com",
                hashed_password=get_password_hash("User123!"),
                role=UserRole.USER,
            )
            db.add(normal)

        db.commit()

        existing_groups = db.scalars(select(ProfessionGroup)).all()
        if not existing_groups:
            for name in PROFESSION_NAMES:
                db.add(ProfessionGroup(name=name))
            db.commit()

        groups = list(db.scalars(select(ProfessionGroup)).all())
        current_count = db.scalar(select(func.count()).select_from(Person)) or 0

        if current_count >= person_count and not force_persons:
            db.commit()
            return

        target = person_count if force_persons else person_count - current_count
        used_tckns: set[str] = set(
            db.scalars(select(Person.tckn)).all()
        )
        used_emails: set[str] = set(
            db.scalars(select(Person.email)).all()
        )

        batch: list[Person] = []
        created = 0
        while created < target:
            tckn = _generate_valid_tckn()
            if tckn in used_tckns:
                continue
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            email = f"{first.lower()}.{last.lower()}{random.randint(1, 99999)}@example.com"
            if email in used_emails:
                continue

            used_tckns.add(tckn)
            used_emails.add(email)
            batch.append(
                Person(
                    first_name=first,
                    last_name=last,
                    tckn=tckn,
                    email=email,
                    profession_group_id=random.choice(groups).id,
                )
            )
            created += 1
            if len(batch) >= 200:
                db.add_all(batch)
                db.commit()
                batch.clear()

        if batch:
            db.add_all(batch)
            db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Seed database")
    parser.add_argument("--count", type=int, default=1000, help="Target person count")
    parser.add_argument("--force", action="store_true", help="Add more persons even if count reached")
    args = parser.parse_args()
    from app.database import Base, engine

    Base.metadata.create_all(bind=engine)
    run_seed(person_count=args.count, force_persons=args.force)
    print(f"Seed completed (target persons: {args.count})")
