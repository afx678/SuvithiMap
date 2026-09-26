import React from 'react';

interface StatusBadgeProps {
  status?: string;
  severity?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, severity, className = '' }) => {
  // Severity styling
  if (severity) {
    const s = severity.toLowerCase();
    switch (s) {
      case 'critical':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#D96B55]/15 text-[#D96B55] border border-[#D96B55]/30 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D96B55] mr-1.5 animate-pulse" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#D99A3D]/15 text-[#D99A3D] border border-[#D99A3D]/30 ${className}`}>
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#F1C46A]/15 text-[#F1C46A] border border-[#F1C46A]/30 ${className}`}>
            MEDIUM
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#96938B]/15 text-[#96938B] border border-[#96938B]/30 ${className}`}>
            LOW
          </span>
        );
    }
  }

  // Lifecycle status styling
  if (status) {
    const st = status.toLowerCase();
    switch (st) {
      case 'resolved':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#6F9B87]/15 text-[#6F9B87] border border-[#6F9B87]/30 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B87] mr-1.5" />
            RESOLVED
          </span>
        );
      case 'in_progress':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#F1C46A]/15 text-[#F1C46A] border border-[#F1C46A]/30 ${className}`}>
            IN PROGRESS
          </span>
        );
      case 'active':
      case 'online':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#6F9B87]/15 text-[#6F9B87] border border-[#6F9B87]/30 ${className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B87] mr-1.5" />
            ONLINE
          </span>
        );
      case 'congested':
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#D99A3D]/15 text-[#D99A3D] border border-[#D99A3D]/30 ${className}`}>
            CONGESTED
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-[#D96B55]/15 text-[#D96B55] border border-[#D96B55]/30 ${className}`}>
            OPEN
          </span>
        );
    }
  }

  return null;
};
