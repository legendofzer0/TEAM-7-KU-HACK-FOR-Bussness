import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import Depends, HTTPException, status, Request

# Initialize Firebase Admin
cred = credentials.Certificate("firebaseCredential.json")

try:
    firebase_admin.get_app()
except ValueError:
    firebase_admin.initialize_app(cred)


# Dependency function to verify token and return user info
def verify_firebase_token(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Authorization header",
        )

    id_token = auth_header.split(" ")[1]

    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email")
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
