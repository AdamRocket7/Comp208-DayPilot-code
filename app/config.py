from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: Optional[str] = "sqlite:///./daypilot.db"
    geoapify_api_key: str = "880ee5720aee4ecca1c7d4fdbc1cc8cb"

    class Config:
        env_file = ".env"

settings = Settings()


def get_database_url() -> str:
    if settings.database_url:
        return settings.database_url
    return (
        f"mysql+pymysql://{settings.mysql_user}:"
        f"{settings.mysql_password}@{settings.mysql_host}/"
        f"{settings.mysql_db}?charset=utf8mb4"
    )
