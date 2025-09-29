from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from enum import Enum
from typing import Optional

router = APIRouter()

# ---DATA MODELS---

class Priority(str,Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskCreate(BaseModel):
    title: str
    is_completed : bool = False

class Task(TaskCreate):
    id:int

# ---IN-MEMORY DATABASE---

tasks_db = [
    Task(id=1, title="Learn Python",is_completed=True),
    Task(id=2, title="Learn Vue.js",is_completed=False),
]

current_id = 2

def find_task_or_404(task_id:int):
    for task in tasks_db:
        if task.id == task_id:
            return task
    raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")

# ---API EnDPOINTS---

@router.get("/api/tasks",response_model = list[Task])
def get_all_tasks():
    return tasks_db

@router.post("/api/tasks",response_model=Task,status_code = 201)
def create_task(task_data:TaskCreate):
    global current_id
    current_id +=1 
    new_task = Task(id=current_id, **task_data.model_dump())
    tasks_db.append(new_task)
    return new_task

@router.put("/api/tasks/{task_id}",response_model= Task)
def update_task(task_id:int,task_data:TaskCreate):
    task_to_update = find_task_or_404(task_id)
    task_to_update.title = task_data.title
    task_to_update.is_completed = task_data.is_completed
    return task_to_update

@router.delete("/api/tasks/{task_id}",status_code=204)
def delete_task(task_id:int):
    task_to_delete = find_task_or_404(task_id)
    tasks_db.remove(task_to_delete)
    return