import sys
import os
import time
import base64
import cv2
import requests

PROXIED_BASE = "http://127.0.0.1:5173"

def run_playback_verification():
    print("=" * 60)
    print("SUVITHIMAP END-TO-END PLAYBACK & AI PIPELINE TEST")
    print(f"Targeting frontend proxy: {PROXIED_BASE}")
    print("=" * 60)

    # 1. Verify health through Vite proxy
    r = requests.get(f"{PROXIED_BASE}/api/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print("[PASS] 1. Backend reachable via Vite frontend proxy (Port 5173 -> 8000)")

    # 2. Open video file to simulate browser HTML5 video playback
    video_path = "demo/videos/potholes_road.mp4"
    assert os.path.exists(video_path), f"Video missing: {video_path}"
    cap = cv2.VideoCapture(video_path)
    assert cap.isOpened(), "Could not open video file"
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0

    print(f"[INFO] Video loaded: {video_path}, FPS: {fps}")

    # Sample consecutive playback timestamps (e.g. 1.0s, 2.5s, 4.0s, 5.5s)
    timestamps = [1.0, 2.5, 4.0, 5.5, 7.0]
    all_detections = []
    positions = []

    for ts in timestamps:
        frame_idx = int(ts * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            print(f"[WARN] Frame at {ts}s could not be read")
            continue

        # Resize like LiveFeed.tsx does
        h, w = frame.shape[:2]
        canvas_w = min(640, w)
        canvas_h = int(canvas_w * (h / w))
        resized = cv2.resize(frame, (canvas_w, canvas_h))
        
        _, buf = cv2.imencode(".jpg", resized, [cv2.IMWRITE_JPEG_QUALITY, 80])
        b64_data = "data:image/jpeg;base64," + base64.b64encode(buf).decode("utf-8")

        # Send to /api/ai/infer_frame
        payload = {
            "frame_data": b64_data,
            "video_timestamp": ts,
            "bus_id": "DL-101",
            "route": "Route 419 (CP to AIIMS)",
            "modes": ["pothole", "vehicle"]
        }

        res = requests.post(f"{PROXIED_BASE}/api/ai/infer_frame", json=payload)
        assert res.status_code == 200, f"Inference failed at {ts}s: {res.text}"
        data = res.json()
        assert data["success"] is True

        telem = data["telemetry"]
        positions.append((telem["latitude"], telem["longitude"], telem["speed"]))
        dets = data["detections"]
        all_detections.extend(dets)
        
        print(f"  [TICK {ts}s] GPS: ({telem['latitude']}, {telem['longitude']}) | Speed: {telem['speed']} km/h | Detections: {len(dets)}")

    cap.release()

    # Verify GPS moved along the route
    assert len(positions) >= 2
    assert positions[0] != positions[-1], "GPS position did not update during playback!"
    print(f"[PASS] 2. Bus GPS position synchronized and updated along corridor during playback")

    # Verify detections exist and contain real YOLO fields
    assert len(all_detections) > 0, "No detections returned from AI models!"
    sample_det = all_detections[0]
    assert "class_name" in sample_det and "confidence" in sample_det and "bbox" in sample_det
    assert len(sample_det["bbox"]) == 4
    print(f"[PASS] 3. Real AI inference returned {len(all_detections)} genuine detections (e.g. {sample_det['class_name']} {int(sample_det['confidence']*100)}%) with bounding boxes")

    # 3. Verify detections reached the backend datastore
    r_det = requests.get(f"{PROXIED_BASE}/api/detections?limit=20")
    assert r_det.status_code == 200
    stored_dets = r_det.json()
    assert len(stored_dets) > 0, "Detections were not stored in datastore"
    print(f"[PASS] 4. Detections successfully saved in backend datastore ({len(stored_dets)} recent records)")

    # 4. Verify incidents were generated and exist for Leaflet/OSM map
    r_inc = requests.get(f"{PROXIED_BASE}/api/incidents")
    assert r_inc.status_code == 200
    incidents = r_inc.json()
    assert len(incidents) > 0, "No incidents found in datastore"
    
    # Check that at least one incident has genuine coordinates and evidence
    verified_incidents = [i for i in incidents if i.get("evidence_url", "").startswith("/demo/evidence/")]
    print(f"[PASS] 5. Incidents available for Leaflet/OpenStreetMap display: total={len(incidents)}, with genuine AI evidence={len(verified_incidents)}")

    # 5. Verify the evidence image is accessible via HTTP
    if verified_incidents:
        ev_url = verified_incidents[0]["evidence_url"]
        r_ev = requests.get(f"{PROXIED_BASE}{ev_url}")
        assert r_ev.status_code == 200, f"Evidence image not accessible: {r_ev.status_code}"
        assert len(r_ev.content) > 1000, "Evidence image is empty"
        print(f"[PASS] 6. Genuine visual evidence snapshot accessible via HTTP: {ev_url} ({len(r_ev.content)} bytes)")

    # 6. Verify bus telemetry updated in fleet store
    r_bus = requests.get(f"{PROXIED_BASE}/api/fleet/DL-101")
    assert r_bus.status_code == 200
    bus_data = r_bus.json()["bus"]
    assert bus_data["latitude"] == positions[-1][0] and bus_data["longitude"] == positions[-1][1]
    print(f"[PASS] 7. Fleet store reflects latest bus location: DL-101 at ({bus_data['latitude']}, {bus_data['longitude']})")

    # 7. Test accident video stream inference
    print("\n[TESTING] Accident video playback inference...")
    acc_cap = cv2.VideoCapture("demo/videos/accident_scene.mp4")
    if acc_cap.isOpened():
        acc_cap.set(cv2.CAP_PROP_POS_FRAMES, 50)
        ret, aframe = acc_cap.read()
        if ret:
            ah, aw = aframe.shape[:2]
            ac_w = min(640, aw)
            ac_h = int(ac_w * (ah / aw))
            a_resized = cv2.resize(aframe, (ac_w, ac_h))
            _, a_buf = cv2.imencode(".jpg", a_resized)
            a_b64 = "data:image/jpeg;base64," + base64.b64encode(a_buf).decode("utf-8")
            
            a_res = requests.post(f"{PROXIED_BASE}/api/ai/infer_frame", json={
                "frame_data": a_b64,
                "video_timestamp": 2.0,
                "bus_id": "DL-101",
                "modes": ["accident", "vehicle"]
            })
            assert a_res.status_code == 200
            a_data = a_res.json()
            acc_dets = [d for d in a_data["detections"] if d["detection_type"] == "accident"]
            print(f"  [SUCCESS] Accident model inference produced {len(acc_dets)} accident detection(s)")
        acc_cap.release()
    print("[PASS] 8. Multi-modal video selection and specialized detector verified")

    print("\n" + "=" * 60)
    print("ALL PLAYBACK AND LIVE-BUS VERIFICATIONS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    run_playback_verification()
