import React, { useState, useEffect } from 'react';
import { Bus, Incident, RouteItem, AnalyticsSummary } from '../types';
import { api } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { MapView } from '../components/map/MapView';
import { IncidentPanel } from '../components/map/IncidentPanel';
import { AlertToast } from '../components/common/AlertToast';
import {
  Bus as BusIcon,
  AlertTriangle,
  Construction,
  Flame,
  Clock,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [toastIncident, setToastIncident] = useState<Incident | null>(null);

  const loadData = async () => {
    try {
      const [bList, iList, rList, sData] = await Promise.all([
        api.getBuses(),
        api.getIncidents(),
        api.getRoutes(),
        api.getAnalyticsSummary(),
      ]);
      setBuses(bList);
      setIncidents(iList);
      setRoutes(rList);
      setSummary(sData);

      // Trigger alert toast for first critical incident if new
      const crit = iList.find(i => i.severity === 'critical' && i.status !== 'resolved');
      if (crit && !toastIncident) {
        setToastIncident(crit);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleIncidentResolved = (updated: Incident) => {
    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    if (selectedIncident?.id === updated.id) {
      setSelectedIncident(updated);
    }
    loadData();
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Alert Toast Popup */}
      <AlertToast
        incident={toastIncident}
        onDismiss={() => setToastIncident(null)}
        onViewDetails={(id) => {
          const inc = incidents.find(i => i.id === id);
          if (inc) setSelectedIncident(inc);
          setToastIncident(null);
        }}
      />

      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">MUNICIPAL COMMAND CENTER</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D99A3D]/20 text-[#D99A3D] border border-[#D99A3D]/30">
              LIVE FLEET STREAM
            </span>
          </div>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Autonomous Urban Vision & Infrastructure Health via Mobile Bus Units
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/live-bus"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22221F] hover:bg-[#34332F] border border-[#34332F] text-xs font-mono text-[#F2EFE8] rounded transition-colors"
          >
            <span>LIVE BUS FEED</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D99A3D]" />
          </Link>

          <Link
            to="/simulation"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D99A3D] hover:bg-[#F1C46A] text-xs font-mono font-bold text-[#11110F] rounded transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIMULATION SANDBOX</span>
          </Link>
        </div>
      </div>

      {/* 5 Executive Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Active Buses"
          value={summary?.active_buses ?? buses.length}
          subtitle={`${buses.filter(b => b.camera_status === 'online').length} Sensing Units Online`}
          icon={BusIcon}
          trend="+2 Active"
          trendPositive={true}
          accentColor="#6F9B87"
        />
        <MetricCard
          title="Incidents Today"
          value={summary?.incidents_today ?? incidents.length}
          subtitle={`${incidents.filter(i => i.status !== 'resolved').length} Open Work Orders`}
          icon={AlertTriangle}
          trend={summary?.critical_incidents ? `${summary.critical_incidents} Critical` : undefined}
          trendPositive={false}
          accentColor="#D96B55"
        />
        <MetricCard
          title="Road Hazards"
          value={summary?.road_hazards ?? incidents.filter(i => i.incident_type === 'pothole' || i.incident_type === 'road_damage').length}
          subtitle="Potholes & Subgrade Cracks"
          icon={Construction}
          accentColor="#D99A3D"
        />
        <MetricCard
          title="Traffic Hotspots"
          value={summary?.traffic_hotspots ?? 3}
          subtitle="Congestion Threshold >80%"
          icon={Flame}
          accentColor="#F1C46A"
        />
        <MetricCard
          title="Average Delay"
          value={`${summary?.average_delay_min ?? 4.8} min`}
          subtitle={`Fleet Avg Speed: ${summary?.average_speed_kmh ?? 28} km/h`}
          icon={Clock}
          accentColor="#96938B"
        />
      </div>

      {/* Main Grid: GIS Map (2/3) + Incident Center Feed (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Large Central GIS Map */}
        <div className="lg:col-span-2 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#96938B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D99A3D]" />
              Real-Time Fleet GIS Network (Delhi Corridors)
            </h2>
            <span className="text-[11px] font-mono text-[#96938B]">
              Updated every 2.5s
            </span>
          </div>

          <MapView
            buses={buses}
            incidents={incidents}
            routes={routes}
            selectedIncident={selectedIncident}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
            onSelectBus={(bus) => {
              // Highlight bus or focus
            }}
            height="560px"
          />
        </div>

        {/* Right: Live Incident Feed & Selected Dossier */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#96938B] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#D96B55]" />
              {selectedIncident ? 'Incident Dossier' : 'Live Incident Feed'}
            </h2>
            {selectedIncident && (
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-[11px] font-mono text-[#D99A3D] hover:underline"
              >
                ← Back to Feed
              </button>
            )}
          </div>

          <div className="h-[560px]">
            {selectedIncident ? (
              <IncidentPanel
                incident={selectedIncident}
                onClose={() => setSelectedIncident(null)}
                onIncidentResolved={handleIncidentResolved}
              />
            ) : (
              <div className="bg-[#191917] border border-[#34332F] rounded flex flex-col h-full overflow-hidden">
                <div className="p-3 border-b border-[#34332F] bg-[#11110F] text-xs font-mono text-[#96938B] flex justify-between">
                  <span>DETECTED HAZARDS ({incidents.length})</span>
                  <Link to="/incidents" className="text-[#D99A3D] hover:underline">
                    VIEW ALL →
                  </Link>
                </div>

                <div className="divide-y divide-[#34332F]/60 overflow-y-auto flex-1">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className="p-3 hover:bg-[#22221F] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        <StatusBadge severity={inc.severity} />
                        <span className="text-[10px] font-mono text-[#96938B]">
                          {new Date(inc.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#F2EFE8] mt-1 group-hover:text-[#F1C46A] transition-colors">
                        {inc.title}
                      </h4>

                      <p className="text-[11px] text-[#96938B] mt-1 line-clamp-1 font-mono">
                        {inc.location_name || `Lat ${inc.latitude.toFixed(4)}, Lng ${inc.longitude.toFixed(4)}`}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#F1C46A]">
                          {inc.detection_count} Fleet Passes
                        </span>
                        <StatusBadge status={inc.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
