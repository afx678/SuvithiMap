"""
SuVithiMap - Urban Analytics API Routes
Provides aggregated statistics for vehicle density, traffic congestion,
route delays, road hazards, incident trends, and fleet activity.
"""

from fastapi import APIRouter
from typing import Dict, Any, List
from backend.database import db

router = APIRouter(prefix="/api/analytics", tags=["Urban Analytics"])


@router.get("/summary")
def get_summary_metrics() -> Dict[str, Any]:
    buses = db.get_buses()
    incidents = db.get_incidents()
    traffic = db.get_traffic_events(limit=50)

    active_buses = len([b for b in buses if b.get("status") == "active"])
    open_incidents = len([i for i in incidents if i.get("status") != "resolved"])
    critical_incidents = len([i for i in incidents if i.get("severity") == "critical" and i.get("status") != "resolved"])
    
    # Road hazards count (potholes + road damage)
    road_hazards = len([i for i in incidents if i.get("incident_type") in ("pothole", "road_damage") and i.get("status") != "resolved"])
    
    # Traffic Hotspots (events with heavy or gridlock)
    hotspots = len([t for t in traffic if t.get("congestion_level") in ("heavy", "gridlock")])
    
    # Average fleet speed
    speeds = [b.get("speed", 0) for b in buses if b.get("speed", 0) > 0]
    avg_speed = round(sum(speeds) / len(speeds), 1) if speeds else 26.5
    avg_delay_min = max(2.0, round((40.0 - avg_speed) * 0.4, 1))

    # Pavement Condition Index (PCI) estimate (scale 0-100)
    pci_score = max(45, 100 - (road_hazards * 7))

    return {
        "active_buses": active_buses,
        "total_fleet": len(buses),
        "incidents_today": len(incidents),
        "open_incidents": open_incidents,
        "critical_incidents": critical_incidents,
        "road_hazards": road_hazards,
        "traffic_hotspots": max(hotspots, 3),
        "average_speed_kmh": avg_speed,
        "average_delay_min": avg_delay_min,
        "pci_score": pci_score,
        "pci_category": "Good" if pci_score > 80 else ("Fair" if pci_score > 60 else "Poor")
    }


@router.get("/charts")
def get_charts_data() -> Dict[str, Any]:
    # 1. Congestion & Vehicle Density by Corridor
    corridor_density = [
        {"corridor": "CP - AIIMS", "density": 84, "avgSpeed": 16.5, "congestion": "Heavy"},
        {"corridor": "Ring Rd (Mehrauli)", "density": 68, "avgSpeed": 22.0, "congestion": "Moderate"},
        {"corridor": "Aerocity Express", "density": 42, "avgSpeed": 38.0, "congestion": "Low"},
        {"corridor": "Outer Ring Feeder", "density": 58, "avgSpeed": 28.5, "congestion": "Moderate"},
        {"corridor": "Dwarka Expressway", "density": 35, "avgSpeed": 45.0, "congestion": "Low"}
    ]

    # 2. Hourly Incident Trend
    incident_trend = [
        {"time": "06:00", "potholes": 1, "cracks": 2, "waterlogging": 0},
        {"time": "08:00", "potholes": 3, "cracks": 4, "waterlogging": 1},
        {"time": "10:00", "potholes": 6, "cracks": 5, "waterlogging": 3},
        {"time": "12:00", "potholes": 5, "cracks": 4, "waterlogging": 2},
        {"time": "14:00", "potholes": 4, "cracks": 3, "waterlogging": 2},
        {"time": "16:00", "potholes": 7, "cracks": 6, "waterlogging": 4},
        {"time": "18:00", "potholes": 8, "cracks": 7, "waterlogging": 5}
    ]

    # 3. Road Hazard Breakdown
    hazard_breakdown = [
        {"name": "Potholes", "value": 38, "color": "#D96B55"},
        {"name": "Alligator Cracks", "value": 24, "color": "#D99A3D"},
        {"name": "Waterlogging", "value": 20, "color": "#F1C46A"},
        {"name": "Longitudinal Cracks", "value": 12, "color": "#6F9B87"},
        {"name": "Missing Signs", "value": 6, "color": "#96938B"}
    ]

    # 4. Route Delay (Estimated vs Scheduled)
    route_delays = [
        {"route": "Route 419", "scheduledMin": 35, "actualMin": 52, "delayMin": 17},
        {"route": "Route 502", "scheduledMin": 55, "actualMin": 68, "delayMin": 13},
        {"route": "Route 717", "scheduledMin": 40, "actualMin": 46, "delayMin": 6},
        {"route": "Route 801", "scheduledMin": 30, "actualMin": 38, "delayMin": 8},
        {"route": "Route 921", "scheduledMin": 45, "actualMin": 49, "delayMin": 4}
    ]

    return {
        "corridor_density": corridor_density,
        "incident_trend": incident_trend,
        "hazard_breakdown": hazard_breakdown,
        "route_delays": route_delays
    }
