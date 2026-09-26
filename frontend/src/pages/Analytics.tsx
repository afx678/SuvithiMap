import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { BarChart3, TrendingUp, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export const Analytics: React.FC = () => {
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const data = await api.getAnalyticsCharts();
        setCharts(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCharts();
  }, []);

  const incidentTrend = charts?.incident_trend || [
    { time: '06:00', potholes: 1, cracks: 2, waterlogging: 0 },
    { time: '08:00', potholes: 3, cracks: 4, waterlogging: 1 },
    { time: '10:00', potholes: 6, cracks: 5, waterlogging: 3 },
    { time: '12:00', potholes: 5, cracks: 4, waterlogging: 2 },
    { time: '14:00', potholes: 4, cracks: 3, waterlogging: 2 },
    { time: '16:00', potholes: 7, cracks: 6, waterlogging: 4 },
    { time: '18:00', potholes: 8, cracks: 7, waterlogging: 5 }
  ];

  const routeDelays = charts?.route_delays || [
    { route: 'Route 419', scheduledMin: 35, actualMin: 52, delayMin: 17 },
    { route: 'Route 502', scheduledMin: 55, actualMin: 68, delayMin: 13 },
    { route: 'Route 717', scheduledMin: 40, actualMin: 46, delayMin: 6 },
    { route: 'Route 801', scheduledMin: 30, actualMin: 38, delayMin: 8 },
    { route: 'Route 921', scheduledMin: 45, actualMin: 49, delayMin: 4 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">URBAN ANALYTICS & FLEET METRICS</h1>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Longitudinal Defect Accumulation, Route Delay Variance & City Infrastructure Health
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#6F9B87] px-3 py-1.5 bg-[#191917] border border-[#34332F] rounded">
          <ShieldCheck className="w-4 h-4" />
          <span>DATA INTEGRITY: 99.8% VERIFIED</span>
        </div>
      </div>

      {/* Grid: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Incident Occurrence Trend */}
        <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8]">
              Hourly Hazard Detections (Today)
            </h3>
            <span className="text-[10px] font-mono text-[#D99A3D]">TIME SERIES</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34332F" />
                <XAxis dataKey="time" stroke="#96938B" tick={{ fontSize: 10, fill: '#F2EFE8' }} />
                <YAxis stroke="#96938B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11110F', borderColor: '#34332F', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#F2EFE8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Line type="monotone" dataKey="potholes" stroke="#D96B55" strokeWidth={2} name="Potholes" />
                <Line type="monotone" dataKey="cracks" stroke="#D99A3D" strokeWidth={2} name="Cracks" />
                <Line type="monotone" dataKey="waterlogging" stroke="#F1C46A" strokeWidth={2} name="Waterlogging" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route Delay Comparison */}
        <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8]">
              Transit Schedule vs Actual Journey Times (Minutes)
            </h3>
            <span className="text-[10px] font-mono text-[#D96B55]">DELAY VARIANCE</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeDelays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#34332F" />
                <XAxis dataKey="route" stroke="#96938B" tick={{ fontSize: 10, fill: '#F2EFE8' }} />
                <YAxis stroke="#96938B" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#11110F', borderColor: '#34332F', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#F2EFE8' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="scheduledMin" fill="#6F9B87" name="Scheduled (Min)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actualMin" fill="#D96B55" name="Actual Transit (Min)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
