export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved';
export type DetectionType = 'pothole' | 'road_damage' | 'vehicle' | 'traffic_sign' | 'waterlogging' | 'pedestrian';

export interface Bus {
  id: string;
  bus_number: string;
  route: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  camera_status: 'online' | 'degraded' | 'offline';
  gps_status: 'online' | 'weak' | 'offline';
  last_seen: string;
  created_at?: string;
}

export interface Incident {
  id: string;
  detection_id?: string;
  incident_type: string;
  title: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  location_name?: string;
  detection_count: number;
  first_detected_at: string;
  timestamp: string;
  assigned_to?: string;
  description?: string;
  evidence_url?: string;
  is_simulated: boolean;
  resolved_at?: string | null;
  resolution_notes?: string | null;
}

export interface Detection {
  id: string;
  bus_id: string;
  detection_type: DetectionType;
  class_name: string;
  confidence: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  severity: SeverityLevel;
  track_id?: string;
  bbox?: number[];
  evidence_url?: string;
  is_simulated: boolean;
  metadata?: Record<string, any>;
}

export interface RouteItem {
  id: string;
  route_number: string;
  route_name: string;
  length_km: number;
  status: 'normal' | 'congested' | 'detour' | 'hazard_alert' | 'diversion';
  is_diversion?: boolean;
  label?: string;
  geometry: { lat: number; lng: number; name?: string }[];
}

export interface TrafficEvent {
  id: string;
  bus_id: string;
  vehicle_count: number;
  average_speed: number;
  congestion_level: 'low' | 'moderate' | 'heavy' | 'gridlock';
  latitude: number;
  longitude: number;
  timestamp: string;
}

export interface SimulationState {
  is_running: boolean;
  scenario: 'normal' | 'monsoon' | 'rush_hour' | 'hazard_surge';
  speed_multiplier: number;
  tick_count: number;
  active_buses: number;
  open_incidents: number;
}

export interface AnalyticsSummary {
  active_buses: number;
  total_fleet: number;
  incidents_today: number;
  open_incidents: number;
  critical_incidents: number;
  road_hazards: number;
  traffic_hotspots: number;
  average_speed_kmh: number;
  average_delay_min: number;
  pci_score: number;
  pci_category: string;
}
