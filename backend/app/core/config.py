from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./crudfab.db"
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    seed_admin_email: str = "admin@example.com"
    seed_admin_password: str = "Admin123!"
    seed_enabled: bool = True
    seed_person_count: int = 1000

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    session_cookie_name: str = "crudfab_session"
    session_cookie_secure: bool = False
    session_cookie_samesite: str = "lax"


@lru_cache
def get_settings() -> Settings:
    return Settings()
