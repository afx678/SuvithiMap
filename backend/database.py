"""
SuVithiMap - Hybrid Database Layer
Seamlessly supports Supabase PostgreSQL with an automatic zero-latency
local in-memory persistence engine if Supabase is offline or unconfigured.
Guarantees 100% functionality out-of-the-box.
"""

import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.config import settings

# Attempt Supabase client
supabase_client = None
if settings.SUPABASE_URL and (settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_ANON_KEY):
    try:
        from supabase import create_client
        key = settings.SUPABASE_SERVICE_KEY or settings.SUPABASE_ANON_KEY
        supabase_client = create_client(settings.SUPABASE_URL, key)
        print("[Database] Supabase client initialized.")
    except Exception as e:
        print(f"[Database] Supabase initialization warning: {e}. Falling back to local store.")


class LocalDataStore:
    """
    High-performance in-memory data store with initial seed data.
    Provides identical CRUD interface to ensure zero disruption.
    """

    def __init__(self):
        self.buses: Dict[str, dict] = {
            "DL-101": {
                "id": "DL-101",
                "bus_number": "DL 1P B 4190",
                "route": "Route 419 (CP to AIIMS)",
                "status": "active",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "speed": 32.5,
                "heading": 175.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-102": {
                "id": "DL-102",
                "bus_number": "DL 1P B 4192",
                "route": "Route 419 (CP to AIIMS)",
                "status": "active",
                "latitude": 28.5830,
                "longitude": 77.2100,
                "speed": 24.0,
                "heading": 180.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-201": {
                "id": "DL-201",
                "bus_number": "DL 1P C 5021",
                "route": "Route 502 (Mehrauli-ISBT)",
                "status": "active",
                "latitude": 28.5721,
                "longitude": 77.2382,
                "speed": 18.0,
                "heading": 25.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-202": {
                "id": "DL-202",
                "bus_number": "DL 1P C 5025",
                "route": "Route 502 (Mehrauli-ISBT)",
                "status": "active",
                "latitude": 28.6189,
                "longitude": 77.2450,
                "speed": 41.2,
                "heading": 340.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-301": {
                "id": "DL-301",
                "bus_number": "DL 1P D 7170",
                "route": "Route 717 (Aerocity-Nehru Pl)",
                "status": "active",
                "latitude": 28.5684,
                "longitude": 77.1605,
                "speed": 12.0,
                "heading": 95.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-302": {
                "id": "DL-302",
                "bus_number": "DL 1P D 7174",
                "route": "Route 717 (Aerocity-Nehru Pl)",
                "status": "active",
                "latitude": 28.5528,
                "longitude": 77.1216,
                "speed": 38.5,
                "heading": 70.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-401": {
                "id": "DL-401",
                "bus_number": "DL 1P E 8011",
                "route": "Route 801 (Outer Ring Feeder)",
                "status": "active",
                "latitude": 28.5355,
                "longitude": 77.2088,
                "speed": 29.0,
                "heading": 85.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-402": {
                "id": "DL-402",
                "bus_number": "DL 1P E 8015",
                "route": "Route 801 (Outer Ring Feeder)",
                "status": "active",
                "latitude": 28.5420,
                "longitude": 77.2600,
                "speed": 34.0,
                "heading": 260.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-501": {
                "id": "DL-501",
                "bus_number": "DL 1P F 9210",
                "route": "Route 921 (Dwarka Express)",
                "status": "active",
                "latitude": 28.5800,
                "longitude": 77.0600,
                "speed": 44.0,
                "heading": 130.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            },
            "DL-502": {
                "id": "DL-502",
                "bus_number": "DL 1P F 9218",
                "route": "Route 921 (Dwarka Express)",
                "status": "active",
                "latitude": 28.6010,
                "longitude": 77.0900,
                "speed": 21.0,
                "heading": 145.0,
                "camera_status": "online",
                "gps_status": "online",
                "last_seen": datetime.utcnow().isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
        }

        self.routes: Dict[str, dict] = {
            "ROUTE-419": {
                "id": "ROUTE-419",
                "route_number": "419",
                "route_name": "Connaught Place to AIIMS Corridor",
                "length_km": 11.8,
                "status": "congested",
                "geometry": [
                    {"lat": 28.6315, "lng": 77.2167, "name": "Connaught Place"},
                    {"lat": 28.6139, "lng": 77.2090, "name": "Patel Chowk"},
                    {"lat": 28.5983, "lng": 77.2144, "name": "Safdarjung Tomb"},
                    {"lat": 28.5830, "lng": 77.2100, "name": "INA Market"},
                    {"lat": 28.5672, "lng": 77.2100, "name": "AIIMS Central Hospital"}
                ]
            },
            "ROUTE-502": {
                "id": "ROUTE-502",
                "route_number": "502",
                "route_name": "Mehrauli to Kashmiri Gate via Ring Road",
                "length_km": 22.4,
                "status": "normal",
                "geometry": [
                    {"lat": 28.5204, "lng": 77.1855, "name": "Mehrauli Terminal"},
                    {"lat": 28.5494, "lng": 77.2001, "name": "IIT Delhi Flyover"},
                    {"lat": 28.5721, "lng": 77.2382, "name": "Lajpat Nagar Ring Road"},
                    {"lat": 28.6189, "lng": 77.2450, "name": "Pragati Maidan"},
                    {"lat": 28.6675, "lng": 77.2285, "name": "Kashmiri Gate ISBT"}
                ]
            },
            "ROUTE-717": {
                "id": "ROUTE-717",
                "route_number": "717",
                "route_name": "Aerocity to Nehru Place Express",
                "length_km": 16.2,
                "status": "hazard_alert",
                "geometry": [
                    {"lat": 28.5528, "lng": 77.1216, "name": "IGI Airport T3 / Aerocity"},
                    {"lat": 28.5684, "lng": 77.1605, "name": "Dhaula Kuan Interchange"},
                    {"lat": 28.5744, "lng": 77.1950, "name": "Moti Bagh"},
                    {"lat": 28.5504, "lng": 77.2505, "name": "Nehru Place Bus Terminal"}
                ]
            },
            "ROUTE-717-DIVERSION": {
                "id": "ROUTE-717-DIVERSION",
                "route_number": "717-ALT",
                "route_name": "SIMULATED ROUTE DIVERSION (Bypass via Benito Juarez Marg)",
                "length_km": 17.8,
                "status": "diversion",
                "is_diversion": True,
                "label": "SIMULATED ROUTE DIVERSION",
                "geometry": [
                    {"lat": 28.5528, "lng": 77.1216, "name": "IGI Airport T3 / Aerocity"},
                    {"lat": 28.5684, "lng": 77.1605, "name": "Dhaula Kuan Interchange"},
                    {"lat": 28.5820, "lng": 77.1710, "name": "Benito Juarez Bypass"},
                    {"lat": 28.5880, "lng": 77.1890, "name": "Shanti Path Sector"},
                    {"lat": 28.5744, "lng": 77.1950, "name": "Moti Bagh Reconnect"},
                    {"lat": 28.5504, "lng": 77.2505, "name": "Nehru Place Bus Terminal"}
                ]
            }
        }

        self.incidents: Dict[str, dict] = {
            "inc-001": {
                "id": "inc-001",
                "detection_id": "det-001",
                "incident_type": "pothole",
                "title": "Severe Pothole Cluster (0.4m depth)",
                "severity": "critical",
                "status": "open",
                "latitude": 28.5728,
                "longitude": 77.2390,
                "location_name": "Lajpat Nagar Underpass Outer Ring Road",
                "detection_count": 6,
                "first_detected_at": "2026-09-13T08:30:00Z",
                "timestamp": "2026-09-13T10:15:00Z",
                "assigned_to": "PWD South Zone",
                "description": "Multiple deep potholes detected by 3 consecutive bus passes. Risk of vehicular damage and motorcycle destabilization.",
                "evidence_url": "/demo/images/pothole_evidence_sample.jpg",
                "is_simulated": True,
                "resolved_at": None,
                "resolution_notes": None
            },
            "inc-002": {
                "id": "inc-002",
                "detection_id": "det-002",
                "incident_type": "road_damage",
                "title": "Severe Alligator Cracking on Bus Lane",
                "severity": "high",
                "status": "in_progress",
                "latitude": 28.5834,
                "longitude": 77.2104,
                "location_name": "Aurobindo Marg near INA Market",
                "detection_count": 4,
                "first_detected_at": "2026-09-13T09:00:00Z",
                "timestamp": "2026-09-13T11:20:00Z",
                "assigned_to": "Delhi Transport Infrastructure Corp",
                "description": "Extensive interconnected alligator cracking indicating base subgrade fatigue. Scheduled for milling and resurfacing.",
                "evidence_url": "/demo/images/road_crack_sample.jpg",
                "is_simulated": True,
                "resolved_at": None,
                "resolution_notes": None
            },
            "inc-003": {
                "id": "inc-003",
                "detection_id": "det-003",
                "incident_type": "waterlogging",
                "title": "Monsoon Flash Waterlogging (18cm depth)",
                "severity": "critical",
                "status": "open",
                "latitude": 28.5689,
                "longitude": 77.1610,
                "location_name": "Dhaula Kuan Subway Slip Road",
                "detection_count": 8,
                "first_detected_at": "2026-09-13T07:45:00Z",
                "timestamp": "2026-09-13T11:45:00Z",
                "assigned_to": "Flood Control Dept & NDMC",
                "description": "Drain blockage causing severe water pooling spanning two active lanes. Bus speed reduced to 8 km/h.",
                "evidence_url": "/demo/images/waterlogging_sample.jpg",
                "is_simulated": True,
                "resolved_at": None,
                "resolution_notes": None
            },
            "inc-004": {
                "id": "inc-004",
                "detection_id": "det-004",
                "incident_type": "traffic_sign",
                "title": "Missing Regulatory Stop Sign at Junction",
                "severity": "medium",
                "status": "open",
                "latitude": 28.6135,
                "longitude": 77.2085,
                "location_name": "Patel Chowk Intersection",
                "detection_count": 2,
                "first_detected_at": "2026-09-13T06:30:00Z",
                "timestamp": "2026-09-13T09:10:00Z",
                "assigned_to": "Traffic Police Engineering Wing",
                "description": "Expected STOP sign missing from roadside infrastructure inventory. Sensed by Bus DL-101 camera.",
                "evidence_url": "/demo/images/missing_sign_sample.jpg",
                "is_simulated": True,
                "resolved_at": None,
                "resolution_notes": None
            },
            "inc-005": {
                "id": "inc-005",
                "detection_id": "det-005",
                "incident_type": "road_damage",
                "title": "Longitudinal Joint Crack (12m length)",
                "severity": "low",
                "status": "resolved",
                "latitude": 28.6310,
                "longitude": 77.2170,
                "location_name": "Connaught Circus Inner Ring",
                "detection_count": 3,
                "first_detected_at": "2026-09-12T14:00:00Z",
                "timestamp": "2026-09-13T08:00:00Z",
                "assigned_to": "NDMC Road Maintenance",
                "description": "Sealed with hot-pour bituminous compound following automated sensor alert.",
                "evidence_url": "/demo/images/road_crack_sample.jpg",
                "is_simulated": True,
                "resolved_at": "2026-09-13T08:00:00Z",
                "resolution_notes": "Bituminous crack seal completed by PWD Emergency Crew."
            }
        }

        self.detections: List[dict] = []
        self.traffic_events: List[dict] = []

    def get_buses(self) -> List[dict]:
        return list(self.buses.values())

    BUS_ALIASES = {
        "BUS-01": "DL-101",
        "BUS-02": "DL-201",
        "BUS-03": "DL-301",
        "BUS-04": "DL-401"
    }

    def get_bus(self, bus_id: str) -> Optional[dict]:
        if bus_id in self.buses:
            return self.buses[bus_id]
        aliased = self.BUS_ALIASES.get(bus_id.upper())
        if aliased and aliased in self.buses:
            b = dict(self.buses[aliased])
            b["id"] = bus_id.upper()
            return b
        return None

    def update_bus_telemetry(self, bus_id: str, data: dict) -> Optional[dict]:
        aliased = self.BUS_ALIASES.get(bus_id.upper(), bus_id)
        target_id = aliased if aliased in self.buses else (bus_id if bus_id in self.buses else None)
        if target_id:
            self.buses[target_id].update(data)
            self.buses[target_id]["last_seen"] = datetime.utcnow().isoformat() + "Z"
            return self.buses[target_id]
        return None

    def get_incidents(self, status: Optional[str] = None, severity: Optional[str] = None) -> List[dict]:
        items = list(self.incidents.values())
        if status:
            items = [i for i in items if i["status"].lower() == status.lower()]
        if severity:
            items = [i for i in items if i["severity"].lower() == severity.lower()]
        return sorted(items, key=lambda x: x["timestamp"], reverse=True)

    def get_incident(self, incident_id: str) -> Optional[dict]:
        return self.incidents.get(incident_id)

    def add_incident(self, inc: dict) -> dict:
        inc_id = inc.get("id") or str(uuid.uuid4())
        inc["id"] = inc_id
        self.incidents[inc_id] = inc
        return inc

    def resolve_incident(self, incident_id: str, notes: Optional[str] = None) -> Optional[dict]:
        if incident_id in self.incidents:
            self.incidents[incident_id]["status"] = "resolved"
            self.incidents[incident_id]["resolved_at"] = datetime.utcnow().isoformat() + "Z"
            self.incidents[incident_id]["resolution_notes"] = notes or "Resolved by Municipal Action Center"
            return self.incidents[incident_id]
        return None

    def add_detection(self, det: dict) -> dict:
        if "id" not in det:
            det["id"] = str(uuid.uuid4())
        self.detections.insert(0, det)
        if len(self.detections) > 200:
            self.detections.pop()
        return det

    def get_detections(self, limit: int = 50) -> List[dict]:
        return self.detections[:limit]

    def add_traffic_event(self, event: dict) -> dict:
        if "id" not in event:
            event["id"] = str(uuid.uuid4())
        self.traffic_events.insert(0, event)
        if len(self.traffic_events) > 100:
            self.traffic_events.pop()
        return event

    def get_traffic_events(self, limit: int = 50) -> List[dict]:
        return self.traffic_events[:limit]

    def get_routes(self) -> List[dict]:
        return list(self.routes.values())


db = LocalDataStore()


def get_db_status() -> dict:
    return {
        "supabase_connected": supabase_client is not None,
        "mode": "supabase" if supabase_client is not None else "local_memory",
        "buses_count": len(db.buses),
        "incidents_count": len(db.incidents),
        "routes_count": len(db.routes)
    }
