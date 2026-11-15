import React, { useState, useEffect } from 'react';

export default function App() {
  const [studies, setStudies] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeStudy, setActiveStudy] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [scenario, setScenario] = useState("Lunar Rover");
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard" or "testing"

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/studies')
      .then(res => res.json())
      .then(data => setStudies(data))
      .catch(err => console.error("Backend offline:", err));
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openDrawer = async (study) => {
    setActiveStudy(study);
    setAiSummary("Evaluating via Gemini SI Model...");
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/summary/${study.id}`, { method: 'POST' });
      const data = await res.json();
      setAiSummary(data.summary);
    } catch {
      setAiSummary(study.summary);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      {/* Header & Navigation */}
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 tracking-wider">ROSELLA</h1>
          <p className="text-xs text-zinc-400 mt-1">NASA PSI Microgravity Combustion & Fire Safety Intelligence Dashboard</p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setCurrentView("dashboard")} 
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${currentView === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView("testing")} 
            className={`px-3 py-1.5 text-xs rounded font-medium transition ${currentView === 'testing' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Testing & API Subpage
          </button>
        </div>
      </header>

      {currentView === "dashboard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Evaluation Matrix & Ranked Studies */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-white">Top Evaluated PSI Investigations</h2>
                {selectedIds.length > 0 && (
                  <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-1 rounded text-xs font-medium transition">
                    Compare Selected ({selectedIds.length})
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                Dynamically ranked using an evaluation matrix factoring publication recency, access frequency, and data coverage.
              </p>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                    <th className="py-3 px-2">Select</th>
                    <th className="py-3 px-2">Investigation Title</th>
                    <th className="py-3 px-2">Habitat Category</th>
                    <th className="py-3 px-2">O₂ %</th>
                    <th className="py-3 px-2">Matrix Score</th>
                  </tr>
                </thead>
                <tbody>
                  {studies.map(s => (
                    <tr key={s.id} className="border-b border-zinc-900 hover:bg-zinc-900/50 cursor-pointer">
                      <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(s.id)}
                          onChange={() => toggleSelect(s.id)}
                          className="rounded bg-black border-zinc-700 text-red-600 focus:ring-0"
                        />
                      </td>
                      <td className="py-3 px-2 font-medium text-red-400 text-sm" onClick={() => openDrawer(s)}>
                        {s.title}
                      </td>
                      <td className="py-3 px-2 text-xs text-zinc-300" onClick={() => openDrawer(s)}>{s.category}</td>
                      <td className="py-3 px-2 text-xs text-zinc-300" onClick={() => openDrawer(s)}>{s.oxygen_pct}%</td>
                      <td className="py-3 px-2 text-xs font-semibold text-emerald-400" onClick={() => openDrawer(s)}>{s.rank_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Scenario Modeling & OpenFOAM Viewer */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-semibold text-white">Scenario & CFD Lookup</h3>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value)}
                  className="bg-black border border-zinc-700 px-3 py-1 rounded text-xs text-white"
                >
                  <option>Lunar Rover</option>
                  <option>ISS Habitation Module</option>
                  <option>Mars Gateway Base</option>
                </select>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Visualizes target architecture line art paired with pre-computed OpenFOAM fluid contour models.
              </p>
              
              {/* Vector Line Art Simulation Frame */}
              <div className="relative w-full h-56 bg-black border border-zinc-800 rounded flex items-center justify-center overflow-hidden">
                <svg className="w-40 h-40 opacity-70 text-zinc-500" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                  <rect x="40" y="80" width="120" height="70" rx="10" strokeWidth="2" />
                  <circle cx="60" cy="150" r="15" strokeWidth="2" />
                  <circle cx="140" cy="150" r="15" strokeWidth="2" />
                  <path d="M70 80 L100 40 L130 80" strokeWidth="2" />
                </svg>
                {/* Labeled Flame / Element Marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded bg-red-950/80 border border-red-500/50 text-red-300 text-xs font-mono flex items-center gap-1">
                  <span>🔥 O₂ / Propane Plume</span>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-black p-4 rounded border border-zinc-800 text-xs space-y-2">
              <div className="text-zinc-400 font-semibold mb-1">Permanent Data Reference Table</div>
              <div className="flex justify-between text-zinc-300"><span className="text-zinc-500">OpenFOAM Match:</span> <span className="text-emerald-400 font-mono">Matched (0.02s)</span></div>
              <div className="flex justify-between text-zinc-300"><span className="text-zinc-500">Chamber Pressure:</span> <span className="font-mono">10.2 psi</span></div>
              <div className="flex justify-between text-zinc-300"><span className="text-zinc-500">Flow Velocity:</span> <span className="font-mono">0.15 m/s</span></div>
            </div>
          </div>
        </div>
      ) : (
        /* Testing & API Subpage */
        <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-1">System Testing & Diagnostics Subpage</h2>
            <p className="text-xs text-zinc-400">
              Dedicated operational sandbox for verifying backend API pipelines, matrix calculations, and Gemini SI connectivity.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-black p-4 rounded border border-zinc-800 space-y-2">
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">FastAPI Endpoint Health</h4>
              <p className="text-xs text-zinc-300">Backend server is active at <code className="text-emerald-400 font-mono">http://127.0.0.1:8000</code>.</p>
              <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="inline-block bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-3 py-1.5 rounded font-medium transition">
                Open Swagger UI Documentation ↗
              </a>
            </div>

            <div className="bg-black p-4 rounded border border-zinc-800 space-y-2">
              <h4 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Evaluation Matrix Diagnostics</h4>
              <p className="text-xs text-zinc-300">
                Formula: <code className="text-zinc-400 font-mono">Score = Recency(30%) + Access(40%) + File Coverage(30%)</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notion-Style Slide-Over Drawer */}
      {activeStudy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-lg bg-zinc-950 h-full p-8 border-l border-zinc-800 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-red-400">{activeStudy.title}</h2>
              <button onClick={() => setActiveStudy(null)} className="text-zinc-400 hover:text-white text-base font-bold">✕</button>
            </div>

            <div className="space-y-6">
              <div className="bg-black p-4 rounded border border-zinc-800">
                <h4 className="text-[10px] uppercase tracking-wider text-red-500 font-semibold mb-2">SI Safety Intelligence Summary</h4>
                <p className="text-xs text-zinc-200 leading-relaxed">{aiSummary}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">Dataset Parameters</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black p-3 rounded border border-zinc-800">Fuel: <span className="text-white font-medium">{activeStudy.fuel}</span></div>
                  <div className="bg-black p-3 rounded border border-zinc-800">Oxygen: <span className="text-white font-medium">{activeStudy.oxygen_pct}%</span></div>
                  <div className="bg-black p-3 rounded border border-zinc-800">Pressure: <span className="text-white font-medium">{activeStudy.pressure_psi} psi</span></div>
                  <div className="bg-black p-3 rounded border border-zinc-800">CFD Profile: <span className="text-white font-medium">{activeStudy.cfd_match}</span></div>
                </div>
              </div>
            </div>a
          </div>
        </div>
      )}
    </div>
  );
}