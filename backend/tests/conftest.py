import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["DATABASE_URL"] = "sqlite://"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["SEED_ENABLED"] = "false"

from app.core.config import get_settings
from app.core.security import get_password_hash
from app.database import Base, get_db
from app.main import app
from app.models.profession_group import ProfessionGroup
from app.models.user import User, UserRole

get_settings.cache_clear()


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    admin = User(
        email="admin@test.com",
        hashed_password=get_password_hash("Admin123!"),
        role=UserRole.ADMIN,
    )
    user = User(
        email="user@test.com",
        hashed_password=get_password_hash("User123!"),
        role=UserRole.USER,
    )
    session.add_all([admin, user])
    session.add(ProfessionGroup(name="Mühendis"))
    session.commit()

    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def _login_token(client: TestClient, email: str, password: str) -> str:
    res = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert res.status_code == 200, res.text
    token = client.cookies.get("crudfab_session")
    client.cookies.clear()
    assert token, "session cookie not set"
    return token


@pytest.fixture
def admin_token(client):
    return _login_token(client, "admin@test.com", "Admin123!")


@pytest.fixture
def user_token(client):
    return _login_token(client, "user@test.com", "User123!")
