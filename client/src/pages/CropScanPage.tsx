import React, { useState } from 'react';
import { cropHealthAPI } from '../services/cropHealthService';

const CropScanPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [cropType, setCropType] = useState('tomato');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setFile(files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cropHealthAPI.analyzeCrop({
        image: file,
        cropType: cropType
      });
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze crop image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Health Scanner</h1>
          <p className="text-gray-600">
            Upload a photo of your crop to get instant disease detection and treatment recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Type
                </label>
                <select
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kisan-green focus:border-transparent"
                >
                  <option value="tomato">Tomato</option>
                  <option value="rice">Rice</option>
                  <option value="wheat">Wheat</option>
                  <option value="potato">Potato</option>
                  <option value="onion">Onion</option>
                  <option value="cotton">Cotton</option>
                  <option value="sugarcane">Sugarcane</option>
                  <option value="maize">Maize</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {file ? (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-kisan-green hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-kisan-green"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={onFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!file || loading}
                className="w-full bg-kisan-green text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kisan-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Analyzing...' : 'Analyze Crop Health'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* Results Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
            
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-green mx-auto"></div>
                <p className="mt-2 text-gray-500">Analyzing your crop image...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Disease Detection</h3>
                  <p className="text-gray-700">{result.disease}</p>
                  <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.confidence > 80 ? 'bg-green-100 text-green-800' :
                    result.confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Confidence: {result.confidence}%
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Treatment Recommendations</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    {result.treatments.map((treatment: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {treatment}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Prevention Tips</h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    {result.prevention.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-600 mr-2">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-semibold text-purple-900 mb-2">Market Impact</h3>
                  <p className="text-purple-800 text-sm">{result.marketImpact}</p>
                </div>
              </div>
            )}

            {!result && !loading && (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>Upload an image to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Scan History</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-4">
              Your crop scan history will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropScanPage;
