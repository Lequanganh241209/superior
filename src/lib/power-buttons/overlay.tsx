
import React, { useState, useEffect } from 'react';
import { POWER_ACTIONS } from './actions';
import { PowerButtonId, ButtonAnalytics } from './core';
import { Zap, Skull, DollarSign, Clock, Eye, Shield, Share2, Trophy, Gauge, Target, Star, AlertTriangle, ChevronRight, X } from 'lucide-react';

const BUTTON_CONFIGS = [
  // Growth Group
  { id: 'magic-boost', label: 'Boost', icon: Zap, color: 'text-blue-400 hover:text-blue-300' },
  { id: 'money-maker', label: 'Revenue', icon: DollarSign, color: 'text-green-400 hover:text-green-300' },
  { id: 'viral-engine', label: 'Viral', icon: Share2, color: 'text-pink-400 hover:text-pink-300' },
  { id: 'conversion-wizard', label: 'Convert', icon: Target, color: 'text-orange-400 hover:text-orange-300' },
  
  // Strategy Group
  { id: 'competitor-crush', label: 'Crush', icon: Skull, color: 'text-red-400 hover:text-red-300' },
  { id: 'seo-dominator', label: 'SEO', icon: Trophy, color: 'text-yellow-400 hover:text-yellow-300' },
  { id: 'brand-alchemist', label: 'Brand', icon: Star, color: 'text-rose-400 hover:text-rose-300' },
  { id: 'user-whisperer', label: 'Minds', icon: Eye, color: 'text-indigo-400 hover:text-indigo-300' },

  // Tech Group
  { id: 'speed-demon', label: 'Speed', icon: Gauge, color: 'text-cyan-400 hover:text-cyan-300' },
  { id: 'legal-shield', label: 'Legal', icon: Shield, color: 'text-gray-400 hover:text-gray-300' },
  { id: 'time-travel', label: 'Future', icon: Clock, color: 'text-purple-400 hover:text-purple-300' },
  { id: 'crisis-mode', label: 'Fix', icon: AlertTriangle, color: 'text-red-500 hover:text-red-400 animate-pulse' },
];

export const PowerButtonOverlay = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{title: string, message: string} | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = async (id: string) => {
    setLoading(id);
    ButtonAnalytics.trackClick(id as PowerButtonId);
    
    try {
      const action = POWER_ACTIONS[id as PowerButtonId];
      if (action) {
        const res = await action();
        setResult({ title: 'SUCCESS', message: res.message });
        ButtonAnalytics.trackSuccess(id as PowerButtonId, res);
      }
    } catch (e) {
      setResult({ title: 'ERROR', message: 'Action failed. Try again.' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div id="power-overlay" className="fixed z-[9999] pointer-events-none inset-0 flex flex-col justify-end items-center pb-6">
      {/* Result Popup */}
      {result && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-xl text-white p-6 rounded-2xl border border-white/10 shadow-2xl pointer-events-auto z-[10000] max-w-sm w-full animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-start mb-4">
             <h3 className="text-lg font-bold text-green-400 flex items-center gap-2">
               <CheckCircle /> {result.title}
             </h3>
             <button onClick={() => setResult(null)} className="text-gray-500 hover:text-white"><X size={18} /></button>
          </div>
          <p className="text-gray-300 text-sm mb-6 leading-relaxed">{result.message}</p>
          <button onClick={() => setResult(null)} className="w-full bg-white text-black px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-sm">
            Awesome
          </button>
        </div>
      )}

      {/* Floating Dock */}
      <div className={`
        pointer-events-auto flex items-center gap-2 p-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300 ease-spring
        ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
      `}>
        {BUTTON_CONFIGS.map((btn) => (
          <DockItem 
            key={btn.id} 
            {...btn} 
            loading={loading === btn.id} 
            onClick={() => handleClick(btn.id)} 
          />
        ))}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="pointer-events-auto absolute bottom-6 right-6 w-10 h-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
      >
        {isExpanded ? <X size={16} /> : <Zap size={16} className="text-yellow-400" />}
      </button>
    </div>
  );
};

const DockItem = ({ label, icon: Icon, color, loading, onClick }: any) => (
  <div className="group relative">
    <button
      onClick={onClick}
      disabled={loading}
      className={`
        w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200
        hover:bg-white/10 hover:scale-110 active:scale-95
        ${color} ${loading ? 'opacity-50 cursor-wait' : ''}
      `}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon size={20} strokeWidth={2} />
      )}
    </button>
    
    {/* Tooltip */}
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black border border-white/10 rounded text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
      {label}
    </div>
  </div>
);

const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
