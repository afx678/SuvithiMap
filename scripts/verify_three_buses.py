import os
import sys
import base64
import cv2
import requests

if sys.stdout.encoding != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PROXIED_BASE = "http://127.0.0.1:5173"

def test_three_buses():
    print("=" * 65)
    print("SUVITHIMAP THREE INDEPENDENT REAL-VIDEO BUS PIPELINES TEST")
    print("=" * 65)

    # Check videos exist
    v1 = "demo/videos/potholes_road.mp4"
    v2 = "demo/videos/accident_scene.mp4"
    v3 = "demo/videos/highway_traffic.mp4"
    assert os.path.exists(v1), f"Missing BUS-01 video: {v1}"
    assert os.path.exists(v2), f"Missing BUS-02 video: {v2}"
    assert os.path.exists(v3), f"Missing BUS-03 video: {v3}"
    print("[PASS] All 3 real recorded road videos verified on disk.")

    # -------------------------------------------------------------
    # 1. BUS-01 — Real Video -> Pothole Detection -> Warning -> GPS
    # -------------------------------------------------------------
    print("\n--- Testing BUS-01 (Pothole Monitoring) ---")
    cap1 = cv2.VideoCapture(v1)
    cap1.set(cv2.CAP_PROP_POS_FRAMES, 50)
    ret1, f1 = cap1.read()
    cap1.release()
    assert ret1, "Failed to read BUS-01 video frame"

    h1, w1 = f1.shape[:2]
    cw1 = min(640, w1)
    ch1 = int(cw1 * (h1 / w1))
    r1 = cv2.resize(f1, (cw1, ch1))
    _, b1 = cv2.imencode(".jpg", r1, [cv2.IMWRITE_JPEG_QUALITY, 80])
    b64_1 = "data:image/jpeg;base64," + base64.b64encode(b1).decode("utf-8")

    res1 = requests.post(f"{PROXIED_BASE}/api/ai/infer_frame", json={
        "frame_data": b64_1,
        "video_timestamp": 2.1,
        "bus_id": "BUS-01",
        "route": "Route 419 (CP to AIIMS)",
        "modes": ["pothole"]
    })
    assert res1.status_code == 200, res1.text
    data1 = res1.json()
    assert data1["success"] is True
    assert data1["bus_id"] == "BUS-01"
    
    # Check pothole detections
    potholes = [d for d in data1["detections"] if d["detection_type"] == "pothole"]
    print(f"  BUS-01 Potholes Detected: {len(potholes)}")
    assert len(potholes) > 0, "BUS-01 did not detect potholes in sample frame"
    assert "POTHOLE DETECTED" in str(data1["active_warning"]), f"Wrong warning: {data1['active_warning']}"
    print(f"  BUS-01 Warning: {repr(data1['active_warning'])}")
    print(f"  BUS-01 GPS: ({data1['telemetry']['latitude']}, {data1['telemetry']['longitude']}) on {data1['telemetry']['route']}")
    print("[PASS] BUS-01 pothole detection and warning verified.")

    # -------------------------------------------------------------
    # 2. BUS-02 — Real Video -> Incident Monitoring + Simulated Plates
    # -------------------------------------------------------------
    print("\n--- Testing BUS-02 (Vehicle Incident + Simulated Plates) ---")
    cap2 = cv2.VideoCapture(v2)
    cap2.set(cv2.CAP_PROP_POS_FRAMES, 28)
    ret2, f2 = cap2.read()
    cap2.release()
    assert ret2, "Failed to read BUS-02 video frame"

    h2, w2 = f2.shape[:2]
    cw2 = min(640, w2)
    ch2 = int(cw2 * (h2 / w2))
    r2 = cv2.resize(f2, (cw2, ch2))
    _, b2 = cv2.imencode(".jpg", r2, [cv2.IMWRITE_JPEG_QUALITY, 80])
    b64_2 = "data:image/jpeg;base64," + base64.b64encode(b2).decode("utf-8")

    res2 = requests.post(f"{PROXIED_BASE}/api/ai/infer_frame", json={
        "frame_data": b64_2,
        "video_timestamp": 2.8,
        "bus_id": "BUS-02",
        "route": "Route 502 (Mehrauli-ISBT)",
        "modes": ["accident", "vehicle"]
    })
    assert res2.status_code == 200, res2.text
    data2 = res2.json()
    assert data2["success"] is True
    assert data2["bus_id"] == "BUS-02"

    acc_dets = [d for d in data2["detections"] if d["detection_type"] == "accident"]
    veh_dets = [d for d in data2["detections"] if d["detection_type"] == "vehicle"]
    print(f"  BUS-02 Accident Detections: {len(acc_dets)}")
    print(f"  BUS-02 Tracked Vehicles: {len(veh_dets)}")
    
    # Check warning
    assert "VEHICLE INCIDENT DETECTED" in str(data2["active_warning"]), f"Wrong warning: {data2['active_warning']}"
    print(f"  BUS-02 Warning: {repr(data2['active_warning'])}")

    # Check simulated demonstration plates
    assert "DL12A8 (SIMULATED)" in str(data2), "Missing simulated plate DL12A8"
    assert "DL56Q1 (SIMULATED)" in str(data2), "Missing simulated plate DL56Q1"
    print("  BUS-02 Demonstration Plates: NUMBER PLATE: DL12A8 (SIMULATED) and NUMBER PLATE: DL56Q1 (SIMULATED)")
    print(f"  BUS-02 GPS: ({data2['telemetry']['latitude']}, {data2['telemetry']['longitude']}) on {data2['telemetry']['route']}")
    print("[PASS] BUS-02 vehicle incident and simulated demonstration plates verified.")

    # -------------------------------------------------------------
    # 3. BUS-03 — Real Highway Video -> Traffic Congestion + Diversion
    # -------------------------------------------------------------
    print("\n--- Testing BUS-03 (Highway Traffic Intelligence + Route Diversion) ---")
    cap3 = cv2.VideoCapture(v3)
    cap3.set(cv2.CAP_PROP_POS_FRAMES, 60)
    ret3, f3 = cap3.read()
    cap3.release()
    assert ret3, "Failed to read BUS-03 video frame"

    h3, w3 = f3.shape[:2]
    cw3 = min(640, w3)
    ch3 = int(cw3 * (h3 / w3))
    r3 = cv2.resize(f3, (cw3, ch3))
    _, b3 = cv2.imencode(".jpg", r3, [cv2.IMWRITE_JPEG_QUALITY, 80])
    b64_3 = "data:image/jpeg;base64," + base64.b64encode(b3).decode("utf-8")

    res3 = requests.post(f"{PROXIED_BASE}/api/ai/infer_frame", json={
        "frame_data": b64_3,
        "video_timestamp": 2.0,
        "bus_id": "BUS-03",
        "route": "Route 717 (Aerocity-Nehru Pl)",
        "modes": ["vehicle"]
    })
    assert res3.status_code == 200, res3.text
    data3 = res3.json()
    assert data3["success"] is True
    assert data3["bus_id"] == "BUS-03"

    hw_veh_dets = [d for d in data3["detections"] if d["detection_type"] == "vehicle"]
    veh_count = data3["traffic_stats"].get("vehicle_count", len(hw_veh_dets))
    print(f"  BUS-03 Tracked Vehicles: {len(hw_veh_dets)}, Vehicle Count: {veh_count}")
    print(f"  BUS-03 Congestion Level: {data3['traffic_stats'].get('congestion_level')}")
    print(f"  BUS-03 Warning: {repr(data3['active_warning'])}")
    print(f"  BUS-03 Diversion Recommended: {data3['diversion_recommended']}")
    if data3["diversion_info"]:
        print(f"  BUS-03 Diversion Info: {data3['diversion_info']['suggested_diversion']} (Label: {data3['diversion_info']['label']})")
    assert data3["diversion_recommended"] is True, "Diversion should be recommended for highway traffic"
    assert data3["diversion_info"]["label"] == "SIMULATED ROUTE DIVERSION"
    print("[PASS] BUS-03 highway traffic analysis and simulated route diversion verified.")

    # -------------------------------------------------------------
    # 4. Check Route Diversion on Map API
    # -------------------------------------------------------------
    print("\n--- Testing Map Routes API for Simulated Route Diversion ---")
    r_routes = requests.get(f"{PROXIED_BASE}/api/fleet/routes/all")
    assert r_routes.status_code == 200
    all_routes = r_routes.json()
    div_route = [r for r in all_routes if r.get("id") == "ROUTE-717-DIVERSION"]
    assert len(div_route) > 0, "ROUTE-717-DIVERSION missing from routes"
    print(f"  Found route: {div_route[0]['route_name']} (Label: {div_route[0].get('label')})")
    print("[PASS] Map route diversion layer verified.")

    # -------------------------------------------------------------
    # 5. Independence Check: No mixing between buses
    # -------------------------------------------------------------
    print("\n--- Testing Bus Stream Independence ---")
    assert data1["telemetry"]["latitude"] != data2["telemetry"]["latitude"]
    assert data2["telemetry"]["latitude"] != data3["telemetry"]["latitude"]
    assert data1["telemetry"]["route"] != data2["telemetry"]["route"]
    assert data2["telemetry"]["route"] != data3["telemetry"]["route"]
    print(f"  BUS-01 Route: {data1['telemetry']['route']} | GPS: ({data1['telemetry']['latitude']}, {data1['telemetry']['longitude']})")
    print(f"  BUS-02 Route: {data2['telemetry']['route']} | GPS: ({data2['telemetry']['latitude']}, {data2['telemetry']['longitude']})")
    print(f"  BUS-03 Route: {data3['telemetry']['route']} | GPS: ({data3['telemetry']['latitude']}, {data3['telemetry']['longitude']})")
    print("[PASS] Complete independence of bus streams and GPS locations verified.")

    print("\n" + "=" * 65)
    print("ALL THREE BUS PIPELINES SUCCESSFULLY VERIFIED!")
    print("=" * 65)

if __name__ == "__main__":
    test_three_buses()
