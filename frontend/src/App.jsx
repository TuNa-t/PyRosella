import React, { useState, useEffect } from 'react';

export default function App() {
  const [studies, setStudies] = useState([
    {
      id: "PSI-001",
      title: "Extinction Dynamics of Low-Stretch Flames in Microgravity",
      category: "ISS Habitation Module",
      oxygen_pct: 21.0,
      pressure_psi: 14.7,
      fuel: "Methane / Air",
      cfd_match: "Matched (OpenFOAM)",
      rank_score: 94.5,
      summary: "Evaluates flame suppression limits under varying oxygen thresholds in closed-loop habitat environments."
    },
    {
      id: "PSI-002",
      title: "Material Flammability Screening for Lunar Surface Operations",
      category: "Lunar Rover",
      oxygen_pct: 30.0,
      pressure_psi: 8.2,
      fuel: "Polymer Composites",
      cfd_match: "Pending Verification",
      rank_score: 88.2,
      summary: "Analyzes ignition propagation rates across high-oxygen partial pressure spacesuit and rover materials."
    },
    {
      id: "PSI-003",
      title: "Radiative Heat Transfer in Confined Microgravity Combustion",
      category: "Mars Gateway Base",
      oxygen_pct: 24.0,
      pressure_psi: 10.0,
      fuel: "Propane Plume",
      cfd_match: "Matched (OpenFOAM)",
      rank_score: 82.7,
      summary: "Measures soot agglomeration and radiant feedback loops in low-velocity convective currents."
    }
  ]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isComparing, setIsComparing] = useState(false);
  const [activeStudy, setActiveStudy] = useState(null);
  const [aiSummary, setAiSummary] = useState("");
  const [scenario, setScenario] = useState("Lunar Rover");
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/studies')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setStudies(data);
      })
      .catch(err => console.log("Using local fallback studies data:", err));
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

  const selectedStudies = studies.filter(s => selectedIds.includes(s.id));

  const scenarioSpecs = {
    "Lunar Rover": {
      match: "Matched (0.02s)",
      pressure: "8.2 psi (High O₂)",
      velocity: "0.08 m/s",
      plumeLabel: "🔥 Cabin Polymer Ignition"
    },
    "ISS Habitation Module": {
      match: "Matched (0.01s)",
      pressure: "14.7 psi (1 atm)",
      velocity: "0.22 m/s (Ventilation)",
      plumeLabel: "🔥 Low-Stretch Methane Plume"
    },
    "Mars Gateway Base": {
      match: "Matched (0.04s)",
      pressure: "10.2 psi",
      velocity: "0.15 m/s",
      plumeLabel: "🔥 Airlock Propane Plume"
    }
  };

  const currentSpec = scenarioSpecs[scenario] || scenarioSpecs["Lunar Rover"];

  return (
    <div className="min-h-screen bg-black text-white p-8 font-futuristic">
      {/* Header & Navigation */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-widest">ROSELLA</h1>
          <p className="text-xs text-zinc-400 mt-2 uppercase tracking-wider">NASA PSI Microgravity Combustion & Fire Safety Intelligence</p>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setCurrentView("dashboard")} 
            className={`px-5 py-2.5 text-xs rounded font-bold tracking-wider uppercase transition ${currentView === 'dashboard' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-zinc-200 text-black hover:bg-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentView("testing")} 
            className={`px-5 py-2.5 text-xs rounded font-bold tracking-wider uppercase transition ${currentView === 'testing' ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-zinc-200 text-black hover:bg-white'}`}
          >
            Testing Subpage
          </button>
        </div>
      </header>

      {currentView === "dashboard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Evaluation Matrix & Ranked Studies */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-3">
                <h2 className="text-xl md:text-2xl font-bold tracking-wider uppercase text-white">Top Evaluated PSI Investigations</h2>
                {selectedIds.length > 0 && (
                  <button 
                    onClick={() => setIsComparing(true)}
                    className="bg-white text-black px-5 py-2 rounded text-xs font-bold tracking-wider uppercase hover:bg-zinc-200 transition shadow-md shadow-white/10"
                  >
                    Compare Selected ({selectedIds.length})
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400 mb-6">
                Dynamically ranked using an evaluation matrix factoring publication recency, access frequency, and data coverage.
              </p>

              <div className="overflow-x-auto border border-zinc-800 rounded">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/70 border-b border-zinc-700 text-zinc-300 text-xs uppercase tracking-wider">
                      <th className="py-3.5 px-3 border-r border-zinc-800 text-center w-14">Select</th>
                      <th className="py-3.5 px-4 border-r border-zinc-800">Investigation Title</th>
                      <th className="py-3.5 px-4 border-r border-zinc-800">Habitat Category</th>
                      <th className="py-3.5 px-4 border-r border-zinc-800 text-right">O₂ %</th>
                      <th className="py-3.5 px-4 text-right">Matrix Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studies.map(s => (
                      <tr key={s.id} className="border-b border-zinc-800 last:border-b-0 hover:bg-zinc-900/60 cursor-pointer transition-colors">
                        <td className="py-4 px-3 border-r border-zinc-800 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(s.id)}
                            onChange={() => toggleSelect(s.id)}
                            className="w-4 h-4 rounded bg-black border-zinc-600 text-white focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="py-4 px-4 border-r border-zinc-800 font-bold text-white text-sm hover:text-zinc-300 transition" onClick={() => openDrawer(s)}>
                          {s.title}
                        </td>
                        <td className="py-4 px-4 border-r border-zinc-800 text-xs text-zinc-400" onClick={() => openDrawer(s)}>
                          {s.category}
                        </td>
                        <td className="py-4 px-4 border-r border-zinc-800 text-xs text-zinc-300 text-right font-mono" onClick={() => openDrawer(s)}>
                          {s.oxygen_pct}%
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-white text-right font-mono" onClick={() => openDrawer(s)}>
                          {s.rank_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Scenario Modeling & OpenFOAM Viewer */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                <h3 className="text-xl font-bold tracking-wider uppercase text-white">Scenario & CFD</h3>
                <select 
                  value={scenario} 
                  onChange={(e) => setScenario(e.target.value)}
                  className="bg-black border border-zinc-700 px-3 py-1.5 rounded text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option>Lunar Rover</option>
                  <option>ISS Habitation Module</option>
                  <option>Mars Gateway Base</option>
                </select>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                Target architecture CAD wireframe paired with pre-computed OpenFOAM fluid contour profiles.
              </p>
              
              {/* Dynamic Vector CAD Line Art Simulation Frame */}
              <div className="relative w-full h-64 bg-black border border-zinc-800 rounded flex items-center justify-center overflow-hidden">
                {/* CAD Blueprint Grid Background */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#3f3f46 1px, transparent 1px), linear-gradient(90deg, #3f3f46 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {scenario === "Lunar Rover" && (
                  <svg className="w-64 h-48 text-zinc-300 z-10" viewBox="0 0 260 180" fill="none" stroke="currentColor">
                    {/* Chassis & Cabin */}
                    <path d="M50 110 L75 65 L165 65 L195 110 Z" strokeWidth="2" />
                    <rect x="40" y="110" width="170" height="22" rx="4" strokeWidth="2" />
                    {/* High-Gain Dish & Mast */}
                    <line x1="175" y1="65" x2="175" y2="35" strokeWidth="2" />
                    <path d="M162 28 Q175 42 188 28" strokeWidth="2" />
                    {/* Mesh Wheels & Suspension */}
                    <circle cx="70" cy="145" r="18" strokeWidth="2" />
                    <circle cx="70" cy="145" r="7" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="180" cy="145" r="18" strokeWidth="2" />
                    <circle cx="180" cy="145" r="7" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="70" y1="132" x2="70" y2="145" strokeWidth="2" />
                    <line x1="180" y1="132" x2="180" y2="145" strokeWidth="2" />
                    {/* CFD Flow Streamlines */}
                    <path d="M85 95 C105 80, 135 80, 155 95" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 2" />
                    <circle cx="115" cy="92" r="12" stroke="#ef4444" strokeWidth="1.5" />
                  </svg>
                )}

                {scenario === "ISS Habitation Module" && (
                  <svg className="w-64 h-48 text-zinc-300 z-10" viewBox="0 0 260 180" fill="none" stroke="currentColor">
                    {/* Pressurized Cylinder */}
                    <rect x="65" y="65" width="130" height="50" rx="12" strokeWidth="2" />
                    <line x1="95" y1="65" x2="95" y2="115" strokeWidth="1.5" />
                    <line x1="165" y1="65" x2="165" y2="115" strokeWidth="1.5" />
                    {/* Docking Ports */}
                    <rect x="45" y="78" width="20" height="24" strokeWidth="2" />
                    <rect x="195" y="78" width="20" height="24" strokeWidth="2" />
                    {/* Solar Arrays */}
                    <rect x="105" y="20" width="18" height="45" strokeWidth="1.5" />
                    <rect x="137" y="20" width="18" height="45" strokeWidth="1.5" />
                    <rect x="105" y="115" width="18" height="45" strokeWidth="1.5" />
                    <rect x="137" y="115" width="18" height="45" strokeWidth="1.5" />
                    {/* Spherical Microgravity Flame Contour */}
                    <circle cx="130" cy="90" r="14" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="130" cy="90" r="7" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2 2" />
                  </svg>
                )}

                {scenario === "Mars Gateway Base" && (
                  <svg className="w-64 h-48 text-zinc-300 z-10" viewBox="0 0 260 180" fill="none" stroke="currentColor">
                    {/* Geodesic Surface Dome */}
                    <path d="M55 135 A75 75 0 0 1 205 135 Z" strokeWidth="2" />
                    <path d="M85 135 A45 68 0 0 1 175 135" strokeWidth="1.2" strokeDasharray="4 3" />
                    <line x1="130" y1="60" x2="130" y2="135" strokeWidth="1.2" />
                    {/* Airlock Tunnel */}
                    <rect x="25" y="112" width="32" height="23" strokeWidth="2" />
                    {/* Surface Ground Line */}
                    <line x1="15" y1="135" x2="245" y2="135" strokeWidth="2" />
                    {/* Plume Dispersion */}
                    <path d="M115 120 Q130 90 145 120" stroke="#ef4444" strokeWidth="1.5" />
                    <circle cx="130" cy="112" r="10" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
                  </svg>
                )}

                {/* Labeled Flame / Element Marker */}
                <div className="absolute bottom-3 left-3 px-3 py-1 rounded bg-white text-black text-[10px] font-bold uppercase tracking-wider shadow-lg z-20">
                  {currentSpec.plumeLabel}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-black p-4 rounded border border-zinc-800 text-xs space-y-2.5">
              <div className="text-zinc-400 font-bold uppercase text-[11px] tracking-wider mb-1">OpenFOAM Telemetry Reference</div>
              <div className="flex justify-between text-zinc-300"><span className="text-zinc-500">CFD Match:</span> <span className="text-white font-bold">{currentSpec.match}</span></div>
              <div className="flex justify-between text-zinc-300"><span className="text-zinc-500">Chamber Pressure:</span> <span className="font-mono">{currentSpec.pressure}</span></div>
              <div className="flex justify-between text-zinc-300"><span className="text-zinc-500">Convective Flow:</span> <span className="font-mono">{currentSpec.velocity}</span></div>
            </div>
          </div>
        </div>
      ) : (
        /* Testing & API Subpage */
        <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2">System Testing & Diagnostics</h2>
            <p className="text-xs text-zinc-400">
              Dedicated operational sandbox for verifying backend API pipelines, matrix calculations, and Gemini SI connectivity.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-black p-5 rounded border border-zinc-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">FastAPI Endpoint Health</h4>
              <p className="text-xs text-zinc-300">Backend server target: <code className="text-white font-mono bg-zinc-900 px-2 py-0.5 rounded">http://127.0.0.1:8000</code></p>
              <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="inline-block bg-white text-black text-xs px-4 py-2 rounded font-bold uppercase tracking-wider hover:bg-zinc-200 transition">
                Open Swagger UI Documentation ↗
              </a>
            </div>

            <div className="bg-black p-5 rounded border border-zinc-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Evaluation Matrix Diagnostics</h4>
              <p className="text-xs text-zinc-300">
                Formula: <code className="text-zinc-400 font-mono">Score = Recency(30%) + Access(40%) + File Coverage(30%)</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Study Comparison Modal */}
      {isComparing && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="w-full max-w-5xl bg-zinc-950 border border-zinc-700 rounded-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">PSI Investigation Matrix Comparison</h2>
                <p className="text-xs text-zinc-400 mt-1">Side-by-side combustion parameter and OpenFOAM verification delta</p>
              </div>
              <button 
                onClick={() => setIsComparing(false)} 
                className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded font-bold text-xs uppercase tracking-wider transition"
              >
                Close ✕
              </button>
            </div>

            <div className="overflow-x-auto border border-zinc-800 rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-700 text-xs uppercase tracking-wider text-zinc-300">
                    <th className="py-3.5 px-4 border-r border-zinc-800 w-44">Parameter</th>
                    {selectedStudies.map(s => (
                      <th key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0 text-white">
                        {s.id}: {s.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs">
                  <tr className="border-b border-zinc-800">
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">Habitat Target</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0">{s.category}</td>)}
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">Fuel / Material</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0">{s.fuel}</td>)}
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">Oxygen Conc.</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0 font-mono font-bold text-white">{s.oxygen_pct}%</td>)}
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">Chamber Pressure</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0 font-mono">{s.pressure_psi} psi</td>)}
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">OpenFOAM Status</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0">{s.cfd_match}</td>)}
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">Matrix Rank Score</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0 font-mono font-bold text-white text-sm">{s.rank_score}</td>)}
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 border-r border-zinc-800 font-bold text-zinc-400 uppercase">Safety Summary</td>
                    {selectedStudies.map(s => <td key={s.id} className="py-3.5 px-4 border-r border-zinc-800 last:border-r-0 text-zinc-300 leading-relaxed font-sans">{s.summary}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Notion-Style Slide-Over Drawer */}
      {activeStudy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end z-50">
          <div className="w-full max-w-lg bg-zinc-950 h-full p-8 border-l border-zinc-800 overflow-y-auto">
            <div className="flex justify-between items-start gap-4 mb-6">
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">{activeStudy.title}</h2>
              <button onClick={() => setActiveStudy(null)} className="bg-white hover:bg-zinc-200 text-black w-8 h-8 rounded flex-shrink-0 flex items-center justify-center font-bold text-sm transition">✕</button>
            </div>

            <div className="space-y-6">
              <div className="bg-black p-4 rounded border border-zinc-800">
                <h4 className="text-xs uppercase tracking-widest text-white font-bold mb-2">SI Safety Intelligence Summary</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{aiSummary}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Dataset Parameters</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black p-3 rounded border border-zinc-800">Fuel: <span className="text-white font-bold">{activeStudy.fuel}</span></div>
                  <div className="bg-black p-3 rounded border border-zinc-800">Oxygen: <span className="text-white font-bold">{activeStudy.oxygen_pct}%</span></div>
                  <div className="bg-black p-3 rounded border border-zinc-800">Pressure: <span className="text-white font-bold">{activeStudy.pressure_psi} psi</span></div>
                  <div className="bg-black p-3 rounded border border-zinc-800">CFD Profile: <span className="text-white font-bold">{activeStudy.cfd_match}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}