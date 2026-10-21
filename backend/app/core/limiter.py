from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request
from app.core.config import settings

def get_client_id(request: Request) -> str:
    """
    Returns user ID if authenticated, else remote IP address.
    Does not trust spoofable headers (uses request.client.host instead of get_remote_address
    unless behind a trusted proxy, but here we strictly use request.client.host).
    """
    # Check for authentication token in cookies
    token = request.cookies.get("access_token")
    if not token:
        # Check header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if token:
        # Decode token to get user id (we'll just use the token string itself as a hash for limiting
        # to avoid hitting DB or importing JWT decode logic here if it's too expensive, 
        # but decoding JWT is also fast)
        from jose import jwt  # type: ignore
        from app.core.config import settings
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass

    return f"ip:{request.client.host if request.client else '127.0.0.1'}"

def get_storage_uri() -> str:
    redis_url = getattr(settings, "REDIS_URL", "")
    if redis_url and not redis_url.startswith("memory"):
        try:
            import redis
            r = redis.from_url(redis_url, socket_connect_timeout=0.2, socket_timeout=0.2)
            r.ping()
            return redis_url
        except Exception:
            return "memory://"
    return "memory://"

limiter = Limiter(
    key_func=get_client_id,
    storage_uri=get_storage_uri(),
    default_limits=["100/minute"],
)
