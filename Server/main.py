from fastapi import FastAPI

from db import engine
from models import Base

from Chat.routes import router as chat_router
from Users.routes import router as users_router
app = FastAPI()
Base.metadata.create_all(bind=engine)

app.include_router(chat_router)
app.include_router(users_router)
