import React, { useState } from 'react';
import { Eye, ShieldCheck, MapPin, Clock, FileCheck2, Filter } from 'lucide-react';

interface EvidenceItem {
  id: string;
  title: string;
  type: string;
  busId: string;
  location: string;
  lat: number;
  lng: number;
  timestamp: string;
  confidence: number;
  imageUrl: string;
  isSimulated: boolean;
  notes: string;
  source?: string;
  sourceUrl?: string;
}

const SAMPLE_EVIDENCE: EvidenceItem[] = [
  {
    id: 'EVD-901',
    title: 'Severe Pothole Crater (0.4m depth)',
    type: 'pothole',
    busId: 'DL-101',
    location: 'Lajpat Nagar Underpass Outer Ring Road',
    lat: 28.5728,
    lng: 77.2390,
    timestamp: '2026-09-13T10:15:00Z',
    confidence: 0.94,
    imageUrl: '/demo/images/pothole_evidence_sample.jpg',
    isSimulated: true,
    notes: 'Three consecutive bus passes confirmed high-risk depression in active bus lane.'
  },
  {
    id: 'EVD-902',
    title: 'Fatigue Alligator Cracking Network',
    type: 'road_damage',
    busId: 'DL-201',
    location: 'Aurobindo Marg near INA Market',
    lat: 28.5834,
    lng: 77.2104,
    timestamp: '2026-09-13T11:20:00Z',
    confidence: 0.88,
    imageUrl: '/demo/images/road_crack_sample.jpg',
    isSimulated: true,
    notes: 'Base subgrade fatigue observed. Bituminous layer disintegration spanning 14 meters.'
  },
  {
    id: 'EVD-903',
    title: 'Subway Flash Flood Waterlogging (18cm)',
    type: 'waterlogging',
    busId: 'DL-301',
    location: 'Dhaula Kuan Subway Slip Road',
    lat: 28.5689,
    lng: 77.1610,
    timestamp: '2026-09-13T11:45:00Z',
    confidence: 0.94,
    imageUrl: '/demo/images/waterlogging_sample.jpg',
    isSimulated: true,
    notes: 'Standing water ponding covering 2 lanes. Vehicle velocity throttled below 10 km/h.',
    source: 'The Hindu: Madurai Water-logging',
    sourceUrl: 'https://www.thehindu.com/news/cities/Madurai/water-logging-brings-vehicular-movement-to-grinding-halt-on-city-roads/article70034723.ece'
  },
  {
    id: 'EVD-904',
    title: 'Confirmed Missing Regulatory Stop Sign',
    type: 'traffic_sign',
    busId: 'DL-101',
    location: 'Patel Chowk Intersection',
    lat: 28.6135,
    lng: 77.2085,
    timestamp: '2026-09-13T09:10:00Z',
    confidence: 0.92,
    imageUrl: '/demo/images/missing_sign_sample.jpg',
    isSimulated: true,
    notes: 'Comparative baseline audit: Required sign absent during 4 scheduled passes.',
    source: 'Reddit: r/bangalore Dashcam',
    sourceUrl: 'https://www.reddit.com/r/bangalore/comments/1sjnphq/dashcam_is_a_necessity_is_bangalore/'
  },
  {
    id: 'EVD-905',
    title: 'High Vehicle Density Corridor Bottleneck',
    type: 'vehicle',
    busId: 'DL-202',
    location: 'Pragati Maidan Ring Road Stretch',
    lat: 28.6189,
    lng: 77.2450,
    timestamp: '2026-09-13T12:05:00Z',
    confidence: 0.95,
    imageUrl: '/demo/images/vehicle_traffic_sample.jpg',
    isSimulated: true,
    notes: 'ByteTrack stream registered 48 dynamic vehicles within 100m forward range.'
  }
];

export const Evidence: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = SAMPLE_EVIDENCE.filter(item => {
    return typeFilter === 'all' || item.type === typeFilter;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">EVIDENCE VAULT & VERIFICATION</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#6F9B87]/20 text-[#6F9B87] border border-[#6F9B87]/30">
              AUDITED
            </span>
          </div>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Optical Frame Captures, Telemetry Timestamps & Synthetic Simulation Records
          </p>
        </div>

        {/* Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="py-1.5 px-3 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D]"
        >
          <option value="all">ALL EVIDENCE TYPES</option>
          <option value="pothole">POTHOLES</option>
          <option value="road_damage">ROAD CRACKS</option>
          <option value="waterlogging">WATERLOGGING</option>
          <option value="traffic_sign">TRAFFIC SIGNS</option>
          <option value="vehicle">VEHICLE DENSITY</option>
        </select>
      </div>

      {/* Grid of Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-[#191917] border border-[#34332F] rounded overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 bg-[#11110F] border-b border-[#34332F] flex items-center justify-between text-xs font-mono">
              <span className="text-[#F1C46A] font-bold">UNIT {item.busId}</span>
              {item.isSimulated ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D99A3D]/20 text-[#D99A3D] border border-[#D99A3D]/40">
                  SIMULATED EVIDENCE
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#6F9B87]/20 text-[#6F9B87]">
                  LIVE CAMERA CAPTURE
                </span>
              )}
            </div>

            {/* Image Frame */}
            <div className="relative aspect-video w-full bg-[#11110F] flex items-center justify-center border-b border-[#34332F]">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#D99A3D] font-bold">
                    {item.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-[#6F9B87] font-bold">
                    {(item.confidence * 100).toFixed(0)}% CONFIDENCE
                  </span>
                </div>

                <h3 className="text-xs font-bold text-[#F2EFE8] mt-1">{item.title}</h3>
                <p className="text-[11px] text-[#96938B] mt-2 leading-relaxed">
                  {item.notes}
                </p>
              </div>

              <div className="pt-3 border-t border-[#34332F]/60 text-[10px] font-mono text-[#96938B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#D99A3D]" />
                    {item.location}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#96938B]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <span className="text-[#F1C46A]">{item.lat.toFixed(4)}, {item.lng.toFixed(4)}</span>
                </div>
                {item.sourceUrl && (
                  <div className="flex items-center justify-between text-[#96938B] pt-1.5 border-t border-[#34332F]/40">
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-[#6F9B87]" />
                      SOURCE:
                    </span>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#6F9B87] hover:underline underline-offset-2 truncate max-w-[210px]"
                      title={item.sourceUrl}
                    >
                      {item.source || item.sourceUrl}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
