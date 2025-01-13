from sqlalchemy.orm import Session

from crud import user as crud_user
from schemas import user as schemas_user
# from .. import crud, schemas
from core.config import settings
from .session import engine, SessionLocal
from .base_class import Base


def init_db(db: Session) -> None:
    Base.metadata.create_all(bind=engine)

    user = crud_user.get_by_email(db, email=settings.FIRST_SUPERUSER)
    if not user:
        user_in = schemas_user.UserCreate(
            email=settings.FIRST_SUPERUSER,
            full_name='Admin',
            password=settings.FIRST_SUPERUSER_PASSWORD,
            role='admin'
        )
        user = crud_user.create(db, obj_in=user_in)

