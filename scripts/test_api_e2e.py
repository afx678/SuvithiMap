"""
End-to-end test of SuVithiMap backend APIs and real AI inference pipeline.
"""

import base64
import os
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    print("Testing GET /api/health...")
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    data = res.json()
    print("  [SUCCESS] Health:", data["status"], "| Service:", data["service"])

def test_ai_status():
    print("\nTesting GET /api/ai/status...")
    res = client.get("/api/ai/status")
    assert res.status_code == 200, res.text
    data = res.json()
    for name, stat in data.items():
        if isinstance(stat, dict):
            status_label = stat.get("ai_status") or stat.get("status") or ("Loaded" if stat.get("loaded") else "Not loaded")
            print(f"  - {name}: {status_label}")
    print("  [SUCCESS] AI Status endpoint working!")

def test_infer_frame():
    print("\nTesting POST /api/ai/infer_frame with sample pothole frame...")
    img_path = "demo/images/pothole_evidence_sample.jpg"
    assert os.path.exists(img_path), f"Missing {img_path}"
    
    with open(img_path, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("utf-8")
        
    payload = {
        "frame_data": b64_data,
        "video_timestamp": 12.4,
        "bus_id": "DL-101",
        "route": "Route 419 (CP to AIIMS)",
        "modes": ["pothole", "vehicle"]
    }
    
    res = client.post("/api/ai/infer_frame", json=payload)
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    print(f"  [SUCCESS] Inferred frame at GPS ({data['telemetry']['latitude']}, {data['telemetry']['longitude']})")
    print(f"  Detections: {len(data['detections'])}")
    for d in data['detections'][:5]:
        print(f"    - Type: {d['detection_type']}, Class: {d['class_name']}, Conf: {d['confidence']}, BBox: {d['bbox']}")
    print(f"  Incidents generated: {len(data['incidents'])}")
    for inc in data['incidents']:
        print(f"    - Incident: {inc['title']}, Evidence URL: {inc.get('evidence_url')}, Simulated: {inc.get('is_simulated')}")

def test_incidents_and_fleet():
    print("\nTesting GET /api/incidents and GET /api/fleet...")
    res_inc = client.get("/api/incidents")
    assert res_inc.status_code == 200
    incidents = res_inc.json()
    print(f"  [SUCCESS] Incidents in store: {len(incidents)}")

    res_fleet = client.get("/api/fleet")
    assert res_fleet.status_code == 200
    buses = res_fleet.json()
    print(f"  [SUCCESS] Buses in store: {len(buses)}")
    dl101 = [b for b in buses if b["id"] == "DL-101"][0]
    print(f"  DL-101 synchronized position: ({dl101['latitude']}, {dl101['longitude']}) speed: {dl101['speed']} km/h")

if __name__ == "__main__":
    test_health()
    test_ai_status()
    test_infer_frame()
    test_incidents_and_fleet()
    print("\n==========================================")
    print("ALL BACKEND & AI INFERENCE TESTS PASSED!")
    print("==========================================")
