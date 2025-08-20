import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { governmentSchemesAPI } from '../services/governmentSchemesService';

const SchemeDetailPage: React.FC = () => {
  const { schemeId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      if (!schemeId) return;
      const r = await governmentSchemesAPI.getSchemeDetails(schemeId);
      setData(r.data);
    })();
  }, [schemeId]);

  if (!data) return <div className="flex-1 overflow-auto relative min-h-screen p-6">Loading...</div>;

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-bold">{data.name}</h1>
      <p className="text-gray-700">{data.description}</p>
      <div>
        <h2 className="font-semibold mb-2">Benefits</h2>
        <ul className="list-disc ml-6 text-gray-700">
          {data.benefits.map((b: string, i: number) => <li key={i}>{b}</li>)}
        </ul>
      </div>
    </div>
  );
};

export default SchemeDetailPage;
