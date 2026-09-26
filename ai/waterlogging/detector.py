"""
SuVithiMap - Waterlogging & Flood Hazard Detector
Uses CCTV Flood model (Faizanras00l) with flood class support.
Adheres strictly to honest AI status reporting (Phase 4):
If model predicts flood on frame -> AI VERIFIED.
Never produces fake bounding boxes during video inference.
"""

import os
from typing import List, Any, Optional
from ai.common.base_detector import BaseDetector
from ai.common.models import DetectionResult, BusTelemetry


class WaterloggingDetector(BaseDetector):
    """
    Detector for roadway waterlogging and flood accumulation.
    """

    def __init__(self, model_path: Optional[str] = "models/cctv_flood_accident.pt", demo_mode: bool = False):
        self.model = None
        super().__init__(name="WaterloggingDetector", model_path=model_path, demo_mode=demo_mode)

    def _load_model(self) -> None:
        if self.model_path and os.path.exists(self.model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(self.model_path)
                self.is_loaded = True
                self.demo_mode = False
                print(f"[WaterloggingDetector] Loaded flood model from {self.model_path}")
                return
            except Exception as e:
                print(f"[WaterloggingDetector] Model load error: {e}")
                self.is_loaded = False
                self.demo_mode = True
                return

        print(f"[WaterloggingDetector] Model not found at {self.model_path}.")
        self.is_loaded = False
        self.demo_mode = True

    def detect(self, frame: Any, telemetry: BusTelemetry, video_timestamp: Optional[str] = None) -> List[DetectionResult]:
        """
        Runs real YOLO flood inference on frame.
        Outputs ONLY genuine model-detected flooding.
        """
        results: List[DetectionResult] = []

        if frame is None or self.model is None or not self.is_loaded:
            return results

        try:
            preds = self.model.predict(frame, conf=0.30, verbose=False)
            for r in preds:
                if r.boxes is None:
                    continue
                for box in r.boxes:
                    cls_id = int(box.cls[0])
                    class_name = self.model.names[cls_id]
                    if "flood" in class_name.lower():
                        coords = [round(float(x), 1) for x in box.xyxy[0].tolist()]
                        conf = round(float(box.conf[0]), 2)

                        results.append(
                            DetectionResult(
                                detection_type="waterlogging",
                                class_name="waterlogging",
                                confidence=conf,
                                bbox=coords,
                                latitude=telemetry.latitude,
                                longitude=telemetry.longitude,
                                bus_id=telemetry.bus_id,
                                severity="critical" if conf > 0.75 else "high",
                                video_timestamp=video_timestamp,
                                source_model="yolov8-flood-cctv",
                                evidence_path="/demo/images/waterlogging_sample.jpg",
                                is_simulated=False,
                                metadata={
                                    "model_source": "Faizanras00l/yolo-cctv-object-detection",
                                    "status_label": "AI VERIFIED"
                                }
                            )
                        )
            return results
        except Exception as e:
            print(f"[WaterloggingDetector] Inference error: {e}")
            return []
