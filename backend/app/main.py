from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import analyze

app = FastAPI()

# --- CORS Middleware ---
# This allows the frontend (running on localhost:3000) to communicate with the backend.
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)

app.include_router(analyze.router)

@app.get("/")
def read_root():
    return {"message": "PTT Proofreading Backend"}
