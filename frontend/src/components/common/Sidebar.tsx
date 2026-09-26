import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Radio,
  MapPin,
  AlertTriangle,
  Construction,
  Car,
  BarChart3,
  FileCheck2,
  Sliders,
  Settings,
  ShieldAlert
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Fleet Inventory', path: '/fleet', icon: Bus },
  { name: 'Live Bus Sensing', path: '/live-bus', icon: Radio },
  { name: 'GIS Command Map', path: '/map', icon: MapPin },
  { name: 'Incident Center', path: '/incidents', icon: AlertTriangle },
  { name: 'Road Condition', path: '/road-condition', icon: Construction },
  { name: 'Traffic Mobility', path: '/traffic', icon: Car },
  { name: 'Urban Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Evidence Vault', path: '/evidence', icon: FileCheck2 },
  { name: 'Simulation Sandbox', path: '/simulation', icon: Sliders },
  { name: 'System Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-[#191917] border-r border-[#34332F] flex flex-col h-screen select-none shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#34332F]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#22221F] border border-[#D99A3D]/40 flex items-center justify-center text-[#D99A3D]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider font-mono text-[#F2EFE8]">SuVithiMap</h1>
            <p className="text-[10px] text-[#D99A3D] font-mono tracking-tight font-medium">MOBILITY URBAN INTELLIGENCE</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#96938B]">
          Operations & Control
        </div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#22221F] text-[#F1C46A] border-l-2 border-[#D99A3D] font-mono'
                  : 'text-[#96938B] hover:text-[#F2EFE8] hover:bg-[#22221F]/60'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* Footer Tagline & Status */}
      <div className="p-4 border-t border-[#34332F] bg-[#11110F]/60">
        <p className="text-[11px] text-[#96938B] italic leading-tight">
          “Mapping Every Journey. Understanding Every Street.”
        </p>
        <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-[#96938B]">
          <span>SIH26124 PROTOTYPE</span>
          <span className="flex items-center gap-1 text-[#6F9B87]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F9B87] animate-pulse" />
            ONLINE
          </span>
        </div>
      </div>
    </aside>
  );
};
