import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { Car, Flame, Gauge, Clock, Users, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const Traffic: React.FC = () => {
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const data = await api.getAnalyticsCharts();
        setCharts(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTraffic();
  }, []);

  const corridorData = charts?.corridor_density || [
    { corridor: 'CP - AIIMS', density: 84, avgSpeed: 16.5, congestion: 'Heavy' },
    { corridor: 'Ring Rd (Mehrauli)', density: 68, avgSpeed: 22.0, congestion: 'Moderate' },
    { corridor: 'Aerocity Express', density: 42, avgSpeed: 38.0, congestion: 'Low' },
    { corridor: 'Outer Ring Feeder', density: 58, avgSpeed: 28.5, congestion: 'Moderate' },
    { corridor: 'Dwarka Expressway', density: 35, avgSpeed: 45.0, congestion: 'Low' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">TRAFFIC MOBILITY & CONGESTION</h1>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Optical Vehicle Counting, ByteTrack Trajectory Auditing & Moving Speed Bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#191917] border border-[#34332F] rounded text-xs font-mono">
          <span className="text-[#96938B]">PEAK BOTTLENECK:</span>
          <span className="text-[#D96B55] font-bold">CP - AIIMS (16.5 km/h)</span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Corridors"
          value="5 Major"
          subtitle="All fleet routes sensed"
          icon={Car}
          accentColor="#6F9B87"
        />
        <MetricCard
          title="Active Congestion Points"
          value="3 Critical"
          subtitle="Speed drop &gt; 50%"
          icon={Flame}
          accentColor="#D96B55"
        />
        <MetricCard
          title="Fleet Mean Velocity"
          value="26.8 km/h"
          subtitle="Target: 35 km/h"
          icon={Gauge}
          accentColor="#D99A3D"
        />
        <MetricCard
          title="Vehicles Sensed / hr"
          value="4,280"
          subtitle="Cars, Buses, 2-Wheelers"
          icon={Users}
          accentColor="#F1C46A"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Comparison by Corridor */}
        <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8]">
            Corridor Average Speeds (km/h)
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#34332F" />
                <XAxis type="number" stroke="#96938B" domain={[0, 60]} />
                <YAxis dataKey="corridor" type="category" stroke="#96938B" width={110} tick={{ fontSize: 10, fill: '#F2EFE8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11110F', borderColor: '#34332F', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#F2EFE8' }}
                />
                <Bar dataKey="avgSpeed" fill="#D99A3D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Corridor Density Scores */}
        <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8]">
            Vehicle Density Score (0 - 100)
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34332F" />
                <XAxis dataKey="corridor" stroke="#96938B" tick={{ fontSize: 9, fill: '#F2EFE8' }} />
                <YAxis stroke="#96938B" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11110F', borderColor: '#34332F', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#F2EFE8' }}
                />
                <Bar dataKey="density" fill="#D96B55" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
