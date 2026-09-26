import { Bus, Incident, Detection, RouteItem, SimulationState, AnalyticsSummary } from '../types';

const envApiUrl = (import.meta as any).env?.VITE_API_URL;
const API_BASE = (envApiUrl ? String(envApiUrl).replace(/\/$/, '') : '') + '/api';

export const api = {
  // Fleet
  getBuses: async (): Promise<Bus[]> => {
    try {
      const res = await fetch(`${API_BASE}/fleet`);
      if (!res.ok) throw new Error('Failed to fetch buses');
      return await res.json();
    } catch (e) {
      console.warn('API getBuses error, falling back:', e);
      return [];
    }
  },

  getBusDetails: async (busId: string): Promise<{ bus: Bus; recent_detections: Detection[] }> => {
    const res = await fetch(`${API_BASE}/fleet/${busId}`);
    if (!res.ok) throw new Error(`Failed to fetch bus ${busId}`);
    return await res.json();
  },

  getRoutes: async (): Promise<RouteItem[]> => {
    try {
      const res = await fetch(`${API_BASE}/fleet/routes/all`);
      if (!res.ok) throw new Error('Failed to fetch routes');
      return await res.json();
    } catch (e) {
      console.warn('API getRoutes error:', e);
      return [];
    }
  },

  // Incidents
  getIncidents: async (status?: string, severity?: string): Promise<Incident[]> => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (severity) params.append('severity', severity);
      const res = await fetch(`${API_BASE}/incidents?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch incidents');
      return await res.json();
    } catch (e) {
      console.warn('API getIncidents error:', e);
      return [];
    }
  },

  getIncident: async (incidentId: string): Promise<{ incident: Incident; related_detections: Detection[] }> => {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
    if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}`);
    return await res.json();
  },

  resolveIncident: async (incidentId: string, notes?: string): Promise<{ success: boolean; incident: Incident }> => {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notes || 'Resolved via Municipal Command Center' }),
    });
    if (!res.ok) throw new Error(`Failed to resolve incident ${incidentId}`);
    return await res.json();
  },

  // Detections
  getDetections: async (limit: number = 50, busId?: string): Promise<Detection[]> => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (busId) params.append('bus_id', busId);
      const res = await fetch(`${API_BASE}/detections?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch detections');
      return await res.json();
    } catch (e) {
      console.warn('API getDetections error:', e);
      return [];
    }
  },

  // Analytics
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    try {
      const res = await fetch(`${API_BASE}/analytics/summary`);
      if (!res.ok) throw new Error('Failed to fetch analytics summary');
      return await res.json();
    } catch (e) {
      console.warn('API getAnalyticsSummary error:', e);
      return {
        active_buses: 10,
        total_fleet: 10,
        incidents_today: 5,
        open_incidents: 4,
        critical_incidents: 2,
        road_hazards: 3,
        traffic_hotspots: 3,
        average_speed_kmh: 27.5,
        average_delay_min: 5.2,
        pci_score: 79,
        pci_category: 'Fair'
      };
    }
  },

  getAnalyticsCharts: async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/charts`);
      if (!res.ok) throw new Error('Failed to fetch charts');
      return await res.json();
    } catch (e) {
      console.warn('API getAnalyticsCharts error:', e);
      return null;
    }
  },

  // Simulation Controls
  getSimulationState: async (): Promise<SimulationState> => {
    const res = await fetch(`${API_BASE}/simulation/state`);
    return await res.json();
  },

  startSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/start`, { method: 'POST' });
    return await res.json();
  },

  pauseSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/pause`, { method: 'POST' });
    return await res.json();
  },

  resetSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/reset`, { method: 'POST' });
    return await res.json();
  },

  stepSimulation: async () => {
    const res = await fetch(`${API_BASE}/simulation/step`, { method: 'POST' });
    return await res.json();
  },

  setScenario: async (scenario: string) => {
    const res = await fetch(`${API_BASE}/simulation/scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario }),
    });
    return await res.json();
  },

  setSpeed: async (speed: number) => {
    const res = await fetch(`${API_BASE}/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
    return await res.json();
  },

  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  // Real AI Inference and Status
  getAiStatus: async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/status`);
      if (!res.ok) throw new Error('Failed to fetch AI status');
      return await res.json();
    } catch (e) {
      console.warn('API getAiStatus error:', e);
      return null;
    }
  },

  inferFrame: async (payload: {
    frame_data: string;
    video_timestamp: number;
    bus_id: string;
    route?: string;
    modes?: string[];
  }) => {
    const res = await fetch(`${API_BASE}/ai/infer_frame`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('AI Frame inference request failed');
    return await res.json();
  },

  triggerHazard: async (busId: string, hazardType: string, severity: string = 'critical') => {
    const res = await fetch(`${API_BASE}/ai/trigger_hazard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bus_id: busId, hazard_type: hazardType, severity }),
    });
    if (!res.ok) throw new Error('Failed to trigger hazard');
    return await res.json();
  }
};
