import cv2
from ultralytics import YOLO

print("=== Verifying Real Video Inference ===")

# 1. Test Cracks & Potholes video
cap = cv2.VideoCapture("demo/videos/cracks_road.mp4")
model = YOLO("models/pothole_road_damage.pt")
pothole_model = YOLO("models/pothole_yolov8.pt")

crack_dets = 0
pothole_dets = 0

for i in range(120):
    ret, frame = cap.read()
    if not ret:
        break
    if i % 10 == 0:
        res = model.predict(frame, conf=0.25, verbose=False)
        for box in res[0].boxes:
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            xyxy = box.xyxy[0].tolist()
            if "Crack" in cls_name:
                crack_dets += 1
                print(f"  Frame {i}: Detected {cls_name} conf={conf:.2f} bbox={[round(x,1) for x in xyxy]}")
            elif "pothole" in cls_name.lower():
                pothole_dets += 1
                print(f"  Frame {i}: Detected {cls_name} conf={conf:.2f} bbox={[round(x,1) for x in xyxy]}")

cap.release()

# 2. Test Accident video (Official CCD video)
cap_acc = cv2.VideoCapture("demo/videos/accident_scene.mp4")
acc_model = YOLO("models/accident_yolov8.pt")
accident_dets = 0
frame_num = 0
while True:
    ret, frame = cap_acc.read()
    if not ret:
        break
    frame_num += 1
    res = acc_model.predict(frame, conf=0.25, verbose=False)
    for box in res[0].boxes:
        conf = float(box.conf[0])
        cls_id = int(box.cls[0])
        cls_name = acc_model.names[cls_id]
        if "accident" in cls_name.lower():
            xyxy = box.xyxy[0].tolist()
            accident_dets += 1
            print(f"  Accident Video Frame {frame_num}: Detected ACCIDENT conf={conf:.2f} bbox={[round(x,1) for x in xyxy]}")
cap_acc.release()

print(f"\nSummary:")
print(f"  Road Cracks Detections: {crack_dets}")
print(f"  Potholes Detections: {pothole_dets}")
print(f"  Accident Detections: {accident_dets}")
print("Verification complete!")
