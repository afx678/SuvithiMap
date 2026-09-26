"""
SuVithiMap - Spatial Clustering & Incident Aggregator
Deduplicates multiple sightings of the same road hazard (by the same bus or multiple buses)
within a spatial distance threshold into persistent, verified Municipal Incidents.
"""

import math
from typing import List, Dict, Optional
from datetime import datetime
from ai.common.models import DetectionResult


def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in meters between two lat/long points using Haversine formula."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


class IncidentClusterer:
    """
    Maintains active road incidents and matches incoming detections.
    If a detection is within `cluster_radius_m` (default 25m) of an existing incident
    of matching type, the incident's count and confidence are reinforced.
    Otherwise, a new incident candidate is generated.
    """

    def __init__(self, cluster_radius_m: float = 25.0):
        self.cluster_radius_m = cluster_radius_m
        self.active_incidents: Dict[str, dict] = {}

    def process_detection(self, det: DetectionResult) -> Optional[dict]:
        """
        Check detection against active incidents.
        Returns:
            - existing incident updated (with incremented count)
            - or newly generated incident if high confidence / severity warrants an incident.
        """
        # Only create incidents for road hazards and critical conditions
        hazard_types = {"pothole", "road_damage", "waterlogging", "missing_sign", "congestion", "accident"}
        if det.detection_type not in hazard_types:
            return None

        # Check for proximity to existing incidents
        matched_incident_id = None
        for inc_id, inc in self.active_incidents.items():
            if inc["incident_type"] == det.detection_type and inc["status"] != "resolved":
                dist = haversine_distance_meters(inc["latitude"], inc["longitude"], det.latitude, det.longitude)
                if dist <= self.cluster_radius_m:
                    matched_incident_id = inc_id
                    break

        if matched_incident_id:
            # Update existing incident
            inc = self.active_incidents[matched_incident_id]
            inc["detection_count"] += 1
            inc["last_detected_at"] = det.timestamp
            # If new detection has higher severity, elevate incident
            severity_rank = {"low": 1, "medium": 2, "high": 3, "critical": 4}
            if severity_rank.get(det.severity, 1) > severity_rank.get(inc["severity"], 1):
                inc["severity"] = det.severity
            return inc
        else:
            # Formulate new incident if severity or confidence meets threshold
            if det.confidence >= 0.30 or det.severity in {"high", "critical"}:
                import uuid
                new_id = str(uuid.uuid4())
                title_map = {
                    "pothole": f"Pothole Hazard ({det.class_name.capitalize()})",
                    "road_damage": f"Pavement Damage: {det.class_name.replace('_', ' ').capitalize()}",
                    "waterlogging": f"Waterlogging Accumulation ({det.severity.upper()})",
                    "missing_sign": f"Missing Sign Alert: {det.class_name}",
                    "congestion": f"Traffic Bottleneck ({det.severity.upper()})",
                    "accident": f"Road Accident Alert ({det.severity.upper()})"
                }
                title = title_map.get(det.detection_type, f"Road Hazard: {det.class_name}")

                new_incident = {
                    "id": new_id,
                    "detection_id": det.id or str(uuid.uuid4()),
                    "incident_type": det.detection_type,
                    "title": title,
                    "severity": det.severity,
                    "status": "open",
                    "latitude": det.latitude,
                    "longitude": det.longitude,
                    "location_name": f"Lat {det.latitude:.4f}, Long {det.longitude:.4f}",
                    "detection_count": 1,
                    "first_detected_at": det.timestamp,
                    "timestamp": det.timestamp,
                    "assigned_to": "Municipal Road Works Department",
                    "description": f"Automated AI detection by Mobile Urban Sensing Unit {det.bus_id}. Confidence: {int(det.confidence * 100)}%.",
                    "evidence_url": det.evidence_path or "/demo/images/pothole_evidence_sample.jpg",
                    "is_simulated": det.is_simulated,
                    "resolved_at": None,
                    "resolution_notes": None
                }
                self.active_incidents[new_id] = new_incident
                return new_incident

        return None
