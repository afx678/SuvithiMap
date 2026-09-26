import React, { useState, useEffect } from 'react';
import { Bus, Incident, RouteItem } from '../types';
import { api } from '../services/api';
import { MapView } from '../components/map/MapView';
import { IncidentPanel } from '../components/map/IncidentPanel';
import { Layers, MapPin, AlertTriangle, Bus as BusIcon, Activity } from 'lucide-react';

export const MapPage: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const fetchData = async () => {
    try {
      const [b, i, r] = await Promise.all([
        api.getBuses(),
        api.getIncidents(),
        api.getRoutes()
      ]);
      setBuses(b);
      setIncidents(i);
      setRoutes(r);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-4 max-w-[1700px] mx-auto h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#34332F] pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">GIS URBAN COMMAND MAP</h1>
          <p className="text-xs text-[#96938B] mt-0.5 font-mono">
            Spatial Georeferencing of Mobile Bus Sensing Units & Road Damage Hotspots
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-[#D99A3D]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D99A3D]" />
            Active Buses ({buses.length})
          </span>
          <span className="flex items-center gap-1.5 text-[#D96B55]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D96B55]" />
            Critical Hazards ({incidents.filter(i => i.severity === 'critical' && i.status !== 'resolved').length})
          </span>
          <span className="flex items-center gap-1.5 text-[#6F9B87]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6F9B87]" />
            Resolved ({incidents.filter(i => i.status === 'resolved').length})
          </span>
        </div>
      </div>

      {/* Map Layout: Left Full Map + Right Optional Panel */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 h-full">
          <MapView
            buses={buses}
            incidents={incidents}
            routes={routes}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            height="100%"
          />
        </div>

        {selectedIncident && (
          <div className="w-96 shrink-0 h-full">
            <IncidentPanel
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
              onIncidentResolved={(updated) => {
                setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
                setSelectedIncident(updated);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
