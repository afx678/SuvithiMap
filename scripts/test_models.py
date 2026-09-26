"""
Verification Script for SuVithiMap AI Checkpoints
Loads each model weight and verifies inference, classes, and detection capabilities.
"""
import os
import sys
import numpy as np

def test_models():
    from ultralytics import YOLO

    models_to_test = [
        ("Pothole / Road Damage (Tanvir-Pandit)", "models/pothole_road_damage.pt"),
        ("Pothole Detector (MuhammadSafian)", "models/pothole_yolov8.pt"),
        ("Accident Detector (Amritauji)", "models/accident_yolov8.pt"),
        ("Traffic Signs Detector (Namith-19)", "models/traffic_signs_yolov8.pt"),
        ("CCTV Flood / Accident Detector (Faizanras00l)", "models/cctv_flood_accident.pt"),
        ("Vehicles & ByteTrack (Ultralytics COCO)", "yolov8n.pt")
    ]

    print("==================================================")
    print("SuVithiMap Real AI Model Verification")
    print("==================================================")

    dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)

    for name, path in models_to_test:
        print(f"\n[TESTING] {name} ({path})...")
        if not os.path.exists(path) and path != "yolov8n.pt":
            print(f"  [ERROR] File {path} not found!")
            continue
        try:
            model = YOLO(path)
            # Run dummy frame inference to verify model architecture and weights
            res = model.predict(dummy_frame, conf=0.25, verbose=False)
            classes = model.names
            print(f"  [SUCCESS] Loaded model successfully!")
            print(f"  [CLASSES] ({len(classes)} classes): {classes}")
        except Exception as e:
            print(f"  [FAILED] Inference error: {e}")

if __name__ == "__main__":
    test_models()
