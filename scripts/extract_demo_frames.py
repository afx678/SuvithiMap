import cv2
import os

print("Extracting genuine high-res frames from real videos...")

# 1. Pothole frame
cap = cv2.VideoCapture("demo/videos/potholes_road.mp4")
cap.set(cv2.CAP_PROP_POS_FRAMES, 50)
ret, frame = cap.read()
if ret:
    cv2.imwrite("demo/images/pothole_evidence_sample.jpg", frame)
    print("  Saved demo/images/pothole_evidence_sample.jpg")
cap.release()

# 2. Road crack frame
cap = cv2.VideoCapture("demo/videos/cracks_road.mp4")
cap.set(cv2.CAP_PROP_POS_FRAMES, 80)
ret, frame = cap.read()
if ret:
    cv2.imwrite("demo/images/road_crack_sample.jpg", frame)
    print("  Saved demo/images/road_crack_sample.jpg")
cap.release()

# 3. Accident scene frame
cap = cv2.VideoCapture("demo/videos/accident_scene.mp4")
cap.set(cv2.CAP_PROP_POS_FRAMES, 48)
ret, frame = cap.read()
if ret:
    cv2.imwrite("demo/images/accident_evidence_sample.jpg", frame)
    print("  Saved demo/images/accident_evidence_sample.jpg")

# 4. Vehicle traffic frame
cap.set(cv2.CAP_PROP_POS_FRAMES, 10)
ret, frame = cap.read()
if ret:
    cv2.imwrite("demo/images/vehicle_traffic_sample.jpg", frame)
    print("  Saved demo/images/vehicle_traffic_sample.jpg")
cap.release()

print("Done extracting demo frames!")
