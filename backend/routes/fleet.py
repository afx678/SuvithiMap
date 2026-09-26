"""
SuVithiMap - Fleet API Routes
Endpoints for querying bus status, real-time telemetry, and camera health.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from backend.database import db

router = APIRouter(prefix="/api/fleet", tags=["Fleet Management"])


@router.get("", response_model=List[dict])
def list_buses(status: Optional[str] = None):
    buses = db.get_buses()
    if status:
        buses = [b for b in buses if b.get("status", "").lower() == status.lower()]
    return buses


@router.get("/{bus_id}")
def get_bus_details(bus_id: str):
    bus = db.get_bus(bus_id)
    if not bus:
        raise HTTPException(status_code=404, detail=f"Bus {bus_id} not found")
    
    # Attach recent detections by this bus
    recent_dets = [d for d in db.get_detections(limit=50) if d.get("bus_id") == bus_id][:10]
    return {
        "bus": bus,
        "recent_detections": recent_dets
    }


@router.get("/routes/all")
def list_routes():
    return db.get_routes()
