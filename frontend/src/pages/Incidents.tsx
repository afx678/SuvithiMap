import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { AlertTriangle, Search, Filter, Eye, Clock, MapPin, ChevronRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Incidents: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const fetchIncidents = async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = incidents.filter(inc => {
    const matchesSearch = inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (inc.location_name && inc.location_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          inc.incident_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inc.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSeverity = severityFilter === 'all' || inc.severity.toLowerCase() === severityFilter.toLowerCase();
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">INCIDENT COMMAND CENTER</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#D96B55]/20 text-[#D96B55] border border-[#D96B55]/30">
              {incidents.filter(i => i.status !== 'resolved').length} UNRESOLVED
            </span>
          </div>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Persistent Road Damage, Pothole Clusters & Municipal Action Orders
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#96938B]" />
            <input
              type="text"
              placeholder="Search incidents, locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D] w-56"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="py-1.5 px-3 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D]"
          >
            <option value="all">ALL SEVERITIES</option>
            <option value="critical">CRITICAL</option>
            <option value="high">HIGH</option>
            <option value="medium">MEDIUM</option>
            <option value="low">LOW</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D]"
          >
            <option value="all">ALL STATUSES</option>
            <option value="open">OPEN</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="resolved">RESOLVED</option>
          </select>
        </div>
      </div>

      {/* Incident List Table */}
      <div className="bg-[#191917] border border-[#34332F] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#11110F] text-[#96938B] border-b border-[#34332F] uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Incident Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location / Coordinates</th>
                <th className="py-3 px-4">Fleet Passes</th>
                <th className="py-3 px-4">Assigned Authority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Dossier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34332F]/60 text-[#F2EFE8]">
              {filtered.map((inc) => (
                <tr key={inc.id} className="hover:bg-[#22221F] transition-colors">
                  <td className="py-3 px-4">
                    <StatusBadge severity={inc.severity} />
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <div className="font-bold text-[#F2EFE8] truncate">{inc.title}</div>
                    <div className="text-[11px] text-[#96938B] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(inc.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4 uppercase text-[#F1C46A]">{inc.incident_type.replace('_', ' ')}</td>
                  <td className="py-3 px-4 text-[#96938B]">
                    <div className="text-[#F2EFE8] truncate max-w-xs">{inc.location_name || 'Delhi Corridor'}</div>
                    <div className="text-[10px] text-[#96938B]">
                      {inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#22221F] border border-[#34332F] text-[#D99A3D] font-bold">
                      {inc.detection_count}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#96938B]">{inc.assigned_to || 'PWD South'}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={inc.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/incidents/${inc.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#22221F] hover:bg-[#34332F] border border-[#34332F] hover:border-[#D99A3D] text-[#D99A3D] text-xs font-mono rounded transition-colors"
                    >
                      <span>INSPECT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
