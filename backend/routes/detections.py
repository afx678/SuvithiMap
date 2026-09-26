"""
SuVithiMap - Detections API Routes
Audit trail of raw detections streaming from fleet cameras.
"""

from fastapi import APIRouter
from typing import List, Optional
from backend.database import db

router = APIRouter(prefix="/api/detections", tags=["Detections Audit"])


@router.get("", response_model=List[dict])
def list_detections(limit: int = 50, detection_type: Optional[str] = None, bus_id: Optional[str] = None):
    dets = db.get_detections(limit=limit)
    if bus_id:
        alias = db.BUS_ALIASES.get(bus_id.upper(), bus_id.upper())
        dets = [d for d in dets if d.get("bus_id") in (bus_id, bus_id.upper(), alias)]
    if detection_type:
        dets = [d for d in dets if d.get("detection_type") == detection_type]
    return dets
