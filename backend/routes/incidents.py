"""
SuVithiMap - Incidents API Routes
Endpoints for querying, inspecting, filtering, and resolving municipal road hazard incidents.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from backend.database import db

router = APIRouter(prefix="/api/incidents", tags=["Municipal Incidents"])


class ResolveIncidentRequest(BaseModel):
    notes: Optional[str] = "Resolved by Municipal Action Center"
    assigned_to: Optional[str] = None


@router.get("", response_model=List[dict])
def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    incident_type: Optional[str] = None
):
    incidents = db.get_incidents(status=status, severity=severity)
    if incident_type:
        incidents = [i for i in incidents if i.get("incident_type") == incident_type]
    return incidents


@router.get("/{incident_id}")
def get_incident(incident_id: str):
    inc = db.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    
    # Match related detections around this incident's coordinates
    related_dets = [
        d for d in db.get_detections(limit=100)
        if abs(d.get("latitude", 0) - inc.get("latitude", 0)) < 0.005 and
           abs(d.get("longitude", 0) - inc.get("longitude", 0)) < 0.005
    ][:10]

    return {
        "incident": inc,
        "related_detections": related_dets
    }


@router.post("/{incident_id}/resolve")
def resolve_incident(incident_id: str, req: ResolveIncidentRequest):
    updated = db.resolve_incident(incident_id, notes=req.notes)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return {
        "success": True,
        "message": f"Incident {incident_id} has been marked as resolved.",
        "incident": updated
    }
