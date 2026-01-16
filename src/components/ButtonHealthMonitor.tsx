
'use client';

import { useState, useEffect } from 'react';
import { ButtonTester, ButtonTestResult } from '@/lib/testing/button-tester';
import { Activity, CheckCircle, AlertTriangle, Tool } from 'lucide-react';

export default function ButtonHealthMonitor() {
  const [stats, setStats] = useState({ total: 0, working: 0, broken: 0, fixed: 0 });
  const [brokenButtons, setBrokenButtons] = useState<ButtonTestResult[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const tester = new ButtonTester();
    
    const runScan = async () => {
        const results = await tester.testAllButtons();
        
        setStats({
            total: results.length,
            working: results.filter(r => r.works).length,
            broken: results.filter(r => !r.works).length,
            fixed: results.filter(r => r.wasFixed).length
        });
        
        setBrokenButtons(results.filter(r => !r.works));
    };

    // Initial scan
    runScan();
    
    // Scan periodically
    const interval = setInterval(runScan, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isExpanded) {
      return (
          <button 
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-4 right-4 bg-black/80 backdrop-blur border border-white/10 p-2 rounded-full text-white hover:bg-white/10 z-50 flex items-center gap-2 shadow-xl"
            title="Button Health Monitor"
          >
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-xs font-mono">{stats.working}/{stats.total}</span>
          </button>
      );
  }

  return (
    <div className="fixed bottom-4 right-4 w-64 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden font-sans">
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/5">
        <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Activity className="w-3 h-3 text-green-400" />
            BUTTON GUARDIAN
        </h3>
        <button onClick={() => setIsExpanded(false)} className="text-white/50 hover:text-white">&times;</button>
      </div>
      
      <div className="p-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-green-500/10 rounded p-2 border border-green-500/20">
              <div className="text-lg font-bold text-green-400">{stats.working}</div>
              <div className="text-[10px] text-green-200/50 uppercase">Working</div>
          </div>
          <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
              <div className="text-lg font-bold text-red-400">{stats.broken}</div>
              <div className="text-[10px] text-red-200/50 uppercase">Broken</div>
          </div>
          <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
              <div className="text-lg font-bold text-blue-400">{stats.fixed}</div>
              <div className="text-[10px] text-blue-200/50 uppercase">Fixed</div>
          </div>
      </div>

      {brokenButtons.length > 0 && (
        <div className="max-h-32 overflow-y-auto border-t border-white/10">
            {brokenButtons.map((res, i) => (
                <div key={i} className="p-2 border-b border-white/5 flex items-center justify-between hover:bg-white/5">
                    <span className="text-[10px] text-white/70 truncate w-24" title={res.analysis.text}>
                        {res.analysis.text || 'Unnamed'}
                    </span>
                    <button className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] text-white">
                        Auto-Fix
                    </button>
                </div>
            ))}
        </div>
      )}
      
      <div className="p-2 text-center text-[9px] text-white/30 border-t border-white/10">
          Scanning active...
      </div>
    </div>
  );
}
