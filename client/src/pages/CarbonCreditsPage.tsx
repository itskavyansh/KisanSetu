// client/src/pages/CarbonCreditsPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { carbonCreditsAPI } from '../services/carbonCreditsService';

type ProjectType = 'tree_planting' | 'rice_cultivation' | 'soil_management';
type UnitType = 'kg' | 't';
type Scenario = {
  id: string;
  name: string;
  projectType: ProjectType;
  location: string;
  startDate: string;
  details: any;
  result?: any;
  createdAt: string;
};

const CarbonCreditsPage: React.FC = () => {
  const [market, setMarket] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Form state
  const [projectType, setProjectType] = useState<ProjectType>('tree_planting');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [details, setDetails] = useState<any>({ treeCount: 100, species: 'teak', area: undefined, practice: undefined, practices: [] });

  // UX state
  const [unit, setUnit] = useState<UnitType>('kg');
  const [autoCalculate, setAutoCalculate] = useState(true);
  const detailsKey = useMemo(() => JSON.stringify(details), [details]);

  // Scenarios state
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  // Verification state
  const [verifyProjectId, setVerifyProjectId] = useState('');
  const [verificationResponse, setVerificationResponse] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  // UI refs/actions
  const estimatorRef = useRef<HTMLDivElement | null>(null);
  const scrollToEstimator = () => estimatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    (async () => {
      const [m, t] = await Promise.all([
        carbonCreditsAPI.getMarketInfo(),
        carbonCreditsAPI.getProjectTemplates(),
      ]);
      setMarket(m.data);
      setTemplates(t.data);
    })();
  }, []);

  const priceHistoryData = useMemo(() => {
    if (!market?.priceHistory || !Array.isArray(market.priceHistory)) return [] as Array<{ date: string; price: number }>;
    const count = market.priceHistory.length;
    const today = new Date();
    return market.priceHistory.map((p: number, idx: number) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (count - idx - 1));
      return { date: d.toISOString().split('T')[0], price: Number(p) };
    });
  }, [market]);

  const earningsSensitivityData = useMemo(() => {
    if (!calcResult?.carbonCredits?.annual || !market?.currentPrice) return [] as Array<{ label: string; price: number; earnings: number }>;
    const annualKg = Number(calcResult.carbonCredits.annual) || 0;
    const base = Number(market.currentPrice) || 0;
    const factors = [0.8, 0.9, 1.0, 1.1, 1.2];
    return factors.map(f => {
      const price = Math.round(base * f);
      const earnings = Math.round((annualKg * price) / 1000);
      return { label: `${Math.round((f - 1) * 100)}%`, price, earnings };
    });
  }, [calcResult, market]);

  // Load saved scenarios from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('carbon_scenarios');
      if (raw) setScenarios(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist scenarios
  useEffect(() => {
    try {
      localStorage.setItem('carbon_scenarios', JSON.stringify(scenarios));
    } catch {}
  }, [scenarios]);

  const calculateExample = async () => {
    setLoading(true);
    setCalcError(null);
    try {
      const r = await carbonCreditsAPI.calculateCredits({
        projectType,
        details: buildDetailsForSubmission(),
        location: location || 'Mysuru, Karnataka',
        startDate: startDate || '2024-01-01',
      });
      setCalcResult(r.data);
    } catch (e: any) {
      setCalcError(e?.response?.data?.error || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-calc when inputs change
  useEffect(() => {
    if (!autoCalculate) return;
    if (projectType === 'tree_planting' && (!details.treeCount || Number(details.treeCount) <= 0)) return;
    if ((projectType === 'rice_cultivation' || projectType === 'soil_management') && (!details.area || Number(details.area) <= 0)) return;
    const tid = setTimeout(() => {
      calculateExample();
    }, 500);
    return () => clearTimeout(tid);
  }, [projectType, detailsKey, location, startDate, autoCalculate]);

  const handleTemplateClick = (templateId: string) => {
    const map: Record<string, ProjectType> = {
      tree_plantation: 'tree_planting',
      climate_smart_rice: 'rice_cultivation',
      soil_carbon: 'soil_management',
    };
    const mapped = map[templateId];
    if (!mapped) return;
    setProjectType(mapped);
    if (mapped === 'tree_planting') setDetails({ treeCount: 200, species: 'teak' });
    if (mapped === 'rice_cultivation') setDetails({ area: 2000, practice: 'direct_seeding' });
    if (mapped === 'soil_management') setDetails({ area: 1000, practices: ['composting'] });
    setTimeout(() => calculateExample(), 0);
  };

  const saveScenario = () => {
    const name = window.prompt('Name this scenario', `${projectType} ${new Date().toLocaleString()}`);
    if (!name) return;
    const scenario: Scenario = {
      id: `${Date.now()}`,
      name,
      projectType,
      location,
      startDate,
      details,
      result: calcResult,
      createdAt: new Date().toISOString(),
    };
    setScenarios((prev) => [scenario, ...prev].slice(0, 10));
  };

  const loadScenario = (id: string) => {
    const sc = scenarios.find(s => s.id === id);
    if (!sc) return;
    setProjectType(sc.projectType);
    setLocation(sc.location);
    setStartDate(sc.startDate);
    setDetails(sc.details);
    setCalcResult(sc.result || null);
    setTimeout(() => calculateExample(), 0);
  };

  const deleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter(s => s.id !== id));
  };

  const formatCredits = (value: number) => {
    if (value == null) return '-';
    return unit === 'kg' ? Number(value).toLocaleString() : (Number(value) / 1000).toFixed(2);
  };
  const unitLabel = unit === 'kg' ? 'kg CO₂e' : 't CO₂e';

  const buildDetailsForSubmission = () => {
    if (projectType === 'tree_planting') {
      return { treeCount: Number(details.treeCount) || 0, species: details.species || 'general' };
    }
    if (projectType === 'rice_cultivation') {
      return { area: Number(details.area) || 0, practice: details.practice || 'direct_seeding' };
    }
    if (projectType === 'soil_management') {
      return { area: Number(details.area) || 0, practices: Array.isArray(details.practices) ? details.practices : [] };
    }
    return {};
  };

  const practiceOptions = useMemo(() => ([
    { key: 'alternate_wetting_drying', label: 'Alternate Wetting & Drying' },
    { key: 'direct_seeding', label: 'Direct Seeding' },
    { key: 'organic_farming', label: 'Organic Farming' },
  ]), []);

  const soilPracticeOptions = useMemo(() => ([
    { key: 'cover_cropping', label: 'Cover Cropping' },
    { key: 'composting', label: 'Composting' },
    { key: 'no_till', label: 'No-till' },
  ]), []);

  const handleVerify = async () => {
    if (!verifyProjectId) return;
    setLoading(true);
    setCalcError(null);
    try {
      const resp = await carbonCreditsAPI.verifyProject(verifyProjectId, {
        requirements: calcResult?.verification?.requirements || [],
      });
      setVerificationResponse(resp.data);
    } catch (e: any) {
      setCalcError(e?.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    if (!verifyProjectId) return;
    setLoading(true);
    setCalcError(null);
    try {
      const resp = await carbonCreditsAPI.getVerificationStatus(verifyProjectId);
      setVerificationStatus(resp.data);
    } catch (e: any) {
      setCalcError(e?.response?.data?.error || 'Status check failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">Carbon Credits</h1>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border rounded-lg p-6">
        <div className="text-xl font-semibold mb-2">Earn by going climate-smart</div>
        <p className="text-gray-700 mb-3">Reduce emissions or remove carbon on your farm and get paid for it. Estimate your potential carbon credits and earnings in minutes.</p>
        <div className="flex flex-wrap gap-3 mt-2">
          <button onClick={scrollToEstimator} className="bg-kisan-green text-white px-4 py-2 rounded-lg">Estimate my credits</button>
          <button onClick={() => handleTemplateClick('tree_plantation')} className="bg-white border px-3 py-2 rounded-lg">Tree plantation template</button>
          <button onClick={() => handleTemplateClick('climate_smart_rice')} className="bg-white border px-3 py-2 rounded-lg">Climate‑smart rice</button>
          <button onClick={() => handleTemplateClick('soil_carbon')} className="bg-white border px-3 py-2 rounded-lg">Soil carbon</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-5">
          <div className="font-semibold mb-2">What are carbon credits?</div>
          <p className="text-gray-700 mb-3">A carbon credit represents one tonne of carbon dioxide equivalent (CO₂e) that is avoided, reduced, or removed from the atmosphere.</p>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>Adopt practices like tree planting, water‑saving rice methods, or soil improvement.</li>
            <li>These practices reduce emissions or capture carbon in soil/biomass.</li>
            <li>Each tonne of CO₂e saved earns a credit that companies can buy to offset their emissions.</li>
          </ul>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <div className="font-semibold mb-2">Why it matters</div>
          <ul className="list-disc ml-5 text-gray-700 space-y-1 mb-3">
            <li>Extra farm income for sustainable practices.</li>
            <li>Healthier soils, better water retention, and long‑term productivity.</li>
            <li>Supports climate action and attracts premium markets.</li>
          </ul>
          <div className="font-semibold mb-1">Eligibility at a glance</div>
          <ul className="list-disc ml-5 text-gray-700 space-y-1">
            <li>Defined land/field area with GPS or clear location details</li>
            <li>Basic documentation: photos and simple records</li>
            <li>Willingness to follow recommended practices</li>
          </ul>
        </div>
      </div>

      {market && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-1">Live Carbon Price</div>
          <div className="text-gray-700">₹{market.currentPrice}/t CO₂e · {market.trend} {market.source ? `(source: ${market.source})` : ''}</div>
        </div>
      )}

      {priceHistoryData.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Carbon Price (last 30 days)</div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistoryData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(v) => new Date(v as string).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} formatter={(val: any) => [`₹${val}`, 'Price']} />
                <Legend />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2} name="Price (₹/t CO₂e)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div ref={estimatorRef} className="bg-white border rounded-lg p-4 space-y-4">
        <div className="font-semibold mb-2">Project Templates</div>
        <ul className="list-disc ml-6 text-gray-700">
          {templates.map((t) => (
            <li key={t.id}>
              <button className="text-left hover:underline" onClick={() => handleTemplateClick(t.id)}>{t.name}</button> — {t.description}
            </li>
          ))}
        </ul>

        <div className="h-px bg-gray-200" />

        <div className="flex items-center justify-between">
          <div className="font-semibold">Estimate Your Project</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Unit</span>
              <select className="border rounded px-2 py-1 text-sm" value={unit} onChange={(e) => setUnit(e.target.value as UnitType)}>
                <option value="kg">kg CO₂e</option>
                <option value="t">t CO₂e</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={autoCalculate} onChange={(e) => setAutoCalculate(e.target.checked)} />
              Auto-calc
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Project Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={projectType}
              onChange={(e) => {
                const value = e.target.value as typeof projectType;
                setProjectType(value);
                // Reset detail fields for clarity when switching types
                if (value === 'tree_planting') setDetails({ treeCount: 100, species: 'teak' });
                if (value === 'rice_cultivation') setDetails({ area: 1000, practice: 'direct_seeding' });
                if (value === 'soil_management') setDetails({ area: 1000, practices: [] });
              }}
            >
              <option value="tree_planting">Tree Planting</option>
              <option value="rice_cultivation">Rice Cultivation</option>
              <option value="soil_management">Soil Management</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Location</label>
            <input className="w-full border rounded px-3 py-2" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Mysuru, Karnataka" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Start Date</label>
            <input type="date" className="w-full border rounded px-3 py-2" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>

        {projectType === 'tree_planting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Tree Count</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={details.treeCount || ''} onChange={(e) => setDetails({ ...details, treeCount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Species</label>
              <select className="w-full border rounded px-3 py-2" value={details.species || 'teak'} onChange={(e) => setDetails({ ...details, species: e.target.value })}>
                <option value="teak">Teak</option>
                <option value="mango">Mango</option>
                <option value="coconut">Coconut</option>
                <option value="neem">Neem</option>
                <option value="general">Other/General</option>
              </select>
            </div>
          </div>
        )}

        {projectType === 'rice_cultivation' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Area (sq. meters)</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={details.area || ''} onChange={(e) => setDetails({ ...details, area: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Practice</label>
              <select className="w-full border rounded px-3 py-2" value={details.practice || 'direct_seeding'} onChange={(e) => setDetails({ ...details, practice: e.target.value })}>
                {practiceOptions.map(p => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {projectType === 'soil_management' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Area (sq. meters)</label>
              <input type="number" className="w-full border rounded px-3 py-2" value={details.area || ''} onChange={(e) => setDetails({ ...details, area: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Practices</label>
              <div className="space-y-2">
                {soilPracticeOptions.map(sp => (
                  <label key={sp.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={(details.practices || []).includes(sp.key)}
                      onChange={(e) => {
                        const set = new Set(details.practices || []);
                        if (e.target.checked) set.add(sp.key); else set.delete(sp.key);
                        setDetails({ ...details, practices: Array.from(set) });
                      }}
                    />
                    <span>{sp.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button onClick={calculateExample} disabled={loading} className="bg-kisan-green text-white px-4 py-2 rounded-lg">
            {loading ? 'Calculating...' : 'Calculate Estimate'}
          </button>
          <button onClick={saveScenario} disabled={loading} className="bg-white border px-4 py-2 rounded-lg">Save Scenario</button>
          {calcResult && (
            <span className="text-gray-600">Last updated {new Date(calcResult.timestamp).toLocaleString()}</span>
          )}
        </div>

        <div className="h-px bg-gray-200" />

        <div className="font-semibold">Verification</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm text-gray-700 mb-1">Project ID</label>
            <input className="w-full border rounded px-3 py-2" value={verifyProjectId} onChange={(e) => setVerifyProjectId(e.target.value)} placeholder="e.g., demo-123" />
          </div>
          <div className="flex gap-3 md:col-span-2">
            <button onClick={handleVerify} disabled={loading || !verifyProjectId} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Submit for Verification</button>
            <button onClick={handleCheckStatus} disabled={loading || !verifyProjectId} className="bg-gray-800 text-white px-4 py-2 rounded-lg">Check Status</button>
          </div>
        </div>
      </div>

      {calcError && <div className="text-red-600">{calcError}</div>}

      {loading && !calcResult && (
        <div className="bg-white border rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-40" />
        </div>
      )}

      {calcResult && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Estimates</div>
          <div>Annual: {formatCredits(calcResult.carbonCredits.annual)} {unitLabel}</div>
          <div>Lifetime: {formatCredits(calcResult.carbonCredits.lifetime)} {unitLabel}</div>
          <div className="mt-2">Annual Earnings: ₹{calcResult.financialBenefits.annualEarnings}</div>
        </div>
      )}

      {earningsSensitivityData.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Earnings vs Price (±20%)</div>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsSensitivityData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any, n: string) => [`₹${v}`, n === 'earnings' ? 'Earnings' : n]} />
                <Legend />
                <Area type="monotone" dataKey="earnings" stroke="#3b82f6" fill="#bfdbfe" fillOpacity={0.5} name="Annual Earnings" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {verificationResponse && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Verification Submitted</div>
          <div className="text-gray-700">Status: {verificationResponse.status}</div>
          <div className="text-gray-700">Estimated Completion: {new Date(verificationResponse.estimatedCompletion).toLocaleString()}</div>
        </div>
      )}

      {verificationStatus && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Verification Status</div>
          <div className="text-gray-700">Status: {verificationStatus.status}</div>
          <div className="text-gray-700">Progress: {verificationStatus.progress}%</div>
          <div className="text-gray-700">Next Milestone: {verificationStatus.nextMilestone}</div>
          <div className="text-gray-700">ETA: {new Date(verificationStatus.estimatedCompletion).toLocaleString()}</div>
        </div>
      )}

      {scenarios.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-3">Saved Scenarios</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-gray-600">
                <tr>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Annual</th>
                  <th className="py-2 pr-4">Lifetime</th>
                  <th className="py-2 pr-4">Annual ₹</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2 pr-4">{s.name}</td>
                    <td className="py-2 pr-4">{s.projectType.replace('_', ' ')}</td>
                    <td className="py-2 pr-4">{s.result ? `${formatCredits(s.result.carbonCredits.annual)} ${unitLabel}` : '-'}</td>
                    <td className="py-2 pr-4">{s.result ? `${formatCredits(s.result.carbonCredits.lifetime)} ${unitLabel}` : '-'}</td>
                    <td className="py-2 pr-4">{s.result ? `₹${s.result.financialBenefits.annualEarnings}` : '-'}</td>
                    <td className="py-2 pr-4 space-x-2">
                      <button className="text-blue-600 hover:underline" onClick={() => loadScenario(s.id)}>Load</button>
                      <button className="text-red-600 hover:underline" onClick={() => deleteScenario(s.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonCreditsPage;