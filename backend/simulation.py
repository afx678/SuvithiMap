"""
SuVithiMap - Realistic Fleet Simulation Engine
Simulates 10+ public transit sensing buses moving along actual Delhi urban corridors.
Produces real-time AI detections, traffic telemetry, hazard occurrences, and persistent incidents.
"""

import asyncio
import random
import math
from datetime import datetime
from typing import Dict, List, Any, Optional
from backend.database import db
from ai.pipeline import VisionPipeline
from ai.common.models import BusTelemetry

# Geographic waypoint corridors for 10 buses
ROUTE_CORRIDORS = {
    "Route 419 (CP to AIIMS)": [
        (28.6315, 77.2167),
        (28.6250, 77.2130),
        (28.6139, 77.2090),
        (28.6050, 77.2110),
        (28.5983, 77.2144),
        (28.5900, 77.2120),
        (28.5830, 77.2100),
        (28.5750, 77.2100),
        (28.5672, 77.2100)
    ],
    "Route 502 (Mehrauli-ISBT)": [
        (28.5204, 77.1855),
        (28.5350, 77.1920),
        (28.5494, 77.2001),
        (28.5620, 77.2180),
        (28.5721, 77.2382),
        (28.5950, 77.2420),
        (28.6189, 77.2450),
        (28.6420, 77.2360),
        (28.6675, 77.2285)
    ],
    "Route 717 (Aerocity-Nehru Pl)": [
        (28.5528, 77.1216),
        (28.5600, 77.1400),
        (28.5684, 77.1605),
        (28.5710, 77.1780),
        (28.5744, 77.1950),
        (28.5650, 77.2200),
        (28.5504, 77.2505)
    ],
    "Route 801 (Outer Ring Feeder)": [
        (28.5355, 77.2088),
        (28.5400, 77.2250),
        (28.5420, 77.2450),
        (28.5420, 77.2600),
        (28.5400, 77.2750),
        (28.5300, 77.2600)
    ],
    "Route 921 (Dwarka Express)": [
        (28.5800, 77.0600),
        (28.5900, 77.0750),
        (28.6010, 77.0900),
        (28.6120, 77.1100),
        (28.6200, 77.1300)
    ]
}


class FleetSimulationEngine:
    def __init__(self):
        self.is_running: bool = False
        self.speed_multiplier: float = 1.0  # 1x, 2x, 5x
        self.current_scenario: str = "normal"  # normal | monsoon | rush_hour | hazard_surge
        self.pipeline = VisionPipeline(demo_mode=True)
        self.bus_progress: Dict[str, float] = {}
        self.bus_directions: Dict[str, int] = {}  # 1 = forward, -1 = reverse
        self.tick_count = 0
        self.subscribers: List[asyncio.Queue] = []
        self._init_buses()

    def _init_buses(self):
        for bus_id in db.buses.keys():
            self.bus_progress[bus_id] = random.uniform(0.0, 0.8)
            self.bus_directions[bus_id] = 1 if random.random() > 0.5 else -1

    def interpolate_position(self, waypoints: List[tuple], progress: float) -> tuple:
        """
        Smooth piecewise linear interpolation along corridor waypoints.
        """
        n = len(waypoints) - 1
        scaled = progress * n
        idx = int(math.floor(scaled))
        t = scaled - idx

        if idx >= n:
            return waypoints[-1]
        p1 = waypoints[idx]
        p2 = waypoints[idx + 1]

        lat = p1[0] + (p2[0] - p1[0]) * t
        lng = p1[1] + (p2[1] - p1[1]) * t
        return round(lat, 5), round(lng, 5)

    def step(self) -> dict:
        """
        Advance one simulation step across all 10 buses.
        Generates telemetry, AI vision detections, incidents, and traffic events.
        """
        self.tick_count += 1
        updates = []
        new_incidents = []
        new_detections = []
        traffic_updates = []

        for bus_id, bus_data in db.buses.items():
            route_name = bus_data.get("route")
            # Find matching corridor
            corridor = None
            for key in ROUTE_CORRIDORS:
                if key.split()[0] in route_name:
                    corridor = ROUTE_CORRIDORS[key]
                    break
            if not corridor:
                corridor = ROUTE_CORRIDORS["Route 419 (CP to AIIMS)"]

            # Advance progress based on speed
            direction = self.bus_directions[bus_id]
            step_size = (0.015 * self.speed_multiplier) + random.uniform(-0.003, 0.003)
            new_prog = self.bus_progress[bus_id] + (step_size * direction)

            if new_prog >= 1.0:
                new_prog = 1.0
                self.bus_directions[bus_id] = -1
            elif new_prog <= 0.0:
                new_prog = 0.0
                self.bus_directions[bus_id] = 1

            self.bus_progress[bus_id] = new_prog
            lat, lng = self.interpolate_position(corridor, new_prog)

            # Speed modeling based on scenario and corridor traffic
            base_speed = 32.0
            if self.current_scenario == "rush_hour":
                base_speed = 14.0
            elif self.current_scenario == "monsoon":
                base_speed = 18.0

            speed = max(5.0, round(base_speed + random.uniform(-8.0, 10.0), 1))
            heading = round(random.uniform(0.0, 360.0), 1)

            # Update bus telemetry
            bus_update = {
                "latitude": lat,
                "longitude": lng,
                "speed": speed,
                "heading": heading,
                "status": "active",
                "camera_status": "online",
                "gps_status": "online"
            }
            db.update_bus_telemetry(bus_id, bus_update)
            updated_bus = db.get_bus(bus_id)
            updates.append(updated_bus)

            # Run AI pipeline on this bus telemetry
            telemetry = BusTelemetry(
                bus_id=bus_id,
                bus_number=bus_data["bus_number"],
                route=bus_data["route"],
                latitude=lat,
                longitude=lng,
                speed=speed,
                heading=heading
            )

            dets, incs, traffic = self.pipeline.process_bus_tick(
                telemetry=telemetry,
                hazard_bias=self.current_scenario
            )

            # Save detections & incidents to DB
            for d in dets:
                det_dict = d.dict()
                db.add_detection(det_dict)
                new_detections.append(det_dict)

            for inc in incs:
                db.add_incident(inc)
                new_incidents.append(inc)

            # Log traffic event
            t_event = {
                "bus_id": bus_id,
                "vehicle_count": traffic["vehicle_count"],
                "average_speed": traffic["average_speed"],
                "congestion_level": traffic["congestion_level"],
                "latitude": lat,
                "longitude": lng,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            db.add_traffic_event(t_event)
            traffic_updates.append(t_event)

        return {
            "tick": self.tick_count,
            "scenario": self.current_scenario,
            "speed_multiplier": self.speed_multiplier,
            "buses": updates,
            "new_detections_count": len(new_detections),
            "new_incidents": new_incidents,
            "latest_traffic": traffic_updates[:5]
        }

    def start(self):
        self.is_running = True

    def pause(self):
        self.is_running = False

    def reset(self):
        self.is_running = False
        self.tick_count = 0
        self._init_buses()

    def set_scenario(self, scenario: str):
        if scenario in ["normal", "monsoon", "rush_hour", "hazard_surge"]:
            self.current_scenario = scenario

    def set_speed(self, speed: float):
        self.speed_multiplier = max(0.5, min(5.0, speed))

    def get_state(self) -> dict:
        return {
            "is_running": self.is_running,
            "scenario": self.current_scenario,
            "speed_multiplier": self.speed_multiplier,
            "tick_count": self.tick_count,
            "active_buses": len(db.buses),
            "open_incidents": len([i for i in db.incidents.values() if i["status"] != "resolved"])
        }


engine = FleetSimulationEngine()
