from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import events, recommendations

app = FastAPI()

# CORS must come AFTER app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers AFTER middleware
app.include_router(events.router, prefix="/events")
app.include_router(recommendations.router, prefix="/recommendations")

@app.get("/")
def root():
    return {"message": "API running"}
