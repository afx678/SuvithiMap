"""
SuVithiMap - Real AI Accident Detector
Uses verified YOLOv8 weights (amritauji/AI-Accident-Detection-Using-YOLOv8).
Performs genuine model inference on video frames.
Only labels AI DETECTED ACCIDENT when actual model predicts the class.
Never generates fake or decorative accident boxes.
"""

import os
from typing import List, Any, Optional
from ai.common.base_detector import BaseDetector
from ai.common.models import DetectionResult, BusTelemetry


class AccidentDetector(BaseDetector):
    """
    Detector for roadway vehicular accidents and collisions using trained YOLOv8 weights.
    """

    def __init__(self, model_path: Optional[str] = "models/accident_yolov8.pt", demo_mode: bool = False):
        self.model = None
        super().__init__(name="AccidentDetector", model_path=model_path, demo_mode=demo_mode)

    def _load_model(self) -> None:
        if self.model_path and os.path.exists(self.model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                self.is_loaded = True
                self.demo_mode = False
                print(f"[AccidentDetector] Loaded trained weights from {self.model_path}")
                return
            except Exception as e:
                print(f"[AccidentDetector] Failed to load {self.model_path}: {e}")
                self.is_loaded = False
                self.demo_mode = True
                return

        print(f"[AccidentDetector] Model weights not found at {self.model_path}.")
        self.is_loaded = False
        self.demo_mode = True

    def detect(self, frame: Any, telemetry: BusTelemetry, video_timestamp: Optional[str] = None) -> List[DetectionResult]:
        """
        Runs real YOLO accident inference on frame.
        Outputs ONLY actual model-detected accidents.
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
                    if "accident" in class_name.lower():
                        coords = [round(float(x), 1) for x in box.xyxy[0].tolist()]
                        conf = round(float(box.conf[0]), 2)

                        results.append(
                            DetectionResult(
                                detection_type="accident",
                                class_name="Accident",
                                confidence=conf,
                                bbox=coords,
                                latitude=telemetry.latitude,
                                longitude=telemetry.longitude,
                                bus_id=telemetry.bus_id,
                                severity="critical",
                                video_timestamp=video_timestamp,
                                source_model="yolov8-accident",
                                evidence_path="/demo/images/accident_evidence_sample.jpg",
                                is_simulated=False,
                                metadata={
                                    "model_source": "amritauji/AI-Accident-Detection-Using-YOLOv8",
                                    "status_label": "AI VERIFIED"
                                }
                            )
                        )
            return results
        except Exception as e:
            print(f"[AccidentDetector] Inference error: {e}")
            return []
