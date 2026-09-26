"""
SuVithiMap - Unified AI Vision Pipeline
Orchestrates modular detectors (Potholes, Cracks, Vehicles, Signs, Waterlogging, Accident).
Operates strictly on real model inference when camera/video frames are provided.
Never fabricates AI detections or decorative bounding boxes.
"""

from typing import List, Dict, Any, Tuple, Optional
from ai.common.models import DetectionResult, BusTelemetry
from ai.common.clustering import IncidentClusterer
from ai.pothole.detector import PotholeDetector
from ai.road_damage.detector import RoadDamageDetector
from ai.vehicle.detector import VehicleTracker
from ai.traffic_sign.detector import TrafficSignDetector
from ai.waterlogging.detector import WaterloggingDetector
from ai.accident.detector import AccidentDetector


class VisionPipeline:
    """
    Main AI vision pipeline processing video frames and telemetry from sensing buses.
    """

    def __init__(self, demo_mode: bool = False):
        self.demo_mode = demo_mode
        self.pothole_detector = PotholeDetector(demo_mode=demo_mode)
        self.road_damage_detector = RoadDamageDetector(demo_mode=demo_mode)
        self.vehicle_tracker = VehicleTracker(demo_mode=demo_mode)
        self.sign_detector = TrafficSignDetector(demo_mode=demo_mode)
        self.waterlogging_detector = WaterloggingDetector(demo_mode=demo_mode)
        self.accident_detector = AccidentDetector(demo_mode=demo_mode)
        self.clusterer = IncidentClusterer(cluster_radius_m=35.0)

    def infer_frame(
        self,
        frame: Any,
        telemetry: BusTelemetry,
        video_timestamp: Optional[str] = None,
        modes: Optional[List[str]] = None
    ) -> Tuple[List[DetectionResult], List[dict], dict]:
        """
        Runs actual model inference on a raw video frame or image buffer.
        """
        if modes is None:
            modes = ["pothole", "road_damage", "vehicle", "traffic_sign", "accident"]

        detections: List[DetectionResult] = []

        # 1. Vehicle detection & ByteTrack tracking
        if "vehicle" in modes:
            veh_dets = self.vehicle_tracker.detect(frame, telemetry, video_timestamp=video_timestamp)
            detections.extend(veh_dets)
            traffic_stats = self.vehicle_tracker.compute_traffic_stats(veh_dets, telemetry.speed)
        else:
            traffic_stats = {"vehicle_count": 0, "congestion_level": "low"}

        # 2. Pothole detection
        if "pothole" in modes:
            p_dets = self.pothole_detector.detect(frame, telemetry, video_timestamp=video_timestamp)
            detections.extend(p_dets)

        # 3. Road Damage / Crack detection
        if "road_damage" in modes:
            rd_dets = self.road_damage_detector.detect(frame, telemetry, video_timestamp=video_timestamp)
            detections.extend(rd_dets)

        # 4. Traffic Sign detection
        if "traffic_sign" in modes:
            ts_dets = self.sign_detector.detect(frame, telemetry, video_timestamp=video_timestamp)
            detections.extend(ts_dets)

        # 5. Accident detection
        if "accident" in modes:
            acc_dets = self.accident_detector.detect(frame, telemetry, video_timestamp=video_timestamp)
            detections.extend(acc_dets)

        # 6. Waterlogging detection
        if "waterlogging" in modes:
            wl_dets = self.waterlogging_detector.detect(frame, telemetry, video_timestamp=video_timestamp)
            detections.extend(wl_dets)

        # 7. Cluster significant hazard detections into persistent incidents
        incidents: List[dict] = []
        for det in detections:
            # Only hazards create incidents (not ordinary vehicles or passing signs)
            if det.detection_type in ("pothole", "road_damage", "waterlogging", "accident"):
                inc = self.clusterer.process_detection(det)
                if inc is not None:
                    incidents.append(inc)

        return detections, incidents, traffic_stats

    def process_bus_tick(
        self,
        telemetry: BusTelemetry,
        frame: Any = None,
        hazard_bias: str = "normal"
    ) -> Tuple[List[DetectionResult], List[dict], dict]:
        """
        Background telemetry tick processor.
        If frame is provided, runs real model inference.
        If frame is None, produces transparently labeled simulated detections
        governed by the active scenario (Monsoon, Rush Hour, Hazard Surge).
        All synthetic detections are strictly labeled is_simulated = True.
        """
        if frame is not None:
            return self.infer_frame(frame, telemetry)

        import random
        import uuid
        detections: List[DetectionResult] = []
        incidents: List[dict] = []

        # Vehicle density and traffic modeling
        base_veh_count = 3
        if hazard_bias == "rush_hour":
            base_veh_count = random.randint(12, 22)
            congestion = "heavy" if base_veh_count < 18 else "gridlock"
        elif hazard_bias == "monsoon":
            base_veh_count = random.randint(6, 12)
            congestion = "moderate"
        else:
            base_veh_count = random.randint(2, 7)
            congestion = "low" if base_veh_count < 5 else "moderate"

        traffic_stats = {
            "vehicle_count": base_veh_count,
            "congestion_level": congestion,
            "average_speed": telemetry.speed,
            "density_per_100m": round(base_veh_count * 1.5, 1)
        }

        # Scenario-specific simulated hazard generation (probabilistic per tick)
        prob = random.random()
        should_gen_hazard = False
        hazard_type = "pothole"
        class_name = "pothole"
        severity = "high"
        evidence_sample = "/demo/images/pothole_evidence_sample.jpg"

        if hazard_bias == "hazard_surge" and prob < 0.35:
            should_gen_hazard = True
            hazard_type = random.choice(["pothole", "road_damage"])
            class_name = "pothole" if hazard_type == "pothole" else "alligator_crack"
            severity = "critical" if random.random() > 0.4 else "high"
            evidence_sample = "/demo/images/pothole_evidence_sample.jpg" if hazard_type == "pothole" else "/demo/images/road_crack_sample.jpg"

        elif hazard_bias == "monsoon" and prob < 0.30:
            should_gen_hazard = True
            hazard_type = "waterlogging"
            class_name = "waterlogging"
            severity = "critical" if random.random() > 0.5 else "high"
            evidence_sample = "/demo/images/waterlogging_sample.jpg"

        elif hazard_bias == "normal" and prob < 0.08:
            should_gen_hazard = True
            hazard_type = random.choice(["pothole", "road_damage"])
            class_name = "pothole" if hazard_type == "pothole" else "longitudinal_crack"
            severity = "medium"
            evidence_sample = "/demo/images/pothole_evidence_sample.jpg"

        if should_gen_hazard:
            det = DetectionResult(
                id=str(uuid.uuid4()),
                detection_type=hazard_type,
                class_name=class_name,
                confidence=round(random.uniform(0.82, 0.96), 2),
                bbox=[random.randint(50, 200), random.randint(200, 350), random.randint(250, 450), random.randint(380, 500)],
                latitude=telemetry.latitude,
                longitude=telemetry.longitude,
                bus_id=telemetry.bus_id,
                severity=severity,
                source_model="simulation-engine",
                evidence_path=evidence_sample,
                is_simulated=True,
                metadata={
                    "status_label": "SIMULATED EVIDENCE (SCENARIO)",
                    "scenario": hazard_bias
                }
            )
            detections.append(det)
            inc = self.clusterer.process_detection(det)
            if inc is not None:
                inc["bus_id"] = telemetry.bus_id
                incidents.append(inc)

        return detections, incidents, traffic_stats

    def get_pipeline_health(self) -> Dict[str, Any]:
        """
        Returns honest status for every detector according to Phase 19.
        """
        return {
            "pothole": self.pothole_detector.get_status(),
            "road_damage": self.road_damage_detector.get_status(),
            "vehicle_tracker": self.vehicle_tracker.get_status(),
            "traffic_sign": self.sign_detector.get_status(),
            "waterlogging": self.waterlogging_detector.get_status(),
            "accident": self.accident_detector.get_status(),
            "poles": {
                "name": "PoleDetector",
                "loaded": False,
                "ai_status": "POLE DETECTION = NOT VERIFIED",
                "demo_mode": False,
                "model_path": None,
                "note": "No verified open-source model with dedicated utility/street pole classes exists in evaluated repositories."
            },
            "demo_mode": self.demo_mode
        }
