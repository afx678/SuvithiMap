import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MetricCard } from '../components/common/MetricCard';
import { Construction, AlertTriangle, ShieldCheck, Activity, Layers } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

export const RoadCondition: React.FC = () => {
  const [charts, setCharts] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await api.getAnalyticsCharts();
        setCharts(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAnalytics();
  }, []);

  const hazardData = charts?.hazard_breakdown || [
    { name: 'Potholes', value: 38, color: '#D96B55' },
    { name: 'Alligator Cracks', value: 24, color: '#D99A3D' },
    { name: 'Waterlogging', value: 20, color: '#F1C46A' },
    { name: 'Longitudinal Cracks', value: 12, color: '#6F9B87' },
    { name: 'Missing Signs', value: 6, color: '#96938B' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#34332F] pb-4">
        <div>
          <h1 className="text-xl font-bold font-mono text-[#F2EFE8]">ROAD CONDITION & PAVEMENT QUALITY</h1>
          <p className="text-xs text-[#96938B] mt-1 font-mono">
            Autonomous Structural Defect Classification, Cracking Severity & Pavement Condition Index (PCI)
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#191917] border border-[#34332F] rounded text-xs font-mono">
          <span className="text-[#96938B]">CITYWIDE PCI:</span>
          <span className="text-[#6F9B87] font-bold text-sm">79 / 100</span>
          <span className="text-[#96938B]">(FAIR-GOOD)</span>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Potholes Identified"
          value="48 Active"
          subtitle="Avg depth: 11.4 cm"
          icon={AlertTriangle}
          accentColor="#D96B55"
        />
        <MetricCard
          title="Base Fatigue Cracking"
          value="34 Sites"
          subtitle="Alligator & Block Cracks"
          icon={Construction}
          accentColor="#D99A3D"
        />
        <MetricCard
          title="Surfaced Area Audited"
          value="142 km"
          subtitle="100% bus routes covered"
          icon={Layers}
          accentColor="#6F9B87"
        />
        <MetricCard
          title="Repairs Completed"
          value="18 This Week"
          subtitle="Avg resolution: 14.2 hrs"
          icon={ShieldCheck}
          accentColor="#F1C46A"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Road Hazard Distribution */}
        <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8]">
              Defect Distribution By Classification
            </h3>
            <span className="text-[10px] font-mono text-[#96938B]">AI LABELED</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hazardData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hazardData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#11110F', borderColor: '#34332F', borderRadius: '4px', fontFamily: 'monospace', fontSize: '11px' }}
                  itemStyle={{ color: '#F2EFE8' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            {hazardData.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#96938B] truncate">{item.name}:</span>
                <span className="text-[#F2EFE8] font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pavement Distress Standard Breakdown */}
        <div className="bg-[#191917] border border-[#34332F] rounded p-5 space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F2EFE8]">
            Standard Pavement Distress Categories (ASTM D6433)
          </h3>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-[#11110F] border border-[#34332F] rounded">
              <div className="flex justify-between items-center text-[#D96B55] font-bold">
                <span>POTHOLE / CRATER DEFECTS</span>
                <span>CRITICAL</span>
              </div>
              <p className="text-[11px] text-[#96938B] mt-1">
                Depressions in road surface &gt; 25mm deep. High hazard for two-wheelers and suspension systems.
              </p>
            </div>

            <div className="p-3 bg-[#11110F] border border-[#34332F] rounded">
              <div className="flex justify-between items-center text-[#D99A3D] font-bold">
                <span>ALLIGATOR / FATIGUE CRACKING</span>
                <span>HIGH SEVERITY</span>
              </div>
              <p className="text-[11px] text-[#96938B] mt-1">
                Interconnected polygon cracks resembling alligator skin. Indicates foundational subgrade failure under repeated bus axle loads.
              </p>
            </div>

            <div className="p-3 bg-[#11110F] border border-[#34332F] rounded">
              <div className="flex justify-between items-center text-[#6F9B87] font-bold">
                <span>LONGITUDINAL & TRANSVERSE CRACKS</span>
                <span>MEDIUM / MONITOR</span>
              </div>
              <p className="text-[11px] text-[#96938B] mt-1">
                Parallel or perpendicular joint cracks. Can be sealed with bituminous mastic before water penetration occurs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
