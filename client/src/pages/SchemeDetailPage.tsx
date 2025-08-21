import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { governmentSchemesAPI } from '../services/governmentSchemesService';

const SchemeDetailPage: React.FC = () => {
  const { schemeId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!schemeId) return;
      setLoading(true);
      try {
      const r = await governmentSchemesAPI.getSchemeDetails(schemeId);
      setData(r.data);
      } catch (error) {
        console.error('Failed to load scheme details:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [schemeId]);

  if (loading) return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6">
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading scheme details...</div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6">
      <div className="text-center text-gray-600">
        <div className="text-xl mb-4">Scheme not found</div>
        <button 
          onClick={() => navigate('/schemes')}
          className="bg-kisan-blue text-white px-4 py-2 rounded-lg"
        >
          Back to Schemes
        </button>
      </div>
    </div>
  );

  const renderSection = (title: string, content: any, fallback?: string) => {
    if (!content || (Array.isArray(content) && content.length === 0)) {
      return fallback ? (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
          <p className="text-gray-500">{fallback}</p>
        </div>
      ) : null;
    }

    return (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">{title}</h3>
        {Array.isArray(content) ? (
          <ul className="space-y-2">
            {content.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-kisan-green mr-2">•</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        ) : typeof content === 'object' ? (
          <div className="space-y-3">
            {Object.entries(content).map(([key, value]) => (
              <div key={key} className="border-l-4 border-kisan-green pl-4">
                <div className="font-medium text-gray-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                {Array.isArray(value) ? (
                  <ul className="mt-1 space-y-1">
                    {value.map((item, index) => (
                      <li key={index} className="text-gray-600 text-sm">• {item}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-600 text-sm">{String(value)}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">{String(content)}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/schemes')}
          className="text-kisan-blue hover:text-kisan-green transition-colors"
        >
          ← Back to Schemes
        </button>
      </div>

      {/* Scheme Title and Basic Info */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
      <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{data.name}</h1>
            {data.shortName && (
              <div className="text-sm text-gray-500 mb-2">Code: {data.shortName}</div>
            )}
            {data.ministry && (
              <div className="text-sm text-gray-600 mb-2">Ministry: {data.ministry}</div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              data.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {data.status || 'Active'}
            </span>
            {data.category && (
              <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {data.category}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-700 text-lg leading-relaxed">{data.description}</p>
        
        {data.source && (
          <div className="mt-4 text-sm text-gray-500">
            Source: {data.source}
          </div>
        )}
      </div>

      {/* Two Column Layout for Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {renderSection('Eligibility Criteria', data.eligibility?.criteria, 'Eligibility information not available')}
          {renderSection('Required Documents', data.documents, 'Document requirements not specified')}
          {renderSection('Application Process', data.applicationProcess?.steps, 'Application process details not available')}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {renderSection('Benefits & Coverage', data.benefits, 'Benefits information not available')}
          {renderSection('Timeline & Processing', data.applicationProcess?.timeline, 'Timeline information not available')}
          {renderSection('Contact Information', data.contactInfo, 'Contact information not available')}
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6">
        {renderSection('Financial Benefits', data.benefits?.financial, 'Financial benefits not specified')}
        {renderSection('Non-Financial Benefits', data.benefits?.nonFinancial, 'Non-financial benefits not specified')}
        {renderSection('Land & Income Requirements', {
          'Land Requirement': data.eligibility?.landRequirement,
          'Income Limit': data.eligibility?.incomeLimit,
          'Age Limit': data.eligibility?.ageLimit
        }, 'Requirements not specified')}
      </div>

      {/* Additional Information */}
      {data.deadline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Deadline</h3>
          <p className="text-yellow-700">{data.deadline}</p>
        </div>
      )}

      {data.url && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Official Portal</h3>
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Visit Official Scheme Portal →
          </a>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button 
          onClick={() => navigate('/schemes')}
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Schemes
        </button>
        {data.url && (
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-kisan-green text-white px-6 py-3 rounded-lg hover:bg-kisan-blue transition-colors text-center"
          >
            Apply Now
          </a>
        )}
      </div>
    </div>
  );
};

export default SchemeDetailPage;
