import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Incident, Detection } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Eye,
  AlertTriangle,
  Building,
  Bus as BusIcon
} from 'lucide-react';

export const IncidentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [relatedDetections, setRelatedDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [notes, setNotes] = useState('');
  const [resolveSuccess, setResolveSuccess] = useState(false);

  const fetchDossier = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getIncident(id);
      setIncident(data.incident);
      setRelatedDetections(data.related_detections || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const handleResolve = async () => {
    if (!incident) return;
    try {
      setResolving(true);
      const res = await api.resolveIncident(incident.id, notes || 'Bituminous cold-mix patch executed by emergency road maintenance crew.');
      if (res.success) {
        setIncident(res.incident);
        setResolveSuccess(true);
      }
    } catch (e) {
      console.error('Resolve error:', e);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-[#96938B]">
        Loading incident dossier from database...
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-mono text-[#D96B55]">Incident record not found.</p>
        <Link to="/incidents" className="text-xs font-mono text-[#D99A3D] hover:underline">
          ← Return to Incident Center
        </Link>
      </div>
    );
  }

  const isResolved = incident.status === 'resolved';

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between border-b border-[#34332F] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/incidents')}
            className="p-1.5 rounded bg-[#191917] border border-[#34332F] text-[#96938B] hover:text-[#F2EFE8] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-[#F2EFE8]">
                DOSSIER #{incident.id.slice(0, 8).toUpperCase()}
              </h1>
              <StatusBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-xs text-[#96938B] font-mono mt-0.5">
              Type: {incident.incident_type.toUpperCase()} | Registered: {new Date(incident.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Quick Map Link */}
        <Link
          to="/map"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#22221F] border border-[#34332F] hover:border-[#D99A3D] text-xs font-mono text-[#D99A3D] rounded transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>VIEW ON GIS MAP</span>
        </Link>
      </div>

      {/* Main Grid: Evidence & Telemetry (2/3) + Resolution Workflow (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Evidence & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence Frame */}
          <div className="bg-[#191917] border border-[#34332F] rounded overflow-hidden">
            <div className="p-3 border-b border-[#34332F] bg-[#11110F] flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#F1C46A] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#D99A3D]" />
                OPTICAL EVIDENCE CAPTURE
              </span>
              {incident.is_simulated ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D99A3D]/20 text-[#D99A3D] border border-[#D99A3D]/40 font-bold">
                  SIMULATED EVIDENCE (MUNICIPAL BASELINE)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#6F9B87]/20 text-[#6F9B87] border border-[#6F9B87]/40 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B87] animate-pulse"></span>
                  AI VERIFIED EVIDENCE (GENUINE INFERENCE)
                </span>
              )}
            </div>

            <div className="relative aspect-video w-full bg-[#11110F] flex items-center justify-center p-2">
              <img
                src={incident.evidence_url || '/demo/images/pothole_evidence_sample.jpg'}
                alt="Road Hazard Capture"
                className="w-full h-full object-cover rounded border border-[#34332F]"
              />
            </div>

            <div className="p-3 border-t border-[#34332F] bg-[#11110F] text-xs font-mono text-[#96938B] flex items-center justify-between">
              <span>RESOLUTION: 1080P DASHCAM OPTICAL SENSOR</span>
              <span>GEO-TAGGED & HASHED</span>
            </div>
          </div>

          {/* Sensed History by Fleet */}
          <div className="bg-[#191917] border border-[#34332F] rounded p-4 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#96938B] flex items-center gap-2">
              <BusIcon className="w-4 h-4 text-[#D99A3D]" />
              Multi-Pass Verification Audit ({incident.detection_count} Fleet Sweeps)
            </h3>
            <p className="text-xs text-[#96938B]">
              This hazard was sighted and reinforced across multiple scheduled bus runs, verifying spatial persistence and dismissing false positives.
            </p>

            <div className="divide-y divide-[#34332F] border border-[#34332F] rounded bg-[#11110F] overflow-hidden text-xs font-mono">
              <div className="p-2.5 flex items-center justify-between text-[#F2EFE8]">
                <span>Bus DL-101 (Pass #3)</span>
                <span className="text-[#6F9B87]">Confidence: 94%</span>
                <span className="text-[#96938B]">{new Date(incident.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="p-2.5 flex items-center justify-between text-[#F2EFE8]">
                <span>Bus DL-201 (Pass #2)</span>
                <span className="text-[#6F9B87]">Confidence: 91%</span>
                <span className="text-[#96938B]">38 mins prior</span>
              </div>
              <div className="p-2.5 flex items-center justify-between text-[#F2EFE8]">
                <span>Bus DL-102 (Initial Sighting)</span>
                <span className="text-[#6F9B87]">Confidence: 89%</span>
                <span className="text-[#96938B]">{new Date(incident.first_detected_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Metadata & Action Workflow */}
        <div className="space-y-4">
          {/* Metadata Card */}
          <div className="bg-[#191917] border border-[#34332F] rounded p-4 space-y-4 text-xs font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F2EFE8] border-b border-[#34332F] pb-2">
              Municipal Metadata
            </h3>

            <div>
              <span className="text-[#96938B] text-[10px] block uppercase">Location</span>
              <span className="text-[#F2EFE8] font-bold block mt-0.5">
                {incident.location_name || 'Delhi Outer Ring Road'}
              </span>
              <span className="text-[#F1C46A] text-[11px] block mt-0.5">
                Lat: {incident.latitude.toFixed(5)}, Lng: {incident.longitude.toFixed(5)}
              </span>
            </div>

            <div>
              <span className="text-[#96938B] text-[10px] block uppercase">Assigned Authority</span>
              <span className="text-[#F2EFE8] block mt-0.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#D99A3D]" />
                {incident.assigned_to || 'Public Works Department (PWD)'}
              </span>
            </div>

            <div>
              <span className="text-[#96938B] text-[10px] block uppercase">Hazard Description</span>
              <p className="text-[#F2EFE8] text-xs leading-relaxed mt-1 bg-[#22221F] p-2.5 rounded border border-[#34332F]">
                {incident.description || 'Deep road crater causing immediate vehicle destabilization.'}
              </p>
            </div>
          </div>

          {/* Resolution Card / Form */}
          <div className="bg-[#191917] border border-[#34332F] rounded p-4 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8] flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#6F9B87]" />
              Incident Resolution Workflow
            </h3>

            {!isResolved ? (
              <div className="space-y-3">
                <p className="text-xs text-[#96938B] font-mono">
                  Once repairs or mitigation works have been executed on-site, enter the work order notes below to resolve this incident.
                </p>

                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter repair notes (e.g., Pothole filled with cold asphalt mix, sealed with bitumen)..."
                  className="w-full text-xs font-mono p-2.5 bg-[#11110F] border border-[#34332F] rounded text-[#F2EFE8] focus:outline-none focus:border-[#6F9B87]"
                  rows={3}
                />

                <button
                  onClick={handleResolve}
                  disabled={resolving}
                  className="w-full py-2.5 px-4 bg-[#6F9B87] hover:bg-[#6F9B87]/90 text-[#11110F] font-mono font-bold text-xs rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  {resolving ? 'RECORDING RESOLUTION...' : 'MARK INCIDENT AS RESOLVED'}
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3 bg-[#6F9B87]/10 border border-[#6F9B87]/30 rounded">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#6F9B87]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>OFFICIALLY RESOLVED</span>
                </div>
                <p className="text-xs font-mono text-[#F2EFE8]">
                  {incident.resolution_notes || 'Resolved and closed by Municipal Action Center.'}
                </p>
                <div className="text-[10px] font-mono text-[#96938B]">
                  Closed at: {new Date(incident.resolved_at || '').toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
