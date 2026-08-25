import React from 'react';
import {
  Home,
  LineChart,
  Map as MapIcon,
  AlertTriangle,
  Settings as SettingsIcon,
  HelpCircle,
  ShieldCheck,
  Plus,
  Bot,
  Wind,
  Sprout,
  BarChart3,
} from 'lucide-react';

export type ActiveTab = 'home' | 'forecast' | 'map' | 'alerts' | 'cyclone' | 'farming' | 'climate' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewChat: () => void;
  onOpenHelp: () => void;
  onOpenPrivacy: () => void;
  alertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNewChat,
  onOpenHelp,
  onOpenPrivacy,
  alertCount,
}) => {
  const navItems = [
    { id: 'home' as ActiveTab, label: 'Home', icon: Home },
    { id: 'forecast' as ActiveTab, label: 'Forecast', icon: LineChart },
    { id: 'map' as ActiveTab, label: 'Map', icon: MapIcon },
    { id: 'alerts' as ActiveTab, label: 'Alerts', icon: AlertTriangle, badge: alertCount > 0 ? alertCount : undefined },
    { id: 'cyclone' as ActiveTab, label: 'Cyclone', icon: Wind },
    { id: 'farming' as ActiveTab, label: 'Farming', icon: Sprout },
    { id: 'climate' as ActiveTab, label: 'Climate', icon: BarChart3 },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col z-40 pt-20 hidden lg:flex select-none">
      {/* AI Monitoring Status */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/15 flex items-center justify-center relative">
          <Bot className="w-4 h-4 text-white" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em] font-medium text-white">WeatherGPT Core</h2>
          <p className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5 mt-0.5">
            NODE-ACTIVE <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </p>
        </div>
      </div>

      {/* Nav Menu & Actions */}
      <div className="p-4 flex-1 flex flex-col gap-1.5 overflow-y-auto">
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3.5 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white rounded-xl mb-4 flex items-center justify-center gap-2 transition-all border border-white/10 font-light text-xs uppercase tracking-[0.2em] shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Query</span>
        </button>

        {/* Section Header */}
        <div className="px-3 pt-1 pb-2">
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-mono">
            Intelligence Nodes
          </h3>
        </div>

        {/* Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-white text-[#0A0A0A] font-medium shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 font-light'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0A0A0A]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined ? (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-black text-white' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {item.badge}
                  </span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full transition-all ${isActive ? 'bg-[#0A0A0A]' : 'bg-white/10'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Status Callout */}
        <div className="mt-auto pt-4">
          <div className="p-3.5 border border-white/10 bg-white/[0.03] rounded-xl">
            <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">
              <span>Telemetry</span>
              <span className="text-emerald-400">99.8% OK</span>
            </div>
            <p className="text-[10px] leading-relaxed text-gray-500 tracking-tight">
              Satellite feed verified: 00:00 UTC
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer Links */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-1 text-xs">
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors text-left font-light"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>Documentation</span>
        </button>
        <button
          onClick={onOpenPrivacy}
          className="flex items-center gap-3 text-gray-400 hover:text-white hover:bg-white/5 px-3 py-2 rounded-lg transition-colors text-left font-light"
        >
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <span>Security & Data Sources</span>
        </button>
      </div>
    </aside>
  );
};
