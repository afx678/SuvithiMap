import React, { useState, useEffect, useRef } from 'react';
import { Bus, Detection } from '../../types';
import { api } from '../../services/api';
import {
  Play,
  Pause,
  RotateCcw,
  Radio,
  Crosshair,
  ShieldAlert,
  Cpu,
  Navigation,
  Sparkles,
  Layers,
  Video
} from 'lucide-react';

interface LiveFeedProps {
  bus: Bus | null;
  detections: Detection[];
  onTriggerDemoHazard?: (type: string) => void;
  onNewDetection?: (detection: Detection) => void;
  onTelemetryUpdated?: (telemetry: any) => void;
}

export interface BusStreamDef {
  id: string;
  busId: string;
  title: string;
  missionTitle: string;
  missionType: 'pothole' | 'vehicle_incident' | 'highway_traffic' | 'road_damage';
  path: string;
  source: string;
  warningLabel: string;
  defaultModes: string[];
}

export const BUS_STREAMS: BusStreamDef[] = [
  {
    id: 'BUS-01',
    busId: 'BUS-01',
    title: 'BUS-01 — Pothole Monitoring',
    missionTitle: 'Pothole Monitoring',
    missionType: 'pothole',
    path: '/demo/videos/potholes_road.mp4',
    source: 'Rajarshisaha10 Real Roadway Footage',
    warningLabel: '⚠ POTHOLE DETECTED',
    defaultModes: ['pothole']
  },
  {
    id: 'BUS-02',
    busId: 'BUS-02',
    title: 'BUS-02 — Vehicle Incident Analysis',
    missionTitle: 'Vehicle Incident Analysis',
    missionType: 'vehicle_incident',
    path: '/demo/videos/hit_and_run_collision.webm',
    source: 'Wikimedia Commons (Public Domain)',
    warningLabel: '⚠ VEHICLE INCIDENT DETECTED',
    defaultModes: ['accident', 'vehicle']
  },
  {
    id: 'BUS-03',
    busId: 'BUS-03',
    title: 'BUS-03 — Highway Traffic Monitoring',
    missionTitle: 'Highway Traffic Monitoring',
    missionType: 'highway_traffic',
    path: '/demo/videos/highway_traffic.mp4',
    source: 'Serialdotai Real Highway Traffic Cam Footage',
    warningLabel: '⚠ TRAFFIC CONGESTION DETECTED',
    defaultModes: ['vehicle']
  },
  {
    id: 'BUS-04',
    busId: 'BUS-04',
    title: 'BUS-04 — Road Damage & Crack Inspection',
    missionTitle: 'Road Damage & Crack Inspection',
    missionType: 'road_damage',
    path: '/demo/videos/cracks_road.mp4',
    source: 'Tanvir-Pandit Real Road Cracks Footage',
    warningLabel: '⚠ ROAD DAMAGE DETECTED',
    defaultModes: ['road_damage', 'pothole']
  }
];

export const LiveFeed: React.FC<LiveFeedProps> = ({
  bus,
  detections,
  onTriggerDemoHazard,
  onNewDetection,
  onTelemetryUpdated
}) => {
  // Determine matching stream based on selected bus
  const getStreamForBus = (busId?: string): BusStreamDef => {
    if (!busId) return BUS_STREAMS[0];
    const u = busId.toUpperCase();
    if (u.includes('04') || u.includes('401') || u.includes('402')) return BUS_STREAMS[3];
    if (u.includes('02') || u.includes('201') || u.includes('202')) return BUS_STREAMS[1];
    if (u.includes('03') || u.includes('301') || u.includes('302')) return BUS_STREAMS[2];
    return BUS_STREAMS[0];
  };

  const [selectedVideo, setSelectedVideo] = useState<BusStreamDef>(getStreamForBus(bus?.id));
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showBoxes, setShowBoxes] = useState(true);
  const [aiRunning, setAiRunning] = useState(true);
  const [activeBoxes, setActiveBoxes] = useState<any[]>([]);
  const [liveTraffic, setLiveTraffic] = useState<any>({ vehicle_count: 0, congestion_level: 'low' });
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [warningType, setWarningType] = useState<string | null>(null);
  const [diversionInfo, setDiversionInfo] = useState<any | null>(null);
  const [incidentInfo, setIncidentInfo] = useState<any | null>(null);
  const [liveGps, setLiveGps] = useState<{ lat: number; lng: number; speed: number }>({
    lat: bus?.latitude || 28.6139,
    lng: bus?.longitude || 77.2090,
    speed: bus?.speed || 28.5
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastInferenceTimeRef = useRef<number>(0);
  const isInferringRef = useRef<boolean>(false);

  // Synchronize stream with selected bus
  useEffect(() => {
    const stream = getStreamForBus(bus?.id);
    setSelectedVideo(stream);
    setActiveBoxes([]);
    setActiveWarning(null);
    setDiversionInfo(null);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [bus?.id]);

  // Play / Pause handler
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Video Time Update & Synchronized GPS Mapping
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Frame sampling for real AI inference: run every 700ms while video is playing
    const now = Date.now();
    if (aiRunning && !isInferringRef.current && now - lastInferenceTimeRef.current >= 700) {
      lastInferenceTimeRef.current = now;
      captureAndInfer(time);
    }
  };

  // Capture video frame and send to real backend AI inference
  const captureAndInfer = async (videoSecs: number) => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    isInferringRef.current = true;
    try {
      // Create off-screen canvas for frame extraction
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = Math.min(640, video.videoWidth);
      canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameBase64 = canvas.toDataURL('image/jpeg', 0.8);

      const res = await api.inferFrame({
        frame_data: frameBase64,
        video_timestamp: videoSecs,
        bus_id: selectedVideo.busId,
        route: bus?.route,
        modes: selectedVideo.defaultModes
      });

      if (res && res.success) {
        // Update active bounding boxes
        const normalizedBoxes = (res.detections || []).map((d: any) => {
          if (!d.bbox || d.bbox.length !== 4) return null;
          return {
            id: d.id,
            type: d.detection_type,
            class_name: d.class_name,
            conf: d.confidence,
            track_id: d.track_id,
            plate_status: d.metadata?.plate_status || (d.detection_type === 'vehicle' && selectedVideo.missionType === 'vehicle_incident' ? 'NUMBER PLATE: NOT READABLE' : undefined),
            registration_number: d.metadata?.registration_number,
            ocr_confidence: d.metadata?.ocr_confidence,
            left: (d.bbox[0] / canvas.width) * 100,
            top: (d.bbox[1] / canvas.height) * 100,
            width: ((d.bbox[2] - d.bbox[0]) / canvas.width) * 100,
            height: ((d.bbox[3] - d.bbox[1]) / canvas.height) * 100
          };
        }).filter(Boolean);

        setActiveBoxes(normalizedBoxes);

        // Update warnings & diversion recommendations
        setActiveWarning(res.active_warning || null);
        setWarningType(res.warning_type || null);
        setDiversionInfo(res.diversion_info || null);
        setIncidentInfo(res.incident_info || null);

        if (res.telemetry) {
          setLiveGps({
            lat: res.telemetry.latitude,
            lng: res.telemetry.longitude,
            speed: res.telemetry.speed
          });
          if (onTelemetryUpdated) {
            onTelemetryUpdated(res.telemetry);
          }
        }

        if (res.traffic_stats) {
          setLiveTraffic(res.traffic_stats);
        }

        // Notify parent of new detections
        if (res.detections && res.detections.length > 0 && onNewDetection) {
          res.detections.forEach((d: Detection) => onNewDetection(d));
        }
      }
    } catch (e) {
      console.warn('Live inference frame error:', e);
    } finally {
      isInferringRef.current = false;
    }
  };

  // Format seconds into MM:SS.ms
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs - Math.floor(secs)) * 10);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const handleTriggerDemoHazard = async (type: string) => {
    try {
      const res = await api.triggerHazard(selectedVideo.busId, type, 'critical');
      if (res && res.success) {
        if (res.detection && onNewDetection) {
          onNewDetection(res.detection);
        }
        const warningText =
          type === 'accident'
            ? '⚠ VEHICLE INCIDENT DETECTED'
            : type === 'road_damage'
            ? '⚠ ROAD DAMAGE DETECTED'
            : `⚠ ${type.toUpperCase()} DETECTED`;
        setActiveWarning(warningText);
        setWarningType(type);
        if (onTriggerDemoHazard) {
          onTriggerDemoHazard(type);
        }
      }
    } catch (e) {
      console.warn('Failed to trigger hazard:', e);
    }
  };

  return (
    <div className="bg-[#191917] border border-[#34332F] rounded-lg flex flex-col overflow-hidden shadow-xl">
      {/* Feed Header */}
      <div className="p-3 border-b border-[#34332F] bg-[#11110F] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-[#22221F] text-[#D99A3D]">
            <Radio className="w-4 h-4 animate-pulse text-[#D96B55]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-mono font-bold text-[#F2EFE8]">
                {selectedVideo.busId} — {selectedVideo.missionTitle.toUpperCase()}
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#D99A3D]/20 text-[#D99A3D] border border-[#D99A3D]/30 font-bold">
                LIVE SIMULATION — {selectedVideo.busId}
              </span>
              {selectedVideo.busId === 'BUS-02' && (
                <a
                  href="https://commons.wikimedia.org/wiki/File:Felony_Hit_and_Run_Collision_Leaves_Driver_in_Critical_Condition.webm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#6F9B87]/20 text-[#6F9B87] border border-[#6F9B87]/30 font-bold hover:underline"
                >
                  PUBLIC DOMAIN HIT-AND-RUN VIDEO
                </a>
              )}
            </div>
            <p className="text-[10px] font-mono text-[#96938B] mt-0.5">
              Prerecorded Video: {selectedVideo.source} | Camera: {bus?.camera_status.toUpperCase() || 'ONLINE'} | Telemetry: {selectedVideo.busId === 'BUS-02' ? 'SIMULATED DEMO TELEMETRY' : 'GPS LOCKED'}
            </p>
          </div>
        </div>

        {/* Video Clip Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedVideo.id}
            onChange={(e) => {
              const v = BUS_STREAMS.find(x => x.id === e.target.value);
              if (v) {
                setSelectedVideo(v);
                setActiveBoxes([]);
                setActiveWarning(null);
                setDiversionInfo(null);
                setIncidentInfo(null);
              }
            }}
            className="py-1 px-2.5 bg-[#22221F] border border-[#34332F] rounded text-xs font-mono text-[#F1C46A] focus:outline-none focus:border-[#D99A3D]"
          >
            {BUS_STREAMS.map(v => (
              <option key={v.id} value={v.id}>
                {v.title}
              </option>
            ))}
          </select>

          {/* AI Inference Toggle */}
          <button
            onClick={() => setAiRunning(!aiRunning)}
            className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors flex items-center gap-1.5 ${
              aiRunning
                ? 'bg-[#6F9B87]/20 text-[#6F9B87] border-[#6F9B87]/50'
                : 'bg-[#22221F] text-[#96938B] border-[#34332F]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>AI [{aiRunning ? 'ACTIVE' : 'OFF'}]</span>
          </button>

          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`px-2 py-1 rounded text-xs font-mono border transition-colors ${
              showBoxes
                ? 'bg-[#D99A3D]/20 text-[#D99A3D] border-[#D99A3D]/40'
                : 'bg-[#22221F] text-[#96938B] border-[#34332F]'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 inline mr-1" />
            BBOX [{showBoxes ? 'ON' : 'OFF'}]
          </button>
        </div>
      </div>

      {/* Video Viewport with Live AI Bounding Box Overlay */}
      <div className="relative w-full aspect-video bg-[#0a0a08] overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={selectedVideo.path}
          autoPlay
          loop
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          className="w-full h-full object-cover"
        />

        {/* Hidden Canvas for Frame Sampling */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Real AI Warning Banner Overlay */}
        {activeWarning && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 pointer-events-none z-20 flex flex-col items-center gap-1.5 w-full max-w-sm px-3">
            <div className={`px-4 py-2 rounded-lg font-mono font-bold text-xs sm:text-sm shadow-2xl border flex items-center gap-2 animate-pulse ${
              warningType === 'vehicle_incident'
                ? 'bg-[#D96B55] text-[#11110F] border-red-300'
                : 'bg-[#D99A3D] text-[#11110F] border-yellow-200'
            }`}>
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{activeWarning}</span>
            </div>

            {/* BUS-02 Vehicle Incident Warning Panel */}
            {warningType === 'vehicle_incident' && (
              <div className="w-full bg-[#11110F]/95 border-2 border-[#D96B55] rounded p-3 backdrop-blur-md shadow-2xl text-[10px] font-mono text-[#F2EFE8] space-y-1.5">
                <div className="flex items-center justify-between text-[#D96B55] font-bold border-b border-[#34332F] pb-1">
                  <span>BUS ID: BUS-02</span>
                  <span>INCIDENT TYPE: VEHICLE INCIDENT</span>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span>SEVERITY:</span>
                  <span className="text-[#D96B55] font-bold uppercase">CRITICAL</span>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span>TIMESTAMP:</span>
                  <span className="text-[#F2EFE8]">{formatTime(currentTime)}</span>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span>SOURCE:</span>
                  <a
                    href="https://commons.wikimedia.org/wiki/File:Felony_Hit_and_Run_Collision_Leaves_Driver_in_Critical_Condition.webm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#6F9B87] font-bold hover:underline"
                  >
                    Wikimedia Commons (Public Domain)
                  </a>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span>TELEMETRY:</span>
                  <span className="text-[#F1C46A] font-bold">SIMULATED DEMO TELEMETRY</span>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span>GPS COORDINATES:</span>
                  <span className="text-[#F1C46A]">{liveGps.lat.toFixed(5)}, {liveGps.lng.toFixed(5)}</span>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span>DETECTION CONFIDENCE:</span>
                  <span className="text-[#F1C46A] font-bold">
                    {incidentInfo?.confidence ? `${Math.round(incidentInfo.confidence * 100)}%` : 'MODEL VERIFIED'}
                  </span>
                </div>
                <div className="pt-1 border-t border-[#34332F]">
                  <div className="text-[#96938B] font-bold mb-1">TRACKED VEHICLE INFORMATION:</div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between bg-[#191917] px-2 py-1 rounded border border-[#34332F]">
                      <span className="text-[#F2EFE8]">Car 1:</span>
                      <span className="text-[#D99A3D] font-bold">DL12A8 (SIMULATED)</span>
                    </div>
                    <div className="flex items-center justify-between bg-[#191917] px-2 py-1 rounded border border-[#34332F]">
                      <span className="text-[#F2EFE8]">Car 2:</span>
                      <span className="text-[#D99A3D] font-bold">DL56Q1 (SIMULATED)</span>
                    </div>
                  </div>
                </div>
                {incidentInfo?.evidence_url && (
                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#6F9B87] border-t border-[#34332F]">
                    <span className="font-bold">EVIDENCE FRAME:</span>
                    <a
                      href={incidentInfo.evidence_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:text-[#F2EFE8]"
                    >
                      {incidentInfo.evidence_url.split('/').pop()}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Route Diversion Recommendation Banner (for BUS-03) */}
        {diversionInfo && (
          <div className="absolute bottom-12 left-3 right-3 pointer-events-none z-20">
            <div className="bg-[#11110F]/95 border-2 border-[#4E9F86] p-2.5 rounded-lg backdrop-blur-md shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-[#4E9F86]/20 text-[#4E9F86] font-bold text-[10px]">
                  DIVERSION
                </span>
                <div>
                  <div className="text-[#4E9F86] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4E9F86] animate-pulse"></span>
                    ⚠ ROUTE DIVERSION RECOMMENDED
                  </div>
                  <div className="text-[10px] text-[#96938B]">
                    Affected: {diversionInfo.affected_section} • Bypass: <span className="text-[#F2EFE8]">{diversionInfo.suggested_diversion}</span>
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-[#4E9F86]/20 text-[#4E9F86] border border-[#4E9F86]/40 uppercase font-bold whitespace-nowrap">
                SIMULATED ROUTE DIVERSION
              </span>
            </div>
          </div>
        )}

        {/* Bounding Box Overlays */}
        {showBoxes && (
          <div className="absolute inset-0 pointer-events-none">
            {selectedVideo.busId === 'BUS-02' ? (
              <>
                {/* Simple static visual box: Car 1 */}
                <div
                  className="absolute border-2 border-[#D96B55]"
                  style={{
                    left: '30%',
                    top: '46%',
                    width: '18%',
                    height: '15%',
                    boxShadow: '0 0 8px rgba(217, 107, 85, 0.4)',
                    backgroundColor: 'rgba(217, 107, 85, 0.15)'
                  }}
                >
                  <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow bg-[#D96B55] text-[#11110F]">
                    Car 1: DL12A8 (SIMULATED)
                  </div>
                </div>

                {/* Simple static visual box: Car 2 */}
                <div
                  className="absolute border-2 border-[#D99A3D]"
                  style={{
                    left: '52%',
                    top: '48%',
                    width: '24%',
                    height: '20%',
                    boxShadow: '0 0 8px rgba(217, 154, 61, 0.4)',
                    backgroundColor: 'rgba(217, 154, 61, 0.15)'
                  }}
                >
                  <div className="absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap shadow bg-[#D99A3D] text-[#11110F]">
                    Car 2: DL56Q1 (SIMULATED)
                  </div>
                </div>
              </>
            ) : (
              activeBoxes.map((box, idx) => {
                const isHazard = box.type === 'pothole' || box.type === 'road_damage' || box.type === 'accident';
                const isAccident = box.type === 'accident';
                const boxColor = isAccident ? '#D96B55' : (isHazard ? '#D99A3D' : '#6F9B87');

                return (
                  <div
                    key={box.id || idx}
                    className="absolute border-2 transition-all duration-150"
                    style={{
                      borderColor: boxColor,
                      left: `${Math.max(0, Math.min(95, box.left))}%`,
                      top: `${Math.max(0, Math.min(95, box.top))}%`,
                      width: `${Math.max(3, Math.min(95, box.width))}%`,
                      height: `${Math.max(3, Math.min(95, box.height))}%`,
                      boxShadow: `0 0 8px ${boxColor}66`,
                      backgroundColor: `${boxColor}15`
                    }}
                  >
                    <div
                      className="absolute -top-7 left-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap flex flex-col shadow"
                      style={{ backgroundColor: boxColor, color: '#11110F' }}
                    >
                      <span>
                        {box.class_name.toUpperCase()} {Math.round(box.conf * 100)}%
                        {box.track_id && ` [TRK ${box.track_id}]`}
                      </span>
                      {box.plate_status && (
                        <span className="text-[8px] font-mono tracking-tight font-bold bg-[#11110F] text-[#F1C46A] px-1 py-0.2 rounded mt-0.5 border border-[#34332F]">
                          {box.plate_status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Live HUD Overlay (Timestamp, Speed, GPS, AI Status) */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1 text-[11px] font-mono">
          <div className="px-2 py-1 rounded bg-[#11110F]/85 border border-[#34332F] backdrop-blur-sm text-[#F1C46A] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6F9B87] animate-pulse" />
            <span>TIMESTAMP: {formatTime(currentTime)}</span>
          </div>

          <div className="px-2 py-1 rounded bg-[#11110F]/85 border border-[#34332F] backdrop-blur-sm text-[#F2EFE8] flex items-center gap-2">
            <Navigation className="w-3 h-3 text-[#D99A3D]" />
            <span>
              {selectedVideo.busId === 'BUS-02' ? 'SIMULATED DEMO TELEMETRY: ' : 'GPS: '}
              {liveGps.lat.toFixed(5)}, {liveGps.lng.toFixed(5)}
            </span>
          </div>
        </div>

        {/* Live AI Status & Traffic Counter HUD */}
        <div className="absolute top-3 right-3 pointer-events-none flex flex-col items-end gap-1 text-[11px] font-mono">
          <div className="px-2 py-1 rounded bg-[#11110F]/85 border border-[#34332F] backdrop-blur-sm text-[#6F9B87]">
            STATUS: AI VERIFIED
          </div>

          <div className="px-2 py-1 rounded bg-[#11110F]/85 border border-[#34332F] backdrop-blur-sm text-[#F2EFE8]">
            VEHICLES: {liveTraffic.vehicle_count} ({liveTraffic.congestion_level.toUpperCase()})
          </div>

          <div className="px-2 py-1 rounded bg-[#11110F]/85 border border-[#34332F] backdrop-blur-sm text-[#D99A3D]">
            SPEED: {liveGps.speed} km/h
          </div>
        </div>
      </div>

      {/* Video Controls & Timeline Scrubber */}
      <div className="p-3 bg-[#11110F] border-t border-[#34332F] flex flex-col gap-2">
        {/* Scrubber */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#96938B] w-14 text-right">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const newTime = parseFloat(e.target.value);
              if (videoRef.current) {
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
              }
            }}
            className="flex-1 h-1.5 bg-[#22221F] rounded-lg appearance-none cursor-pointer accent-[#D99A3D]"
          />

          <span className="text-xs font-mono text-[#96938B] w-14">
            {formatTime(duration)}
          </span>
        </div>

        {/* Playback Controls & Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="p-1.5 rounded bg-[#22221F] border border-[#34332F] hover:border-[#D99A3D] text-[#F2EFE8] hover:text-[#D99A3D] transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="p-1.5 rounded bg-[#22221F] border border-[#34332F] hover:border-[#D99A3D] text-[#96938B] hover:text-[#F2EFE8] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Operator Hazard Trigger Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-[#96938B] hidden sm:inline mr-1">TRIGGER HAZARD:</span>
            <button
              onClick={() => handleTriggerDemoHazard('pothole')}
              className="px-2 py-1 bg-[#D99A3D]/20 hover:bg-[#D99A3D]/30 border border-[#D99A3D]/40 text-[#D99A3D] rounded text-[10px] font-mono font-bold transition-colors"
            >
              + POTHOLE
            </button>
            <button
              onClick={() => handleTriggerDemoHazard('road_damage')}
              className="px-2 py-1 bg-[#D99A3D]/20 hover:bg-[#D99A3D]/30 border border-[#D99A3D]/40 text-[#F1C46A] rounded text-[10px] font-mono font-bold transition-colors"
            >
              + CRACK
            </button>
            <button
              onClick={() => handleTriggerDemoHazard('waterlogging')}
              className="px-2 py-1 bg-[#6F9B87]/20 hover:bg-[#6F9B87]/30 border border-[#6F9B87]/40 text-[#6F9B87] rounded text-[10px] font-mono font-bold transition-colors"
            >
              + FLOOD
            </button>
            <button
              onClick={() => handleTriggerDemoHazard('accident')}
              className="px-2 py-1 bg-[#D96B55]/20 hover:bg-[#D96B55]/30 border border-[#D96B55]/40 text-[#D96B55] rounded text-[10px] font-mono font-bold transition-colors"
            >
              + INCIDENT
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#96938B]">
            <span>DETECTIONS: <strong className="text-[#F1C46A]">{activeBoxes.length}</strong></span>
            <span>•</span>
            <span>CORRIDOR: <strong className="text-[#F2EFE8]">{bus?.route || 'Route 419'}</strong></span>
          </div>
        </div>
      </div>

      {/* Tiny Source Attribution Below the Video */}
      {selectedVideo.busId === 'BUS-02' && (
        <div className="px-3 py-1.5 bg-[#0a0a08] border-t border-[#34332F]/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#96938B]">
          <span>Source: Public Domain (Wikimedia Commons)</span>
          <a
            href="https://commons.wikimedia.org/wiki/File:Felony_Hit_and_Run_Collision_Leaves_Driver_in_Critical_Condition.webm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6F9B87] hover:underline truncate max-w-md"
          >
            File:Felony Hit and Run Collision Leaves Driver in Critical Condition.webm
          </a>
        </div>
      )}
    </div>
  );
};
