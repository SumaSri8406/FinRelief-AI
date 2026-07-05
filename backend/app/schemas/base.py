from pydantic import BaseModel, ConfigDict
from typing import Generic, TypeVar, Optional, Any

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)


class ApiErrorResponse(BaseModel):
    success: bool = False
    message: str
    error: Optional[Any] = None
