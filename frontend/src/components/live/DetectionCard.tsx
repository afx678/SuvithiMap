import React from 'react';
import { Detection } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Crosshair, Clock, MapPin } from 'lucide-react';

interface DetectionCardProps {
  detection: Detection;
}

export const DetectionCard: React.FC<DetectionCardProps> = ({ detection }) => {
  return (
    <div className="p-3 bg-[#191917] border border-[#34332F] rounded hover:border-[#D99A3D]/40 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-[#22221F] text-[#D99A3D]">
            <Crosshair className="w-3.5 h-3.5" />
          </span>
          <div>
            <h4 className="text-xs font-bold font-mono text-[#F2EFE8] capitalize">
              {detection.class_name.replace('_', ' ')}
            </h4>
            <span className="text-[10px] font-mono text-[#96938B]">
              Type: {detection.detection_type}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-bold text-[#F1C46A]">
            {(detection.confidence * 100).toFixed(0)}%
          </span>
          <div className="mt-0.5">
            <StatusBadge severity={detection.severity} />
          </div>
        </div>
      </div>

      {/* Metadata strip: Track ID and Number Plate status */}
      {(detection.track_id || detection.metadata?.plate_status || detection.metadata?.registration_number) && (
        <div className="mt-2 text-[10px] font-mono flex flex-wrap items-center gap-1.5 bg-[#11110F] p-1.5 rounded border border-[#34332F]">
          {detection.track_id && (
            <span className="text-[#F1C46A] bg-[#22221F] px-1 py-0.5 rounded">
              TRK #{detection.track_id}
            </span>
          )}
          {detection.metadata?.plate_status && (
            <span className="text-[#D99A3D] font-bold">
              {detection.metadata.plate_status}
            </span>
          )}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-[#34332F]/60 flex items-center justify-between text-[10px] font-mono text-[#96938B]">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#D99A3D]" />
          {detection.latitude.toFixed(4)}, {detection.longitude.toFixed(4)}
        </span>
        <span className="text-[#F1C46A] font-bold">
          {detection.bus_id}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[#96938B]" />
          {new Date(detection.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {detection.is_simulated && (
        <div className="mt-2 text-[9px] font-mono text-[#D99A3D] bg-[#D99A3D]/10 px-1.5 py-0.5 rounded border border-[#D99A3D]/20">
          SIMULATED EVIDENCE (DEMO INFERENCE)
        </div>
      )}
    </div>
  );
};
