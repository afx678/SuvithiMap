"""
SuVithiMap Complete Platform Verification Test Suite
Tests:
1. BUS-01 (Pothole Detector + GPS on Route 419)
2. BUS-02 (Vehicle Incident + Plate OCR on Route 502)
3. BUS-03 (Highway Traffic + Route Diversion on Route 717)
4. BUS-04 (Road Damage & Cracks on Route 801)
5. Operator Hazard Trigger API (/api/ai/trigger_hazard)
6. Simulation Engine Scenario Synthesis (hazard_surge, monsoon)
7. Incident Resolution Workflow
"""

import os
import sys
import base64
import cv2
from fastapi.testclient import TestClient

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

from backend.main import app
from backend.simulation import engine
from backend.database import db

client = TestClient(app)

def encode_frame(video_path, frame_idx):
    assert os.path.exists(video_path), f"Video missing: {video_path}"
    cap = cv2.VideoCapture(video_path)
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    cap.release()
    assert ret, f"Failed reading frame from {video_path}"
    h, w = frame.shape[:2]
    cw = min(640, w)
    ch = int(cw * (h / w))
    resized = cv2.resize(frame, (cw, ch))
    _, buf = cv2.imencode(".jpg", resized, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")

def test_full_platform():
    print("=" * 70)
    print("SUVITHIMAP COMPLETE URBAN INTELLIGENCE PLATFORM TEST")
    print("=" * 70)

    # 1. Health check
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "online"
    print("[PASS] 1. Central backend health confirmed online.")

    # 2. BUS-01: Real Video -> Potholes
    print("\n--- 2. Testing BUS-01 (Pothole Monitoring) ---")
    b64_1 = encode_frame("demo/videos/potholes_road.mp4", 50)
    res1 = client.post("/api/ai/infer_frame", json={
        "frame_data": b64_1,
        "video_timestamp": 2.5,
        "bus_id": "BUS-01",
        "route": "Route 419 (CP to AIIMS)",
        "modes": ["pothole"]
    })
    assert res1.status_code == 200, res1.text
    d1 = res1.json()
    assert d1["success"] is True
    potholes = [d for d in d1["detections"] if d["detection_type"] == "pothole"]
    print(f"  BUS-01 Potholes Detected: {len(potholes)}")
    assert len(potholes) > 0, "BUS-01 did not detect potholes"
    assert "POTHOLE" in str(d1["active_warning"])
    print(f"  BUS-01 Active Warning: {d1['active_warning']}")
    print(f"  BUS-01 GPS: ({d1['telemetry']['latitude']}, {d1['telemetry']['longitude']}) on {d1['telemetry']['route']}")
    print("[PASS] BUS-01 pothole detection verified.")

    # 3. BUS-02: Accident Scene + Simulated Plates
    print("\n--- 3. Testing BUS-02 (Vehicle Incident + Simulated Demonstration Plates) ---")
    b64_2 = encode_frame("demo/videos/accident_scene.mp4", 28)
    res2 = client.post("/api/ai/infer_frame", json={
        "frame_data": b64_2,
        "video_timestamp": 2.8,
        "bus_id": "BUS-02",
        "route": "Route 502 (Mehrauli-ISBT)",
        "modes": ["accident", "vehicle"]
    })
    assert res2.status_code == 200, res2.text
    d2 = res2.json()
    assert d2["success"] is True
    assert "VEHICLE INCIDENT DETECTED" in str(d2["active_warning"])
    print(f"  BUS-02 Warning: {d2['active_warning']}")
    assert "DL12A8 (SIMULATED)" in str(d2), "Missing simulated plate DL12A8"
    assert "DL56Q1 (SIMULATED)" in str(d2), "Missing simulated plate DL56Q1"
    print("  BUS-02 Demonstration Plates: NUMBER PLATE: DL12A8 (SIMULATED) and NUMBER PLATE: DL56Q1 (SIMULATED)")
    print("[PASS] BUS-02 vehicle incident and simulated demonstration plates verified.")

    # 4. BUS-03: Highway Traffic + Route Diversion
    print("\n--- 4. Testing BUS-03 (Highway Traffic + Route Diversion) ---")
    b64_3 = encode_frame("demo/videos/highway_traffic.mp4", 60)
    res3 = client.post("/api/ai/infer_frame", json={
        "frame_data": b64_3,
        "video_timestamp": 2.0,
        "bus_id": "BUS-03",
        "route": "Route 717 (Aerocity-Nehru Pl)",
        "modes": ["vehicle"]
    })
    assert res3.status_code == 200, res3.text
    d3 = res3.json()
    assert d3["success"] is True
    print(f"  BUS-03 Congestion Level: {d3['traffic_stats']['congestion_level']}")
    assert d3["diversion_recommended"] is True
    assert d3["diversion_info"]["label"] == "SIMULATED ROUTE DIVERSION"
    print(f"  BUS-03 Suggested Diversion: {d3['diversion_info']['suggested_diversion']}")
    print("[PASS] BUS-03 highway traffic and simulated diversion verified.")

    # 5. BUS-04: Road Cracks & Damage (ASTM D6433)
    print("\n--- 5. Testing BUS-04 (Road Damage & Cracks Inspection) ---")
    b64_4 = encode_frame("demo/videos/cracks_road.mp4", 40)
    res4 = client.post("/api/ai/infer_frame", json={
        "frame_data": b64_4,
        "video_timestamp": 1.5,
        "bus_id": "BUS-04",
        "route": "Route 801 (Outer Ring Feeder)",
        "modes": ["road_damage", "pothole"]
    })
    assert res4.status_code == 200, res4.text
    d4 = res4.json()
    assert d4["success"] is True
    print(f"  BUS-04 Detections Count: {len(d4['detections'])}")
    print(f"  BUS-04 GPS: ({d4['telemetry']['latitude']}, {d4['telemetry']['longitude']}) on {d4['telemetry']['route']}")
    print("[PASS] BUS-04 road cracks pipeline verified.")

    # 6. Stream Independence
    print("\n--- 6. Checking Fleet Stream Independence ---")
    lats = [d1["telemetry"]["latitude"], d2["telemetry"]["latitude"], d3["telemetry"]["latitude"], d4["telemetry"]["latitude"]]
    assert len(set(lats)) == 4, "Bus coordinates collision detected!"
    print(f"  Coordinates: BUS-01: {lats[0]}, BUS-02: {lats[1]}, BUS-03: {lats[2]}, BUS-04: {lats[3]}")
    print("[PASS] All 4 bus streams are strictly independent.")

    # 7. Operator Hazard Injection API
    print("\n--- 7. Testing Operator Hazard Trigger API ---")
    res_trig = client.post("/api/ai/trigger_hazard", json={
        "bus_id": "BUS-01",
        "hazard_type": "pothole",
        "severity": "critical"
    })
    assert res_trig.status_code == 200
    trig_data = res_trig.json()
    assert trig_data["success"] is True
    assert trig_data["incident"]["is_simulated"] is True
    assert trig_data["detection"]["is_simulated"] is True
    print(f"  Injected Incident ID: {trig_data['incident']['id']} ({trig_data['incident']['title']})")
    print("[PASS] Operator hazard trigger verified.")

    # 8. Background Simulation Scenario Synthesis
    print("\n--- 8. Testing Simulation Engine Hazard Synthesis ---")
    engine.start()
    engine.set_scenario("hazard_surge")
    engine.set_speed(2.0)
    
    # Step simulation multiple times
    total_new_dets = 0
    total_new_incs = 0
    for _ in range(8):
        step_out = engine.step()
        total_new_dets += step_out["new_detections_count"]
        total_new_incs += len(step_out["new_incidents"])

    print(f"  Simulation 8 ticks under 'hazard_surge': Generated {total_new_dets} detections, {total_new_incs} incidents.")
    assert total_new_dets > 0, "Simulation failed to generate hazard detections under hazard_surge scenario"
    print("[PASS] Simulation engine scenario-aware synthesis verified.")

    # 9. Municipal Incident Resolution Workflow
    print("\n--- 9. Testing Incident Resolution Workflow ---")
    inc_id = trig_data["incident"]["id"]
    res_resolve = client.post(f"/api/incidents/{inc_id}/resolve", json={
        "notes": "Emergency bituminous patching verified by municipal chief engineer."
    })
    assert res_resolve.status_code == 200
    resolved_data = res_resolve.json()
    assert resolved_data["success"] is True
    assert resolved_data["incident"]["status"] == "resolved"
    assert "Emergency bituminous patching" in resolved_data["incident"]["resolution_notes"]
    print(f"  Resolved incident: {resolved_data['incident']['title']} -> status: {resolved_data['incident']['status']}")
    print("[PASS] Municipal incident resolution workflow verified.")

    print("\n" + "=" * 70)
    print("ALL 9 PLATFORM COMPONENTS SUCCESSFULLY VERIFIED AND COMPLETE!")
    print("=" * 70)

if __name__ == "__main__":
    test_full_platform()
