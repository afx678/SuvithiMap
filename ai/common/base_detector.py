"""
SuVithiMap - Base Detector Interface
Enforces a common interface across all AI detectors:
Pothole, Road Damage, Vehicle, Traffic Sign, Waterlogging.
"""

from abc import ABC, abstractmethod
from typing import List, Any, Optional
from ai.common.models import DetectionResult, BusTelemetry


class BaseDetector(ABC):
    """
    Abstract Base Class for modular inference services.
    Enables zero lock-in to specific model architectures.
    """

    def __init__(self, name: str, model_path: Optional[str] = None, demo_mode: bool = False):
        self.name = name
        self.model_path = model_path
        self.demo_mode = demo_mode
        self.is_loaded = False
        self._load_model()

    @abstractmethod
    def _load_model(self) -> None:
        """
        Load model weights or initialize demo fallback.
        Must never fail silently; if weights fail, set demo_mode = True and record state.
        """
        pass

    @abstractmethod
    def detect(self, frame: Any, telemetry: BusTelemetry) -> List[DetectionResult]:
        """
        Perform detection on a video frame or image buffer.
        Returns a list of standardized DetectionResult objects.
        """
        pass

    def get_status(self) -> dict:
        """
        Returns runtime operational status of this detector according to Phase 19.
        """
        status_label = "AI VERIFIED" if (self.is_loaded and not self.demo_mode) else ("SIMULATION ONLY" if self.demo_mode else "MODEL WEIGHTS UNAVAILABLE")
        return {
            "name": self.name,
            "loaded": self.is_loaded,
            "ai_status": status_label,
            "demo_mode": self.demo_mode,
            "model_path": self.model_path
        }
