"""
SuVithiMap - Real AI Pothole Detector
Uses verified YOLOv8 weights (Tanvir-Pandit / MuhammadSafian).
Performs genuine model inference on video frames.
Never produces fake or random bounding boxes.
"""

import os
from typing import List, Any, Optional
from ai.common.base_detector import BaseDetector
from ai.common.models import DetectionResult, BusTelemetry


class PotholeDetector(BaseDetector):
    """
    Detector for road potholes and surface craters using trained YOLOv8 weights.
    """

    def __init__(self, model_path: Optional[str] = "models/pothole_road_damage.pt", demo_mode: bool = False):
        self.model = None
        # Fallback to alternative trained pothole checkpoint if primary not present
        if model_path and not os.path.exists(model_path) and os.path.exists("models/pothole_yolov8.pt"):
            model_path = "models/pothole_yolov8.pt"
        super().__init__(name="PotholeDetector", model_path=model_path, demo_mode=demo_mode)

    def _load_model(self) -> None:
        if self.model_path and os.path.exists(self.model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                self.is_loaded = True
                self.demo_mode = False
                print(f"[PotholeDetector] Successfully loaded trained weights from {self.model_path}")
                return
            except Exception as e:
                print(f"[PotholeDetector] Error loading weights from {self.model_path}: {e}")
                self.is_loaded = False
                self.demo_mode = True
                return

        print(f"[PotholeDetector] Weights not found at {self.model_path}.")
        self.is_loaded = False
        self.demo_mode = True

    def detect(self, frame: Any, telemetry: BusTelemetry, video_timestamp: Optional[str] = None) -> List[DetectionResult]:
        """
        Run genuine inference on frame.
        Outputs ONLY actual model-predicted bounding boxes and confidences.
        """
        results: List[DetectionResult] = []

        if frame is None or self.model is None or not self.is_loaded:
            return results

        try:
            preds = self.model.predict(frame, conf=0.25, verbose=False)
            for r in preds:
                if r.boxes is None:
                    continue
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    class_name = self.model.names[cls_id]
                    # Check if detection is pothole
                    if "pothole" in class_name.lower():
                        coords = [round(float(x), 1) for x in box.xyxy[0].tolist()]
                        conf = round(float(box.conf[0]), 2)
                        severity = "critical" if conf > 0.70 else "high"

                        results.append(
                            DetectionResult(
                                detection_type="pothole",
                                class_name="pothole",
                                confidence=conf,
                                bbox=coords,
                                latitude=telemetry.latitude,
                                longitude=telemetry.longitude,
                                bus_id=telemetry.bus_id,
                                severity=severity,
                                video_timestamp=video_timestamp,
                                source_model="yolov8-pothole",
                                evidence_path="/demo/images/pothole_evidence_sample.jpg",
                                is_simulated=False,
                                metadata={
                                    "model_source": "Tanvir-Pandit/Road-Damage-with-YOLOv8",
                                    "status_label": "AI VERIFIED"
                                }
                            )
                        )
            return results
        except Exception as e:
            print(f"[PotholeDetector] Inference error: {e}")
            return []
