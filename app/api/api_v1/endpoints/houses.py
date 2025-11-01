from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .... import models
from ....api import deps

router = APIRouter()

class CreateHouseRequest(BaseModel):
    name: str
    description: Optional[str] = None

@router.get("/user")
async def get_user_houses(
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get all houses for the current user
    """
    # Get houses where user is creator or member
    houses = db.query(models.House).filter(
        (models.House.creator_id == current_user.id) |
        (models.House.id.in_(
            db.query(models.HouseMember.house_id).filter(
                models.HouseMember.user_id == current_user.id
            )
        ))
    ).all()

    result = []
    for house in houses:
        # Count members
        member_count = db.query(models.HouseMember).filter(
            models.HouseMember.house_id == house.id
        ).count() + 1  # +1 for creator

        result.append({
            "id": house.id,
            "name": house.name,
            "description": house.description,
            "members_count": member_count,
            "created_at": house.created_at.isoformat(),
            "is_creator": house.creator_id == current_user.id
        })

    return result

@router.post("/create")
async def create_house(
    request: CreateHouseRequest,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new house
    """
    # Create house
    db_house = models.House(
        name=request.name,
        description=request.description,
        creator_id=current_user.id
    )
    db.add(db_house)
    db.commit()
    db.refresh(db_house)

    # Add creator as first member
    db_member = models.HouseMember(
        house_id=db_house.id,
        user_id=current_user.id
    )
    db.add(db_member)
    db.commit()

    return {
        "id": db_house.id,
        "name": db_house.name,
        "description": db_house.description,
        "members_count": 1,
        "created_at": db_house.created_at.isoformat(),
        "is_creator": True
    }

@router.post("/exit")
async def exit_house(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    house_id: int
) -> Any:
    """
    Exit a house (only if not creator)
    """
    house = db.query(models.House).filter(models.House.id == house_id).first()
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="House not found"
        )

    if house.creator_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="House creator cannot exit house. Delete the house instead."
        )

    # Remove user from house
    db.query(models.HouseMember).filter(
        models.HouseMember.house_id == house_id,
        models.HouseMember.user_id == current_user.id
    ).delete()
    db.commit()

    return {"message": "Successfully exited house"}

@router.delete("/delete")
async def delete_house(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    house_id: int
) -> Any:
    """
    Delete a house (only creator can delete)
    """
    house = db.query(models.House).filter(models.House.id == house_id).first()
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="House not found"
        )

    if house.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only house creator can delete the house"
        )

    # Delete all tasks, members, and house
    db.query(models.Task).filter(models.Task.house_id == house_id).delete()
    db.query(models.HouseMember).filter(models.HouseMember.house_id == house_id).delete()
    db.delete(house)
    db.commit()

    return {"message": "House deleted successfully"}

@router.post("/invite")
async def invite_to_house(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    house_id: int,
    email: str
) -> Any:
    """
    Invite a user to join a house
    """
    house = db.query(models.House).filter(models.House.id == house_id).first()
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="House not found"
        )

    # Check if current user is member of the house
    is_member = db.query(models.HouseMember).filter(
        models.HouseMember.house_id == house_id,
        models.HouseMember.user_id == current_user.id
    ).first()

    if not is_member and house.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this house"
        )

    # Check if user exists
    invited_user = db.query(models.User).filter(models.User.email == email).first()
    if not invited_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if user is already a member
    existing_member = db.query(models.HouseMember).filter(
        models.HouseMember.house_id == house_id,
        models.HouseMember.user_id == invited_user.id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of this house"
        )

    # Add user to house
    db_member = models.HouseMember(
        house_id=house_id,
        user_id=invited_user.id
    )
    db.add(db_member)
    db.commit()

    return {"message": f"Successfully invited {invited_user.name} to {house.name}"}
