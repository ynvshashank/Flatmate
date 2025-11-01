from typing import Any, List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .... import models
from ....api import deps

router = APIRouter()

@router.get("/today")
async def get_today_tasks(
    house_id: Optional[int] = None,
    current_user: models.User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Get today's tasks for user or specific house
    """
    query = db.query(models.Task)

    if house_id:
        # Check if user is member of the house
        house = db.query(models.House).filter(models.House.id == house_id).first()
        if not house:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="House not found"
            )

        is_member = db.query(models.HouseMember).filter(
            models.HouseMember.house_id == house_id,
            models.HouseMember.user_id == current_user.id
        ).first()

        if not is_member and house.creator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this house"
            )

        query = query.filter(models.Task.house_id == house_id)
    else:
        # Get tasks from all user's houses
        user_house_ids = db.query(models.HouseMember.house_id).filter(
            models.HouseMember.user_id == current_user.id
        ).subquery()

        query = query.filter(
            models.Task.house_id.in_(
                db.query(models.House.id).filter(
                    (models.House.creator_id == current_user.id) |
                    (models.House.id.in_(user_house_ids))
                )
            )
        )

    tasks = query.all()

    result = []
    for task in tasks:
        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "assigned_to": task.assigned_to,
            "deadline": task.deadline.isoformat() if task.deadline else None,
            "priority": task.priority,
            "completed": task.completed,
            "completed_at": task.completed_at.isoformat() if task.completed_at else None,
            "created_at": task.created_at.isoformat()
        })

    return result

@router.post("/create")
async def create_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    title: str,
    house_id: int,
    description: str = None,
    assigned_to: str = None,
    deadline: str = None,
    priority: str = "medium"
) -> Any:
    """
    Create a new task
    """
    # Check if house exists and user is member
    house = db.query(models.House).filter(models.House.id == house_id).first()
    if not house:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="House not found"
        )

    is_member = db.query(models.HouseMember).filter(
        models.HouseMember.house_id == house_id,
        models.HouseMember.user_id == current_user.id
    ).first()

    if not is_member and house.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this house"
        )

    # Parse deadline if provided
    deadline_dt = None
    if deadline:
        try:
            deadline_dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid deadline format"
            )

    # Create task
    db_task = models.Task(
        title=title,
        description=description,
        house_id=house_id,
        assigned_to=assigned_to,
        deadline=deadline_dt,
        priority=priority
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return {
        "id": db_task.id,
        "title": db_task.title,
        "description": db_task.description,
        "assigned_to": db_task.assigned_to,
        "deadline": db_task.deadline.isoformat() if db_task.deadline else None,
        "priority": db_task.priority,
        "completed": db_task.completed,
        "completed_at": db_task.completed_at.isoformat() if db_task.completed_at else None,
        "created_at": db_task.created_at.isoformat()
    }

@router.put("/update")
async def update_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    task_id: int,
    title: str = None,
    description: str = None,
    assigned_to: str = None,
    deadline: str = None,
    priority: str = None,
    completed: bool = None
) -> Any:
    """
    Update an existing task
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user is member of the house
    house = db.query(models.House).filter(models.House.id == task.house_id).first()
    is_member = db.query(models.HouseMember).filter(
        models.HouseMember.house_id == task.house_id,
        models.HouseMember.user_id == current_user.id
    ).first()

    if not is_member and house.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this house"
        )

    # Update fields
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    if assigned_to is not None:
        task.assigned_to = assigned_to
    if priority is not None:
        task.priority = priority

    # Handle deadline
    if deadline is not None:
        if deadline == "":
            task.deadline = None
        else:
            try:
                task.deadline = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid deadline format"
                )

    # Handle completion
    if completed is not None:
        task.completed = completed
        if completed:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None

    db.commit()
    db.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "assigned_to": task.assigned_to,
        "deadline": task.deadline.isoformat() if task.deadline else None,
        "priority": task.priority,
        "completed": task.completed,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "created_at": task.created_at.isoformat()
    }

@router.delete("/delete")
async def delete_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    task_id: int
) -> Any:
    """
    Delete a task
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user is member of the house
    house = db.query(models.House).filter(models.House.id == task.house_id).first()
    is_member = db.query(models.HouseMember).filter(
        models.HouseMember.house_id == task.house_id,
        models.HouseMember.user_id == current_user.id
    ).first()

    if not is_member and house.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this house"
        )

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}

@router.post("/complete")
async def complete_task(
    *,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user),
    task_id: int
) -> Any:
    """
    Mark a task as completed
    """
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Check if user is member of the house
    house = db.query(models.House).filter(models.House.id == task.house_id).first()
    is_member = db.query(models.HouseMember).filter(
        models.HouseMember.house_id == task.house_id,
        models.HouseMember.user_id == current_user.id
    ).first()

    if not is_member and house.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this house"
        )

    task.completed = True
    task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "assigned_to": task.assigned_to,
        "deadline": task.deadline.isoformat() if task.deadline else None,
        "priority": task.priority,
        "completed": task.completed,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "created_at": task.created_at.isoformat()
    }
