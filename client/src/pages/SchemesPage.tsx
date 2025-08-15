import React, { useEffect, useState } from 'react';
import { governmentSchemesAPI } from '../services/governmentSchemesService';
import { useNavigate } from 'react-router-dom';

const SchemesPage: React.FC = () => {
  const [schemes, setSchemes] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    const r = await governmentSchemesAPI.searchSchemes(q ? { q } : {});
    setSchemes(r.data.schemes || []);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Government Schemes</h1>
      <div className="flex gap-2">
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 flex-1"
          placeholder="Search schemes (e.g., irrigation, soil)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load} className="bg-kisan-green text-white px-4 py-2 rounded-lg">Search</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {schemes.map((s) => (
          <div key={s.id} className="bg-white border rounded-lg p-4">
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-600 mt-1">{s.description}</div>
            <div className="mt-3 flex justify-between items-center">
              <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">{s.status}</span>
              <button onClick={() => navigate(`/schemes/${s.id}`)} className="text-kisan-blue">Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchemesPage;