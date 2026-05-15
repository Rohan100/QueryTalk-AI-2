"""
routes/webhooks.py — Clerk webhook handler.

Endpoint:
  POST  /webhooks/clerk  — Receives Clerk webhook events (e.g. user.created)
                           and provisions local user rows.

Clerk signs every webhook payload with Svix.  We verify the signature
using the CLERK_WEBHOOK_SECRET before processing.
"""

from __future__ import annotations

import os
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from svix.webhooks import Webhook, WebhookVerificationError

from core.database import get_app_db
from core.models import User

logger = logging.getLogger(__name__)
router = APIRouter()


def _get_webhook_secret() -> str:
    secret = os.getenv("CLERK_WEBHOOK_SECRET", "")
    if not secret:
        raise RuntimeError(
            "CLERK_WEBHOOK_SECRET is not set in backend/.env. "
            "Copy the signing secret from your Clerk Dashboard → Webhooks."
        )
    return secret


@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_app_db)):
    """
    Handle incoming Clerk webhook events.

    Currently supported events:
      • user.created  — insert a new row into the users table
    """

    # ------------------------------------------------------------------
    # 1. Read raw body + Svix headers
    # ------------------------------------------------------------------
    body = await request.body()
    headers = {
        "svix-id": request.headers.get("svix-id", ""),
        "svix-timestamp": request.headers.get("svix-timestamp", ""),
        "svix-signature": request.headers.get("svix-signature", ""),
    }

    # ------------------------------------------------------------------
    # 2. Verify signature
    # ------------------------------------------------------------------
    try:
        wh = Webhook(_get_webhook_secret())
        payload = wh.verify(body, headers)
    except WebhookVerificationError:
        logger.warning("Clerk webhook signature verification failed.")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # ------------------------------------------------------------------
    # 3. Route by event type
    # ------------------------------------------------------------------
    event_type: str = payload.get("type", "")

    if event_type == "user.created":
        _handle_user_created(payload.get("data", {}), db)
    else:
        logger.info("Ignoring Clerk event type: %s", event_type)

    return {"status": "ok"}


# ------------------------------------------------------------------
# Event handlers
# ------------------------------------------------------------------

def _handle_user_created(data: dict, db: Session) -> None:
    """
    Insert a new User row from a Clerk user.created payload.

    Clerk payload shape (relevant fields):
      {
        "id": "user_2x...",
        "email_addresses": [{"email_address": "..."}],
        "first_name": "Jane",
        "last_name": "Doe",
        ...
      }
    """
    clerk_user_id: str = data.get("id", "")
    if not clerk_user_id:
        logger.error("user.created event missing 'id' field.")
        return

    # Prevent duplicate inserts (idempotent)
    existing = db.query(User).filter(User.clerk_user_id == clerk_user_id).first()
    if existing:
        logger.info("User %s already exists — skipping.", clerk_user_id)
        return

    # Extract primary email
    email_addresses = data.get("email_addresses", [])
    email = email_addresses[0]["email_address"] if email_addresses else ""

    # Build display name
    first = data.get("first_name") or ""
    last = data.get("last_name") or ""
    display_name = f"{first} {last}".strip() or None

    user = User(
        clerk_user_id=clerk_user_id,
        email=email,
        display_name=display_name,
    )
    db.add(user)
    db.commit()
    logger.info("Created local user for Clerk ID %s (%s)", clerk_user_id, email)
