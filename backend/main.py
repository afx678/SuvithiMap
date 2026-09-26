"""
SuVithiMap - Central Command Center Backend
Smart India Hackathon 2026 (SIH26124)
FastAPI core application with REST APIs, WebSocket streaming,
background simulation loop, and modular AI pipeline.
"""

import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import settings
from backend.database import get_db_status, db
from backend.simulation import engine
from backend.routes.fleet import router as fleet_router
from backend.routes.incidents import router as incidents_router
from backend.routes.detections import router as detections_router
from backend.routes.analytics import router as analytics_router
from backend.routes.simulation_routes import router as simulation_router
from backend.routes.ai_inference import router as ai_inference_router

# Background task for active simulation
simulation_task = None


async def simulation_worker():
    """Continuously steps simulation when active."""
    while True:
        try:
            if engine.is_running:
                engine.step()
            # Interval scaled inversely by speed multiplier
            sleep_sec = max(0.3, (settings.SIMULATION_TICK_RATE_MS / 1000.0) / engine.speed_multiplier)
            await asyncio.sleep(sleep_sec)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Simulation Worker Error] {e}")
            await asyncio.sleep(1.0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global simulation_task
    # Start background simulation worker
    simulation_task = asyncio.create_task(simulation_worker())
    print("[SuVithiMap Backend] Server started. Simulation worker online.")
    yield
    if simulation_task:
        simulation_task.cancel()
        try:
            await simulation_task
        except asyncio.CancelledError:
            pass
    print("[SuVithiMap Backend] Server shutting down.")


app = FastAPI(
    title="SuVithiMap Command Center API",
    description="AI-Powered Mobile Urban Intelligence Platform Using Public Transport Fleet",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev/hackathon flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(fleet_router)
app.include_router(incidents_router)
app.include_router(detections_router)
app.include_router(analytics_router)
app.include_router(simulation_router)
app.include_router(ai_inference_router)

# Mount static demo files if exists
demo_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "demo")
if os.path.exists(demo_dir):
    app.mount("/demo", StaticFiles(directory=demo_dir), name="demo")


@app.get("/api/health")
def health_check():
    db_status = get_db_status()
    sim_status = engine.get_state()
    return {
        "status": "online",
        "service": "SuVithiMap Urban Sensing Platform",
        "version": "1.0.0",
        "database": db_status,
        "simulation": sim_status
    }


@app.websocket("/ws/telemetry")
async def websocket_telemetry_endpoint(websocket: WebSocket):
    """
    WebSocket channel broadcasting real-time bus telemetry and new road incidents.
    """
    await websocket.accept()
    try:
        while True:
            payload = {
                "buses": db.get_buses(),
                "open_incidents_count": len([i for i in db.incidents.values() if i["status"] != "resolved"]),
                "simulation": engine.get_state()
            }
            await websocket.send_json(payload)
            await asyncio.sleep(1.5)
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"[WebSocket Error] {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
