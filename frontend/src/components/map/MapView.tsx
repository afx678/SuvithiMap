import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Bus, Incident, RouteItem } from '../../types';
import { Layers, Eye, EyeOff, AlertTriangle, Activity, ShieldAlert, Car, MapPin } from 'lucide-react';

interface MapViewProps {
  buses: Bus[];
  incidents: Incident[];
  routes?: RouteItem[];
  selectedIncident?: Incident | null;
  selectedBusId?: string | null;
  onSelectIncident?: (incident: Incident) => void;
  onSelectBus?: (bus: Bus) => void;
  height?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  buses,
  incidents,
  routes = [],
  selectedIncident,
  selectedBusId,
  onSelectIncident,
  onSelectBus,
  height = '500px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const busMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const incidentMarkersRef = useRef<{ [key: string]: L.Marker }>({});
  const routeLayersRef = useRef<L.Polyline[]>([]);

  // Layer Visibility Controls
  const [showBuses, setShowBuses] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showPotholes, setShowPotholes] = useState(true);
  const [showRoadDamage, setShowRoadDamage] = useState(true);
  const [showAccidents, setShowAccidents] = useState(true);
  const [showWaterlogging, setShowWaterlogging] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center on New Delhi Urban Transit Network
    const map = L.map(mapContainerRef.current, {
      center: [28.5800, 77.2100],
      zoom: 12,
      zoomControl: true,
      attributionControl: true
    });

    // Real OpenStreetMap Tile Layer with obligatory OpenStreetMap contributors attribution
    // Using OpenStreetMap standard tiles / Dark matter basemap with explicit OSM attribution
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Render Routes and Traffic / Road Condition Visualizations
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old routes
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (!showRoutes) return;

    routes.forEach(route => {
      const latlngs = route.geometry.map(pt => [pt.lat, pt.lng] as [number, number]);
      const isDiversion = route.status === 'diversion' || (route as any).is_diversion;
      
      let routeColor = '#34332F';
      if (isDiversion) routeColor = '#4E9F86';
      else if (showTraffic && route.status === 'congested') routeColor = '#D99A3D';
      else if (route.status === 'hazard_alert') routeColor = '#D96B55';

      const polyline = L.polyline(latlngs, {
        color: routeColor,
        weight: isDiversion ? 5 : (route.status === 'congested' ? 6 : 4),
        opacity: 0.90,
        dashArray: isDiversion ? '8, 6' : (route.status === 'hazard_alert' ? '6, 6' : undefined)
      }).addTo(map);

      polyline.bindTooltip(`
        <div style="font-family: monospace; font-size: 11px;">
          <b>${route.route_name}</b><br/>
          ${isDiversion ? '<span style="color: #4E9F86; font-weight: bold;">SIMULATED ROUTE DIVERSION</span><br/>' : `Traffic: ${route.status.toUpperCase()}<br/>`}
          Length: ${route.length_km} km
        </div>
      `, {
        className: 'leaflet-dark-tooltip'
      });

      routeLayersRef.current.push(polyline);
    });
  }, [routes, showRoutes, showTraffic]);

  // Render & Update Bus Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!showBuses) {
      Object.values(busMarkersRef.current).forEach(m => map.removeLayer(m));
      busMarkersRef.current = {};
      return;
    }

    buses.forEach(bus => {
      const isSelected = selectedBusId === bus.id;
      const customBusHtml = `
        <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;">
          <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${isSelected ? '#D99A3D' : '#191917'}; border: 2px solid ${isSelected ? '#F1C46A' : '#D99A3D'}; box-shadow: 0 0 14px rgba(217, 154, 61, 0.6); display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? '#11110F' : '#F2EFE8'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C18.1 6.8 17.2 6 16.2 6H4c-1.1 0-2 .9-2 2v10h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
            </svg>
          </div>
          <div style="position: absolute; bottom: -8px; font-family: monospace; font-size: 9px; font-weight: bold; background: #11110F; color: #F1C46A; padding: 1px 4px; border-radius: 2px; border: 1px solid #34332F; white-space: nowrap;">
            ${bus.id}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-bus-marker',
        html: customBusHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      if (busMarkersRef.current[bus.id]) {
        busMarkersRef.current[bus.id].setLatLng([bus.latitude, bus.longitude]);
        busMarkersRef.current[bus.id].setIcon(icon);
      } else {
        const marker = L.marker([bus.latitude, bus.longitude], { icon }).addTo(map);
        marker.on('click', () => onSelectBus && onSelectBus(bus));
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; min-width: 170px;">
            <div style="font-weight: bold; color: #F1C46A; margin-bottom: 4px;">SENSING UNIT ${bus.id}</div>
            <div style="color: #96938B;">${bus.bus_number}</div>
            <div style="color: #F2EFE8; margin-top: 4px;">Route: ${bus.route}</div>
            <div style="color: #6F9B87; margin-top: 2px;">Speed: ${bus.speed} km/h | Status: ${bus.status.toUpperCase()}</div>
            <div style="color: #96938B; margin-top: 2px;">Camera: ${bus.camera_status.toUpperCase()} | GPS: ${bus.gps_status.toUpperCase()}</div>
            <div style="color: #D99A3D; margin-top: 4px; font-size: 10px;">${bus.latitude.toFixed(5)}, ${bus.longitude.toFixed(5)}</div>
          </div>
        `);
        busMarkersRef.current[bus.id] = marker;
      }
    });

    // Clean up missing markers
    const currentIds = new Set(buses.map(b => b.id));
    Object.keys(busMarkersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        map.removeLayer(busMarkersRef.current[id]);
        delete busMarkersRef.current[id];
      }
    });
  }, [buses, selectedBusId, showBuses, onSelectBus]);

  // Render Incident / Hazard Markers with Categorized Filter
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Filter incidents based on active layer controls
    const visibleIncidents = incidents.filter(inc => {
      const type = inc.incident_type.toLowerCase();
      if (type === 'pothole' && !showPotholes) return false;
      if (type === 'road_damage' && !showRoadDamage) return false;
      if ((type === 'accident' || type === 'vehicle_incident') && !showAccidents) return false;
      if (type === 'waterlogging' && !showWaterlogging) return false;
      if ((type === 'congestion' || type === 'traffic_congestion') && !showTraffic) return false;
      return true;
    });

    const visibleIds = new Set(visibleIncidents.map(i => i.id));

    // Remove hidden or obsolete markers
    Object.keys(incidentMarkersRef.current).forEach(id => {
      if (!visibleIds.has(id)) {
        map.removeLayer(incidentMarkersRef.current[id]);
        delete incidentMarkersRef.current[id];
      }
    });

    visibleIncidents.forEach(inc => {
      const isSelected = selectedIncident?.id === inc.id;
      const isResolved = inc.status === 'resolved';

      let markerColor = '#6F9B87';
      if (!isResolved) {
        if (inc.severity === 'critical' || inc.incident_type === 'accident' || inc.incident_type === 'vehicle_incident') markerColor = '#D96B55';
        else if (inc.severity === 'high') markerColor = '#D99A3D';
        else markerColor = '#F1C46A';
      }

      const iconHtml = `
        <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
          ${!isResolved && (inc.severity === 'critical' || inc.incident_type === 'accident' || inc.incident_type === 'vehicle_incident') ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: ${markerColor}44; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${isSelected ? '#F2EFE8' : markerColor}; border: 2px solid #11110F; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.85);">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${isSelected ? markerColor : '#11110F'}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">
              ${isResolved ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>'}
            </svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-incident-marker',
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const popupHtml = `
        <div style="font-family: monospace; font-size: 11px; min-width: 200px;">
          <div style="font-weight: bold; color: ${markerColor}; font-size: 12px; margin-bottom: 4px;">
            ${inc.title}
          </div>
          <div style="color: #96938B; margin-bottom: 4px;">
            Type: <span style="color: #F2EFE8;">${inc.incident_type.toUpperCase()}</span> | Severity: <span style="color: ${markerColor}; font-weight: bold;">${inc.severity.toUpperCase()}</span>
          </div>
          <div style="color: #96938B; margin-bottom: 4px;">
            Status: <span style="color: ${isResolved ? '#6F9B87' : '#D99A3D'}; font-weight: bold;">${inc.status.toUpperCase()}</span>
          </div>
          ${(inc as any).bus_id ? `
            <div style="color: #F1C46A; margin-bottom: 4px;">
              Sensed by Unit: <b>${(inc as any).bus_id}</b>
            </div>
          ` : `
            <div style="color: #96938B; margin-bottom: 6px;">
              Sensed by Fleet: ${inc.detection_count} time(s)
            </div>
          `}
          <div style="color: #96938B; font-size: 10px; margin-bottom: 6px;">
            GPS: ${inc.latitude.toFixed(5)}, ${inc.longitude.toFixed(5)}
          </div>
          ${inc.evidence_url ? `
            <div style="margin-top: 6px; border: 1px solid #34332F; border-radius: 4px; overflow: hidden; max-height: 100px;">
              <img src="${inc.evidence_url}" alt="Evidence" style="width: 100%; height: 90px; object-fit: cover;" onerror="this.style.display='none'" />
            </div>
          ` : ''}
        </div>
      `;

      if (incidentMarkersRef.current[inc.id]) {
        incidentMarkersRef.current[inc.id].setLatLng([inc.latitude, inc.longitude]);
        incidentMarkersRef.current[inc.id].setIcon(icon);
      } else {
        const marker = L.marker([inc.latitude, inc.longitude], { icon }).addTo(map);
        marker.on('click', () => onSelectIncident && onSelectIncident(inc));
        marker.bindPopup(popupHtml);
        incidentMarkersRef.current[inc.id] = marker;
      }
    });
  }, [incidents, selectedIncident, showPotholes, showRoadDamage, showAccidents, showWaterlogging, onSelectIncident]);

  // Center on Selected Bus or Incident
  useEffect(() => {
    if (!mapRef.current) return;
    if (selectedIncident) {
      mapRef.current.setView([selectedIncident.latitude, selectedIncident.longitude], 15, { animate: true });
    }
  }, [selectedIncident]);

  return (
    <div className="relative w-full rounded border border-[#34332F] overflow-hidden" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Visibility Control Bar */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-1.5">
        <button
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          className="bg-[#191917]/95 border border-[#34332F] backdrop-blur-md rounded px-3 py-1.5 flex items-center gap-2 text-xs font-mono text-[#F1C46A] hover:border-[#D99A3D] shadow-lg transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-[#D99A3D]" />
          <span>MAP LAYERS ({[showBuses, showRoutes, showPotholes, showRoadDamage, showAccidents, showWaterlogging, showTraffic].filter(Boolean).length})</span>
        </button>

        {showLayerMenu && (
          <div className="bg-[#191917]/95 border border-[#34332F] backdrop-blur-md rounded-lg p-2.5 shadow-2xl flex flex-col gap-1.5 min-w-[210px] text-xs font-mono animate-in fade-in slide-in-from-top-2">
            <span className="text-[10px] uppercase font-bold text-[#96938B] px-1 pb-1 border-b border-[#34332F] block">
              Toggle Feature Layers
            </span>

            <button
              onClick={() => setShowBuses(!showBuses)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showBuses ? 'bg-[#D99A3D]/20 text-[#D99A3D]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Buses ({buses.length})</span>
              {showBuses ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowRoutes(!showRoutes)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showRoutes ? 'bg-[#6F9B87]/20 text-[#6F9B87]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Corridors ({routes.length})</span>
              {showRoutes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowPotholes(!showPotholes)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showPotholes ? 'bg-[#D96B55]/20 text-[#D96B55]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Potholes ({incidents.filter(i => i.incident_type === 'pothole').length})</span>
              {showPotholes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowRoadDamage(!showRoadDamage)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showRoadDamage ? 'bg-[#D99A3D]/20 text-[#D99A3D]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Road Cracks ({incidents.filter(i => i.incident_type === 'road_damage').length})</span>
              {showRoadDamage ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowAccidents(!showAccidents)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showAccidents ? 'bg-[#D96B55]/20 text-[#D96B55]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Accidents ({incidents.filter(i => i.incident_type === 'accident').length})</span>
              {showAccidents ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowWaterlogging(!showWaterlogging)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showWaterlogging ? 'bg-[#F1C46A]/20 text-[#F1C46A]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Waterlogging ({incidents.filter(i => i.incident_type === 'waterlogging').length})</span>
              {showWaterlogging ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`flex items-center justify-between px-2 py-1 rounded transition-colors ${showTraffic ? 'bg-[#6F9B87]/20 text-[#6F9B87]' : 'text-[#96938B] hover:text-[#F2EFE8]'}`}
            >
              <span>Traffic Heatmap</span>
              {showTraffic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#191917]/90 border border-[#34332F] backdrop-blur-md rounded px-3 py-1.5 flex items-center gap-3 text-[11px] font-mono shadow-md">
        <span className="flex items-center gap-1.5 text-[#F2EFE8]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D99A3D] border border-[#F1C46A]" />
          Bus
        </span>
        <span className="flex items-center gap-1.5 text-[#D96B55]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D96B55]" />
          Critical Hazard
        </span>
        <span className="flex items-center gap-1.5 text-[#D99A3D]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D99A3D]" />
          Road Defect
        </span>
        <span className="flex items-center gap-1.5 text-[#6F9B87]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6F9B87]" />
          Resolved
        </span>
      </div>
    </div>
  );
};
