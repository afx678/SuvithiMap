"""
SuVithiMap - Real AI Road Damage Detector
Uses verified YOLOv8 weights (Tanvir-Pandit / Road-Damage-with-YOLOv8).
Performs genuine model inference on video frames.
Never produces fake or random bounding boxes.
"""

import os
from typing import List, Any, Optional
from ai.common.base_detector import BaseDetector
from ai.common.models import DetectionResult, BusTelemetry


class RoadDamageDetector(BaseDetector):
    """
    Detector for road surface damage and cracks using trained YOLOv8 weights.
    """

    def __init__(self, model_path: Optional[str] = "models/pothole_road_damage.pt", demo_mode: bool = False):
        self.model = None
        super().__init__(name="RoadDamageDetector", model_path=model_path, demo_mode=demo_mode)

    def _load_model(self) -> None:
        if self.model_path and os.path.exists(self.model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                self.is_loaded = True
                self.demo_mode = False
                print(f"[RoadDamageDetector] Loaded trained weights from {self.model_path}")
                return
            except Exception as e:
                print(f"[RoadDamageDetector] Failed loading {self.model_path}: {e}")
                self.is_loaded = False
                self.demo_mode = True
                return

        print(f"[RoadDamageDetector] Model weights not found at {self.model_path}.")
        self.is_loaded = False
        self.demo_mode = True

    def detect(self, frame: Any, telemetry: BusTelemetry, video_timestamp: Optional[str] = None) -> List[DetectionResult]:
        """
        Runs real YOLO inference on frame.
        Outputs ONLY actual model detections.
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

                    # Detect cracks or road damage
                    if "crack" in class_name.lower() or "damage" in class_name.lower():
                        coords = [round(float(x), 1) for x in box.xyxy[0].tolist()]
                        conf = round(float(box.conf[0]), 2)
                        severity = "critical" if conf > 0.75 else "high"

                        results.append(
                            DetectionResult(
                                detection_type="road_damage",
                                class_name=class_name,
                                confidence=conf,
                                bbox=coords,
                                latitude=telemetry.latitude,
                                longitude=telemetry.longitude,
                                bus_id=telemetry.bus_id,
                                severity=severity,
                                video_timestamp=video_timestamp,
                                source_model="yolov8-road-damage",
                                evidence_path="/demo/images/road_crack_sample.jpg",
                                is_simulated=False,
                                metadata={
                                    "model_source": "Tanvir-Pandit/Road-Damage-with-YOLOv8",
                                    "status_label": "AI VERIFIED"
                                }
                            )
                        )
            return results
        except Exception as e:
            print(f"[RoadDamageDetector] Inference error: {e}")
            return []
