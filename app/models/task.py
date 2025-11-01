from sqlalchemy import Boolean, Column, Integer, String, DateTime, func, ForeignKey
from sqlalchemy.orm import relationship
from ..db.session import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    house_id = Column(Integer, ForeignKey("houses.id"), nullable=False)
    assigned_to = Column(String, nullable=True)  # Can be user name or email
    deadline = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String, default="medium")  # low, medium, high
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    house = relationship("House", back_populates="tasks")
