from datetime import datetime, timezone

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class Follow(Base):
    __tablename__ = "follows"
    __table_args__ = (UniqueConstraint("seguidor_id", "seguido_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    seguidor_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    seguido_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
