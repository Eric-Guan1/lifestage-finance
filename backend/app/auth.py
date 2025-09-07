from typing import Dict, Optional
import hashlib
import secrets
import json
from pathlib import Path

# Persistent dev store location
STORE_PATH = Path(__file__).resolve().parent / "store.json"

# In-memory copies, loaded from disk on import
USERS: Dict[str, Dict[str, str]] = {}
TOKENS: Dict[str, str] = {}
PLANS: Dict[str, dict] = {}


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def _load_store() -> None:
    global USERS, TOKENS, PLANS
    if STORE_PATH.exists():
        try:
            data = json.loads(STORE_PATH.read_text())
            USERS = data.get("users", {})
            TOKENS = data.get("tokens", {})
            PLANS = data.get("plans", {})
        except Exception:
            USERS = {}
            TOKENS = {}
            PLANS = {}


def _save_store() -> None:
    try:
        data = {"users": USERS, "tokens": TOKENS, "plans": PLANS}
        STORE_PATH.write_text(json.dumps(data))
    except Exception:
        # best-effort for dev only
        pass


_load_store()


def create_user(email: str, password: str, first_name: str = "", last_name: str = "") -> str:
    """Create a user and return an auth token. Raises ValueError if exists."""
    if email in USERS:
        raise ValueError("user_exists")
    USERS[email] = {
        "password_hash": _hash_password(password),
        "first_name": first_name or "",
        "last_name": last_name or "",
    }
    token = secrets.token_urlsafe(32)
    TOKENS[token] = email
    _save_store()
    return token


def authenticate_user(email: str, password: str) -> Optional[str]:
    """Return token if auth succeeds, else None."""
    record = USERS.get(email)
    if not record:
        return None
    if record.get("password_hash") != _hash_password(password):
        return None
    # return existing token if present
    for t, e in TOKENS.items():
        if e == email:
            return t
    token = secrets.token_urlsafe(32)
    TOKENS[token] = email
    _save_store()
    return token


def get_user(email: str) -> Optional[Dict[str, str]]:
    rec = USERS.get(email)
    if not rec:
        return None
    return {"email": email, "first_name": rec.get("first_name", ""), "last_name": rec.get("last_name", "")}


def get_email_for_token(token: str) -> Optional[str]:
    return TOKENS.get(token)


def save_plan_for_email(email: str, plan: dict) -> None:
    PLANS[email] = plan
    _save_store()


def get_plan_for_email(email: str) -> Optional[dict]:
    return PLANS.get(email)


def get_email_for_token(token: str) -> Optional[str]:
    return TOKENS.get(token)
