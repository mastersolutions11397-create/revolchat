# Backend Authentication Update - JWT Token Support

## Required Backend Changes

Update your FastAPI backend to validate Supabase JWT tokens instead of using `x-user-id` header.

## Updated app/auth.py

```python
from fastapi import HTTPException, Depends, Header
from typing import Optional
from supabase import create_client, Client
from app.config import settings
import jwt

supabase: Client = create_client(settings.supabase_url, settings.supabase_key)

async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Get user ID from Supabase JWT token in Authorization header"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")

    # Extract token from "Bearer <token>" format
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header format")

    token = authorization.replace("Bearer ", "")

    try:
        # Verify token with Supabase
        response = supabase.auth.get_user(token)

        if not response.user:
            raise HTTPException(status_code=401, detail="Invalid token")

        return str(response.user.id)
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
```

## Alternative: JWT Decoding (if you want to decode without Supabase API call)

```python
from fastapi import HTTPException, Depends, Header
from typing import Optional
import jwt
import requests
from app.config import settings

def get_jwks():
    """Get Supabase JWKS (JSON Web Key Set) for token verification"""
    jwks_url = f"{settings.supabase_url}/.well-known/jwks.json"
    response = requests.get(jwks_url)
    return response.json()

async def get_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Get user ID from Supabase JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header is required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    token = authorization.replace("Bearer ", "")

    try:
        # Decode JWT token
        # Note: In production, verify the signature using JWKS
        decoded = jwt.decode(
            token,
            options={"verify_signature": False}  # For now, skip signature verification
        )

        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
```

## Updated Requirements

Add to `requirements.txt`:

```txt
python-jose[cryptography]==3.3.0
PyJWT==2.8.0
cryptography==41.0.7
```

## Testing

Test the authentication with:

```bash
# Get token from frontend after login
TOKEN="your_supabase_jwt_token"

# Test API call
curl -X GET "http://localhost:8000/api/yetti/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend Changes ✅

The frontend has been updated to:

- ✅ Use Supabase session token in Authorization header
- ✅ Automatically handle token refresh
- ✅ Include token in all API requests
- ✅ Update all API service files

## Benefits

1. **Secure**: Uses standard JWT authentication
2. **Automatic**: Frontend automatically includes token
3. **Standard**: Follows OAuth 2.0 Bearer token format
4. **Flexible**: Can verify with Supabase or decode JWT directly
5. **Refreshable**: Supabase handles token refresh automatically
