import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bus, Detection } from '../types';
import { api } from '../services/api';
import { LiveFeed } from '../components/live/LiveFeed';
import { DetectionCard } from '../components/live/DetectionCard';
import { Bus as BusIcon, Radio, Video, Navigation, ShieldCheck, Activity } from 'lucide-react';

export const LiveBus: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>(searchParams.get('busId') || 'DL-101');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [liveTelemetry, setLiveTelemetry] = useState<any>(null);

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const bList = await api.getBuses();
        setBuses(bList);
        if (!selectedBusId && bList.length > 0) {
          setSelectedBusId(bList[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchBuses();
  }, []);

  useEffect(() => {
    const fetchDetections = async () => {
      try {
        const dList = await api.getDetections(25, selectedBusId);
        setDetections(dList);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetections();
    const interval = setInterval(fetchDetections, 3000);
    return () => clearInterval(interval);
  }, [selectedBusId]);

  const currentBus = buses.find(b => b.id === selectedBusId) || buses[0] || null;

  const handleSelectBus = (busId: string) => {
    setSelectedBusId(busId);
    setSearchParams({ busId });
  };

  const handleNewDetection = (det: Detection) => {
    // Only accept detections matching currently selected bus to prevent mixing
    const curUpper = selectedBusId.toUpperCase();
    const detUpper = (det.bus_id || '').toUpperCase();
    const isMatch = detUpper === curUpper ||
      (curUpper === 'BUS-01' && detUpper === 'DL-101') ||
      (curUpper === 'BUS-02' && detUpper === 'DL-201') ||
      (curUpper === 'BUS-03' && detUpper === 'DL-301') ||
      (curUpper === 'BUS-04' && detUpper === 'DL-401') ||
      (curUpper === 'DL-101' && detUpper === 'BUS-01') ||
      (curUpper === 'DL-201' && detUpper === 'BUS-02') ||
      (curUpper === 'DL-301' && detUpper === 'BUS-03') ||
      (curUpper === 'DL-401' && detUpper === 'BUS-04');

    if (!isMatch) return;

    setDetections(prev => {
      if (prev.some(d => d.id === det.id)) return prev;
      return [det, ...prev.slice(0, 24)];
    });
  };

  const handleTelemetryUpdated = (telemetry: any) => {
    setLiveTelemetry(telemetry);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">LIVE URBAN VISION FEED</h1>
            <span className="flex items-center gap-1 text-xs font-mono text-[#6F9B87] px-2 py-0.5 rounded bg-[#6F9B87]/15 border border-[#6F9B87]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B87] animate-pulse" />
              RECORDED ROAD FOOTAGE — LIVE SIMULATION
            </span>
          </div>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Real Dashcam Computer Vision Inference with Edge Object Detection & GPS Synchronization
          </p>
        </div>

        {/* Bus Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#96938B]">ACTIVE SENSING UNIT:</span>
          <select
            value={selectedBusId}
            onChange={(e) => handleSelectBus(e.target.value)}
            className="py-1.5 px-3 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F1C46A] focus:outline-none focus:border-[#D99A3D]"
          >
            <option value="BUS-01">BUS-01 — Pothole Monitoring</option>
            <option value="BUS-02">BUS-02 — Vehicle Incident Analysis</option>
            <option value="BUS-03">BUS-03 — Highway Traffic Monitoring</option>
            <option value="BUS-04">BUS-04 — Road Damage & Crack Inspection</option>
            {buses.filter(b => !['BUS-01', 'BUS-02', 'BUS-03', 'BUS-04', 'DL-101', 'DL-201', 'DL-301', 'DL-401'].includes(b.id)).map(b => (
              <option key={b.id} value={b.id}>
                {b.id} — {b.route}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Prerecorded Real-World Road Footage Streams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* BUS-01 Stream Card */}
        <button
          onClick={() => handleSelectBus('BUS-01')}
          className={`p-3.5 rounded-lg border text-left font-mono transition-all ${
            (selectedBusId === 'BUS-01' || selectedBusId === 'DL-101')
              ? 'bg-[#191917] border-[#D99A3D] shadow-lg shadow-[#D99A3D]/10'
              : 'bg-[#11110F] border-[#34332F] hover:border-[#96938B]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-[#F2EFE8]">BUS-01</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D99A3D]/20 text-[#D99A3D] font-bold border border-[#D99A3D]/30">
              LIVE SIMULATION
            </span>
          </div>
          <div className="text-xs text-[#F1C46A] font-bold">Pothole Monitoring</div>
          <div className="text-[10px] text-[#96938B] mt-0.5">Route 419 (CP to AIIMS)</div>
          <div className="mt-2 text-[10px] text-[#6F9B87] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B87] animate-pulse"></span>
            Real Recorded Road Footage
          </div>
        </button>

        {/* BUS-02 Stream Card */}
        <button
          onClick={() => handleSelectBus('BUS-02')}
          className={`p-3.5 rounded-lg border text-left font-mono transition-all ${
            (selectedBusId === 'BUS-02' || selectedBusId === 'DL-201')
              ? 'bg-[#191917] border-[#D96B55] shadow-lg shadow-[#D96B55]/10'
              : 'bg-[#11110F] border-[#34332F] hover:border-[#96938B]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-[#F2EFE8]">BUS-02</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D96B55]/20 text-[#D96B55] font-bold border border-[#D96B55]/30">
              LIVE SIMULATION
            </span>
          </div>
          <div className="text-xs text-[#D96B55] font-bold">Vehicle Incident Analysis</div>
          <div className="text-[10px] text-[#96938B] mt-0.5">Route 502 (Mehrauli-ISBT)</div>
          <div className="mt-2 text-[10px] text-[#D96B55] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D96B55] animate-pulse"></span>
            REAL HIT-AND-RUN FOOTAGE (PUBLIC DOMAIN)
          </div>
        </button>

        {/* BUS-03 Stream Card */}
        <button
          onClick={() => handleSelectBus('BUS-03')}
          className={`p-3.5 rounded-lg border text-left font-mono transition-all ${
            (selectedBusId === 'BUS-03' || selectedBusId === 'DL-301')
              ? 'bg-[#191917] border-[#4E9F86] shadow-lg shadow-[#4E9F86]/10'
              : 'bg-[#11110F] border-[#34332F] hover:border-[#96938B]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-[#F2EFE8]">BUS-03</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#4E9F86]/20 text-[#4E9F86] font-bold border border-[#4E9F86]/30">
              LIVE SIMULATION
            </span>
          </div>
          <div className="text-xs text-[#4E9F86] font-bold">Highway Traffic Monitoring</div>
          <div className="text-[10px] text-[#96938B] mt-0.5">Route 717 (Aerocity-Nehru Pl)</div>
          <div className="mt-2 text-[10px] text-[#4E9F86] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4E9F86] animate-pulse"></span>
            Real Highway Video + Route Diversion
          </div>
        </button>

        {/* BUS-04 Stream Card */}
        <button
          onClick={() => handleSelectBus('BUS-04')}
          className={`p-3.5 rounded-lg border text-left font-mono transition-all ${
            (selectedBusId === 'BUS-04' || selectedBusId === 'DL-401')
              ? 'bg-[#191917] border-[#D99A3D] shadow-lg shadow-[#D99A3D]/10'
              : 'bg-[#11110F] border-[#34332F] hover:border-[#96938B]'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-xs text-[#F2EFE8]">BUS-04</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D99A3D]/20 text-[#D99A3D] font-bold border border-[#D99A3D]/30">
              LIVE SIMULATION
            </span>
          </div>
          <div className="text-xs text-[#F1C46A] font-bold">Road Damage & Cracks</div>
          <div className="text-[10px] text-[#96938B] mt-0.5">Route 801 (Outer Ring Feeder)</div>
          <div className="mt-2 text-[10px] text-[#D99A3D] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99A3D] animate-pulse"></span>
            Real Road Cracks Video + ASTM D6433
          </div>
        </button>
      </div>

      {/* Main Content Grid: Live Feed (2/3) + Detections Stream (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Feed & Telemetry Box */}
        <div className="lg:col-span-2 space-y-4">
          <LiveFeed
            bus={currentBus}
            detections={detections}
            onNewDetection={handleNewDetection}
            onTelemetryUpdated={handleTelemetryUpdated}
          />

          {/* Bus Telemetry Metadata Strip */}
          {currentBus && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-[#191917] border border-[#34332F] rounded">
                <span className="text-[10px] font-mono uppercase text-[#96938B] block">Vehicle Plate</span>
                <span className="text-xs font-mono font-bold text-[#F2EFE8] mt-0.5 block">{currentBus.bus_number}</span>
              </div>

              <div className="p-3 bg-[#191917] border border-[#34332F] rounded">
                <span className="text-[10px] font-mono uppercase text-[#96938B] block">
                  {selectedBusId.toUpperCase().includes('02') || selectedBusId.toUpperCase().includes('201') ? 'SIMULATED DEMO TELEMETRY' : 'GPS Coordinates'}
                </span>
                <span className="text-xs font-mono text-[#F1C46A] mt-0.5 block">
                  {liveTelemetry ? `${liveTelemetry.latitude.toFixed(5)}, ${liveTelemetry.longitude.toFixed(5)}` : `${currentBus.latitude.toFixed(5)}, ${currentBus.longitude.toFixed(5)}`}
                </span>
              </div>

              <div className="p-3 bg-[#191917] border border-[#34332F] rounded">
                <span className="text-[10px] font-mono uppercase text-[#96938B] block">Cruising Speed</span>
                <span className="text-xs font-mono font-bold text-[#6F9B87] mt-0.5 block">
                  {liveTelemetry ? `${liveTelemetry.speed} km/h` : `${currentBus.speed} km/h`}
                </span>
              </div>

              <div className="p-3 bg-[#191917] border border-[#34332F] rounded">
                <span className="text-[10px] font-mono uppercase text-[#96938B] block">Source & Health</span>
                <span className="text-xs font-mono text-[#6F9B87] mt-0.5 block flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  {selectedBusId.toUpperCase().includes('02') || selectedBusId.toUpperCase().includes('201') ? 'PUBLIC DOMAIN VIDEO' : 'AI VERIFIED (1080P)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Recent AI Detections Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#96938B]">
              Real-Time AI Detections ({detections.length})
            </h2>
            <span className="text-[10px] font-mono text-[#D99A3D] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D99A3D] animate-ping" />
              LIVE INFERENCE
            </span>
          </div>

          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {detections.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-[#34332F] rounded text-xs font-mono text-[#96938B]">
                Waiting for detections from road video feed...
              </div>
            ) : (
              detections.map(det => (
                <DetectionCard key={det.id} detection={det} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
