import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Incident } from '../../types';

interface AlertToastProps {
  incident: Incident | null;
  onDismiss: () => void;
  onViewDetails: (id: string) => void;
}

export const AlertToast: React.FC<AlertToastProps> = ({ incident, onDismiss, onViewDetails }) => {
  if (!incident) return null;

  const isCritical = incident.severity === 'critical';

  return (
    <div className={`fixed top-16 right-6 z-50 max-w-sm w-full bg-[#191917] border ${isCritical ? 'border-[#D96B55]' : 'border-[#D99A3D]'} rounded shadow-2xl p-4 transition-all animate-bounce`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded ${isCritical ? 'bg-[#D96B55]/20 text-[#D96B55]' : 'bg-[#D99A3D]/20 text-[#D99A3D]'}`}>
          <AlertCircle className="w-5 h-5" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${isCritical ? 'text-[#D96B55]' : 'text-[#D99A3D]'}`}>
              NEW {incident.severity} HAZARD
            </span>
            <button onClick={onDismiss} className="text-[#96938B] hover:text-[#F2EFE8]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-[#F2EFE8] mt-1">{incident.title}</h4>
          <p className="text-[11px] text-[#96938B] mt-1 line-clamp-2">
            {incident.description || incident.location_name}
          </p>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#F1C46A]">
              Lat: {incident.latitude.toFixed(4)}, Lng: {incident.longitude.toFixed(4)}
            </span>
            <button
              onClick={() => onViewDetails(incident.id)}
              className="text-xs font-mono font-medium px-2 py-1 bg-[#22221F] border border-[#34332F] hover:border-[#D99A3D] text-[#D99A3D] rounded transition-colors"
            >
              INVESTIGATE →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
