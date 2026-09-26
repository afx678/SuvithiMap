import React, { useState } from 'react';
import { Incident } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { X, CheckCircle, MapPin, Eye, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';

interface IncidentPanelProps {
  incident: Incident | null;
  onClose: () => void;
  onIncidentResolved?: (updated: Incident) => void;
}

export const IncidentPanel: React.FC<IncidentPanelProps> = ({
  incident,
  onClose,
  onIncidentResolved
}) => {
  const [resolving, setResolving] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  if (!incident) return null;

  const handleResolve = async () => {
    try {
      setResolving(true);
      const res = await api.resolveIncident(incident.id, resolveNotes || 'Verified & repaired by municipal road crew');
      if (res.success && onIncidentResolved) {
        onIncidentResolved(res.incident);
      }
      setShowResolveForm(false);
    } catch (e) {
      console.error('Failed to resolve incident:', e);
    } finally {
      setResolving(false);
    }
  };

  const isResolved = incident.status === 'resolved';

  return (
    <div className="bg-[#191917] border border-[#34332F] rounded flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#34332F] flex items-center justify-between bg-[#11110F]/80">
        <div className="flex items-center gap-2">
          <StatusBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
        <button onClick={onClose} className="text-[#96938B] hover:text-[#F2EFE8]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <div>
          <h3 className="text-sm font-bold text-[#F2EFE8]">{incident.title}</h3>
          <p className="text-xs text-[#96938B] mt-1 flex items-center gap-1 font-mono">
            <MapPin className="w-3 h-3 text-[#D99A3D]" />
            <span>{incident.location_name || `Lat ${incident.latitude.toFixed(4)}, Lng ${incident.longitude.toFixed(4)}`}</span>
          </p>
        </div>

        {/* Evidence Card */}
        <div className="border border-[#34332F] rounded bg-[#11110F] overflow-hidden">
          <div className="p-2 border-b border-[#34332F] flex items-center justify-between text-[10px] font-mono text-[#96938B]">
            <span className="flex items-center gap-1 text-[#F1C46A]">
              <Eye className="w-3 h-3" />
              EVIDENCE DOSSIER
            </span>
            {incident.is_simulated && (
              <span className="px-1.5 py-0.5 bg-[#D99A3D]/20 text-[#D99A3D] rounded border border-[#D99A3D]/40 font-bold">
                SIMULATED EVIDENCE
              </span>
            )}
          </div>

          <div className="relative aspect-video w-full bg-[#1c1c1a] flex items-center justify-center overflow-hidden">
            <img
              src={incident.evidence_url || '/demo/images/pothole_evidence_sample.jpg'}
              alt="Road Hazard Evidence"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback SVG if image not found
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Municipal Metadata Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 bg-[#22221F] rounded border border-[#34332F]">
            <span className="text-[#96938B] text-[10px] block">FLEET SENSINGS</span>
            <span className="text-[#F1C46A] font-bold text-sm">{incident.detection_count} Passes</span>
          </div>

          <div className="p-2 bg-[#22221F] rounded border border-[#34332F]">
            <span className="text-[#96938B] text-[10px] block">DEPARTMENT</span>
            <span className="text-[#F2EFE8] text-[11px] truncate block">{incident.assigned_to || 'PWD South Zone'}</span>
          </div>

          <div className="p-2 bg-[#22221F] rounded border border-[#34332F] col-span-2">
            <span className="text-[#96938B] text-[10px] block">FIRST DETECTED</span>
            <span className="text-[#96938B] text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#D99A3D]" />
              {new Date(incident.first_detected_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#96938B] block mb-1">
            Telemetry Assessment
          </span>
          <p className="text-xs text-[#F2EFE8] leading-relaxed bg-[#22221F]/40 p-2.5 rounded border border-[#34332F]">
            {incident.description || 'Automated multi-modal detection by mobile sensing fleet. Verified across successive bus sweeps.'}
          </p>
        </div>

        {/* Resolution Notes if Resolved */}
        {isResolved && incident.resolution_notes && (
          <div className="p-2.5 rounded bg-[#6F9B87]/15 border border-[#6F9B87]/30 text-xs">
            <span className="text-[10px] font-mono uppercase font-bold text-[#6F9B87] block mb-0.5">
              Resolution Audit
            </span>
            <p className="text-[#F2EFE8] font-mono text-[11px]">{incident.resolution_notes}</p>
            <span className="text-[10px] text-[#96938B] mt-1 block font-mono">
              Resolved: {new Date(incident.resolved_at || '').toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Footer Action: Resolve Workflow */}
      <div className="p-4 border-t border-[#34332F] bg-[#11110F]">
        {!isResolved ? (
          showResolveForm ? (
            <div className="space-y-2">
              <textarea
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="Enter work order / repair notes..."
                className="w-full text-xs font-mono p-2 bg-[#191917] border border-[#34332F] rounded text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D]"
                rows={2}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleResolve}
                  disabled={resolving}
                  className="flex-1 py-1.5 px-3 bg-[#6F9B87] hover:bg-[#6F9B87]/90 text-[#11110F] text-xs font-mono font-bold rounded flex items-center justify-center gap-1 transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {resolving ? 'SAVING...' : 'CONFIRM RESOLVE'}
                </button>
                <button
                  onClick={() => setShowResolveForm(false)}
                  className="py-1.5 px-3 bg-[#22221F] border border-[#34332F] text-[#96938B] hover:text-[#F2EFE8] text-xs font-mono rounded"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowResolveForm(true)}
              className="w-full py-2 px-3 bg-[#D99A3D] hover:bg-[#F1C46A] text-[#11110F] text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              RESOLVE INCIDENT
            </button>
          )
        ) : (
          <div className="w-full py-2 px-3 bg-[#22221F] border border-[#6F9B87]/40 text-[#6F9B87] text-xs font-mono font-bold rounded flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            INCIDENT RESOLVED & CLOSED
          </div>
        )}
      </div>
    </div>
  );
};
