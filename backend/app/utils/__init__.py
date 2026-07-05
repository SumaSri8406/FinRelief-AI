from typing import Any, Dict

def create_error_response(message: str, details: Any = None) -> Dict[str, Any]:
    response = {"detail": message}
    if details is not None:
        response["details"] = details
    return response
