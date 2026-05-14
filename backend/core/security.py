"""
core/security.py — Authentication and query safety helpers.

JWT verification now supports two modes:
  1. Clerk RS256 tokens  (used by all frontend-issued requests)
  2. Legacy HS256 tokens (kept for the /api/auth/login stub, backward compat)

Clerk token verification fetches the JSON Web Key Set (JWKS) from Clerk's
well-known endpoint and caches it in memory for the process lifetime.
"""

import os
import re
import jwt                         # PyJWT — legacy HS256
import datetime
import httpx

from functools import lru_cache
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt as jose_jwt, JWTError  # python-jose — RS256 / Clerk

# ---------------------------------------------------------------------------
# Shared
# ---------------------------------------------------------------------------
security = HTTPBearer()

# ---------------------------------------------------------------------------
# 1.  Clerk RS256 verification
# ---------------------------------------------------------------------------

def _parse_clerk_frontend_api(publishable_key: str) -> str:
    """
    Derive the Clerk Frontend API URL from the publishable key.

    Format: pk_test_<base64(frontend-api-host)>  or  pk_live_<base64(...)>
    The host is the base64-decoded payload minus a trailing '$'.
    """
    import base64
    try:
        # strip prefix
        b64 = publishable_key.split("_", 2)[2]
        # Add padding
        padded = b64 + "=" * (-len(b64) % 4)
        decoded = base64.b64decode(padded).decode("utf-8").rstrip("$")
        return f"https://{decoded}"
    except Exception:
        raise RuntimeError(
            "Could not derive Clerk frontend API URL from CLERK_PUBLISHABLE_KEY. "
            "Make sure backend/.env has the correct key."
        )


@lru_cache(maxsize=1)
def _get_clerk_jwks() -> dict:
    """Fetch and cache Clerk's JWKS (cached for the process lifetime)."""
    pk = os.getenv("CLERK_PUBLISHABLE_KEY", "")
    if not pk:
        raise RuntimeError("CLERK_PUBLISHABLE_KEY is not set in backend/.env")

    frontend_api = _parse_clerk_frontend_api(pk)
    jwks_url = f"{frontend_api}/.well-known/jwks.json"

    try:
        resp = httpx.get(jwks_url, timeout=10)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        raise RuntimeError(f"Failed to fetch Clerk JWKS from {jwks_url}: {e}")


def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """
    Verify a Clerk-issued RS256 JWT.
    Returns the decoded payload (includes 'sub' = Clerk user ID).
    Raises HTTP 401 on any failure.
    """
    token = credentials.credentials
    try:
        jwks = _get_clerk_jwks()
        # Decode header to get kid
        header = jose_jwt.get_unverified_header(token)
        kid = header.get("kid")

        # Find matching key in JWKS
        key = None
        for k in jwks.get("keys", []):
            if k.get("kid") == kid:
                key = k
                break

        if key is None:
            # JWKS may be stale — clear cache and retry once
            _get_clerk_jwks.cache_clear()
            jwks = _get_clerk_jwks()
            for k in jwks.get("keys", []):
                if k.get("kid") == kid:
                    key = k
                    break

        if key is None:
            raise HTTPException(status_code=401, detail="Unknown signing key")

        payload = jose_jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            options={"verify_aud": False},   # Clerk tokens may omit 'aud'
        )
        return payload

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Clerk token: {e}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {e}")


# Convenience alias used in route dependencies
verify_token = verify_clerk_token


# ---------------------------------------------------------------------------
# 2.  Legacy HS256 (kept for /api/auth/login stub)
# ---------------------------------------------------------------------------
_LEGACY_SECRET = "my_super_secret_key_for_querytalk"
_LEGACY_ALGORITHM = "HS256"


def create_access_token(data: dict) -> str:
    """Create a short-lived HS256 JWT (legacy, used only by /api/auth/login)."""
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, _LEGACY_SECRET, algorithm=_LEGACY_ALGORITHM)


def verify_legacy_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> dict:
    """Verify a legacy HS256 token (deprecated — prefer verify_clerk_token)."""
    try:
        payload = jwt.decode(
            credentials.credentials,
            _LEGACY_SECRET,
            algorithms=[_LEGACY_ALGORITHM],
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ---------------------------------------------------------------------------
# 3.  Query safety guard (unchanged)
# ---------------------------------------------------------------------------

def is_safe_query(query: str) -> bool:
    """
    Block destructive SQL commands (DDL / DML write operations).
    Returns True if the query is safe to execute, False otherwise.
    """
    dangerous_keywords = [
        r'\bDROP\b', r'\bDELETE\b', r'\bUPDATE\b', r'\bINSERT\b',
        r'\bALTER\b', r'\bTRUNCATE\b', r'\bGRANT\b', r'\bREVOKE\b', r'\bEXEC\b',
    ]
    query_upper = query.upper()
    for keyword in dangerous_keywords:
        if re.search(keyword, query_upper):
            return False
    return True
