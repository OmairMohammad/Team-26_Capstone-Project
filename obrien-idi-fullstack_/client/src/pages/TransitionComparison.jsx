import { ArrowRight, DollarSign, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { baseAssets, transitionScenarios } from '../data/mockData';
import { assessAsset } from '../lib/recommendationEngine';

const STRATEGIES = ['Reactive', 'Preventative', 'Condition-Based', 'Predictive'];

const strategyProfiles = {
  Reactive: { annualCostMult: 1.0, downtimeMult: 1.0, co2Mult: 1.0, reliabilityScore: 35, description: 'Run until failure. Lowest upfront cost, highest unplanned downtime and risk.' },
  Preventative: { annualCostMult: 0.75, downtimeMult: 0.55, co2Mult: 0.88, reliabilityScore: 62, description: 'Scheduled maintenance regardless of condition. Predictable costs, some over-maintenance.' },
  'Condition-Based': { annualCostMult: 0.60, downtimeMult: 0.35, co2Mult: 0.78, reliabilityScore: 80, description: 'Intervene when condition thresholds are crossed. Efficient resource use.' },
  Predictive: { annualCostMult: 0.50, downtimeMult: 0.18, co2Mult: 0.68, reliabilityScore: 92, description: 'AI-driven forecasting to intervene before failure. Lowest downtime and cost at scale.' },
};

export default function TransitionComparison() {
  const { currentUser } = useAuth();
  const assessed = useMemo(() => baseAssets.map(assessAsset), []);
  const [selectedAssetId, setSelectedAssetId] = useState(assessed[0]?.assetId);
  const [compareA, setCompareA] = useState('Reactive');
  const [compareB, setCompareB] = useState('Predictive');

  const asset = assessed.find(a => a.assetId === selectedAssetId);

  // Build per-strategy data for selected asset
  const stratData = asset ? STRATEGIES.map(s => {
    const p = strategyProfiles[s];
    return {
      strategy: s,
      annualCost: Math.round(asset.annualMaintenanceCost * p.annualCostMult),
      downtimeHours: Math.round(((asset.recentFaults * 24) + (asset.overdueDays * 2)) * p.downtimeMult + 5),
      co2: Math.round(asset.co2Emissions * p.co2Mult * 8760 / 1000),
      reliability: p.reliabilityScore,
    };
  }) : [];

  const radarData = STRATEGIES.map(s => ({
    strategy: s.split('-')[0].slice(0, 6),
    reliability: strategyProfiles[s].reliabilityScore,
    costEff: Math.round((1 - strategyProfiles[s].annualCostMult) * 100),
    uptime: Math.round((1 - strategyProfiles[s].downtimeMult) * 100),
    emissions: Math.round((1 - strategyProfiles[s].co2Mult) * 100),
  }));

  const cmpA = stratData.find(s => s.strategy === compareA);
  const cmpB = stratData.find(s => s.strategy === compareB);
  const savings = cmpA && cmpB ? cmpA.annualCost - cmpB.annualCost : 0;

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Transition Comparison</h2>
            <p className="mt-1 text-sm text-slate-500">Compare maintenance strategies by cost, downtime, emissions, and reliability for any asset.</p>
          </div>

          {/* Strategy profiles summary */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STRATEGIES.map(s => {
              const p = strategyProfiles[s];
              return (
                <div key={s} className="card p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">{s}</p>
                  <p className="mt-2 text-xs text-slate-500">{p.description}</p>
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-brand-600" style={{ width: `${p.reliabilityScore}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Reliability: {p.reliabilityScore}%</p>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Asset selector */}
          <section className="mt-6 card p-5">
            <h3 className="card-title">Select Asset for Strategy Comparison</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <select value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} className="input min-w-[260px]">
                {assessed.map(a => <option key={a.assetId} value={a.assetId}>{a.assetId} – {a.assetName}</option>)}
              </select>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                Current strategy: <strong>{asset?.maintenanceStrategy}</strong>
                <span className="ml-3">Risk: <strong>{asset?.riskLevel}</strong></span>
                <span className="ml-3">Health: <strong>{asset?.healthScore}/100</strong></span>
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="card p-5">
              <h3 className="card-title">Annual Cost by Strategy</h3>
              <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stratData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="strategy" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Annual Cost']} />
                    <Bar dataKey="annualCost" name="Annual Cost ($)" fill="#cf2e2e" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="card-title">Downtime Hours by Strategy</h3>
              <div className="mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stratData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="strategy" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}h`, 'Est. Downtime']} />
                    <Bar dataKey="downtimeHours" name="Downtime (hours)" fill="#f59e0b" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Side-by-side comparison */}
          <section className="mt-6 card p-5">
            <h3 className="card-title mb-4">Side-by-Side Strategy Comparison</h3>
            <div className="flex flex-wrap gap-3 mb-6">
              <div>
                <label className="label">Strategy A</label>
                <select value={compareA} onChange={e => setCompareA(e.target.value)} className="input min-w-[180px]">
                  {STRATEGIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-end pb-1"><ArrowRight size={20} className="text-slate-400" /></div>
              <div>
                <label className="label">Strategy B (Proposed)</label>
                <select value={compareB} onChange={e => setCompareB(e.target.value)} className="input min-w-[180px]">
                  {STRATEGIES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {cmpA && cmpB && (
              <>
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Annual Cost Saving', value: `$${Math.abs(savings).toLocaleString()}`, icon: DollarSign, positive: savings > 0 },
                    { label: 'Downtime Reduction', value: `${Math.max(0, cmpA.downtimeHours - cmpB.downtimeHours)}h`, icon: TrendingDown, positive: true },
                    { label: 'Reliability Gain', value: `+${Math.max(0, cmpB.reliability - cmpA.reliability)}%`, icon: TrendingUp, positive: true },
                    { label: 'CO₂ Reduction', value: `${Math.max(0, cmpA.co2 - cmpB.co2)} t/yr`, icon: Zap, positive: true },
                  ].map(({ label, value, icon: Icon, positive }) => (
                    <div key={label} className={`rounded-xl p-4 ${positive ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'}`}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={positive ? 'text-emerald-600' : 'text-rose-600'} />
                        <p className="text-xs text-slate-500">{label}</p>
                      </div>
                      <p className={`text-xl font-bold mt-1 ${positive ? 'text-emerald-700' : 'text-rose-700'}`}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {[{ label: compareA, data: cmpA }, { label: compareB, data: cmpB }].map(({ label, data }) => (
                    <div key={label} className="rounded-xl border border-slate-200 p-4">
                      <p className="text-sm font-bold text-slate-900 mb-3">{label}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[['Annual Cost', `$${data.annualCost.toLocaleString()}`], ['Downtime', `${data.downtimeHours}h`], ['Reliability', `${data.reliability}%`], ['CO₂', `${data.co2}t/yr`]].map(([k, v]) => (
                          <div key={k} className="rounded-xl bg-slate-50 p-2 text-xs">
                            <span className="text-slate-400 block">{k}</span>
                            <span className="font-bold text-slate-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Transition Scenarios */}
          <section className="mt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Recommended Transition Scenarios</h3>
            <div className="grid gap-5 xl:grid-cols-3">
              {transitionScenarios.map(ts => (
                <div key={ts.id} className="card p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ts.assetName}</p>
                      <p className="text-xs text-slate-400">{ts.assetId}</p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">{ts.confidence}% confidence</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700 font-semibold">{ts.currentStrategy}</span>
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700 font-semibold">{ts.proposedStrategy}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[['Annual Saving', `$${(ts.currentAnnualCost - ts.proposedAnnualCost).toLocaleString()}`],
                      ['Downtime Reduction', `${ts.currentDowntimeHours - ts.proposedDowntimeHours}h`],
                      ['CO₂ Reduction', `${ts.co2Reduction}%`],
                      ['Payback Period', `${ts.paybackMonths} months`]].map(([k, v]) => (
                      <div key={k} className="rounded-xl bg-slate-50 p-3 text-xs">
                        <span className="text-slate-400 block">{k}</span>
                        <span className="font-bold text-slate-900">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                    Risk reduction: <strong>{ts.riskReduction}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
