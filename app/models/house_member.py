from sqlalchemy import Column, Integer, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from ..db.session import Base


class HouseMember(Base):
    __tablename__ = "house_members"

    id = Column(Integer, primary_key=True, index=True)
    house_id = Column(Integer, ForeignKey("houses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    house = relationship("House", back_populates="members")
    user = relationship("User", back_populates="house_memberships")

    __table_args__ = (
        {"schema": None},  # Default schema
    )
