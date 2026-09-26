"""
SuVithiMap - AI Modular Models
Standardized DetectionResult and Telemetry models
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

    def to_list(self) -> List[float]:
        return [self.x1, self.y1, self.x2, self.y2]


class DetectionResult(BaseModel):
    """
    Common normalized output produced by every detector in the platform.
    Frontend and Backend do NOT depend on specific YOLO or PyTorch formats.
    """
    id: Optional[str] = None
    detection_type: str = Field(..., description="pothole | road_damage | vehicle | traffic_sign | waterlogging")
    class_name: str = Field(..., description="Specific class detected, e.g., pothole, alligator_crack, car, stop_sign")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score from 0.0 to 1.0")
    bbox: Optional[List[float]] = Field(default=None, description="[x1, y1, x2, y2] normalized or pixel coords")
    latitude: float = Field(..., description="GPS Latitude of detection")
    longitude: float = Field(..., description="GPS Longitude of detection")
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    bus_id: str = Field(..., description="Bus / Mobile Sensing Unit ID")
    severity: str = Field(default="medium", description="low | medium | high | critical")
    track_id: Optional[str] = Field(default=None, description="Tracker ID across video frames")
    evidence_path: Optional[str] = Field(default=None, description="Path or URL to evidence image/video frame")
    video_timestamp: Optional[str] = Field(default=None, description="Video playback timestamp e.g. 00:18.4")
    source_model: Optional[str] = Field(default="yolov8", description="Source AI model identifier")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Arbitrary detector-specific metadata")
    is_simulated: bool = Field(default=False, description="True if synthesized via DEMO/Simulation fallback")


class BusTelemetry(BaseModel):
    """
    Real-time telemetry sent by a bus sensing unit
    """
    bus_id: str
    bus_number: str
    route: str
    latitude: float
    longitude: float
    speed: float  # km/h
    heading: float  # degrees
    status: str = "active"
    camera_status: str = "online"  # online | degraded | offline
    gps_status: str = "online"     # online | weak | offline
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
