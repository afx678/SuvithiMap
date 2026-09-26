import React, { useState, useEffect } from 'react';
import { Bus } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/common/StatusBadge';
import { Bus as BusIcon, Radio, Video, Navigation, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Fleet: React.FC = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchFleet = async () => {
      try {
        const data = await api.getBuses();
        setBuses(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFleet();
    const interval = setInterval(fetchFleet, 2500);
    return () => clearInterval(interval);
  }, []);

  const filtered = buses.filter(b => {
    const matchSearch = b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">FLEET SENSING UNITS</h1>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            {buses.length} Mobile Urban Intelligence Units Transmitting Telemetry & Optical Streams
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#96938B]" />
            <input
              type="text"
              placeholder="Search bus, route, plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D] w-64"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 bg-[#191917] border border-[#34332F] rounded text-xs font-mono text-[#F2EFE8] focus:outline-none focus:border-[#D99A3D]"
          >
            <option value="all">ALL STATUSES</option>
            <option value="active">ACTIVE</option>
            <option value="maintenance">MAINTENANCE</option>
            <option value="idle">IDLE</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-[#191917] border border-[#34332F] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#11110F] text-[#96938B] border-b border-[#34332F] uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Unit ID</th>
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Transit Route</th>
                <th className="py-3 px-4">Current GPS</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Camera</th>
                <th className="py-3 px-4">GPS Lock</th>
                <th className="py-3 px-4">Unit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34332F]/60 text-[#F2EFE8]">
              {filtered.map((bus) => (
                <tr key={bus.id} className="hover:bg-[#22221F] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#F1C46A] flex items-center gap-2">
                    <BusIcon className="w-4 h-4 text-[#D99A3D]" />
                    <span>{bus.id}</span>
                  </td>
                  <td className="py-3 px-4 text-[#96938B]">{bus.bus_number}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{bus.route}</td>
                  <td className="py-3 px-4 text-[#96938B]">
                    {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={bus.speed < 15 ? 'text-[#D96B55] font-bold' : 'text-[#6F9B87]'}>
                      {bus.speed} km/h
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-[#6F9B87]">
                      <Video className="w-3.5 h-3.5" />
                      {bus.camera_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1.5 text-[#6F9B87]">
                      <Navigation className="w-3.5 h-3.5" />
                      {bus.gps_status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={bus.status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/live-bus?busId=${bus.id}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#22221F] border border-[#34332F] hover:border-[#D99A3D] text-[#D99A3D] text-[11px] transition-colors"
                    >
                      <Radio className="w-3 h-3" />
                      <span>LIVE HUD</span>
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
