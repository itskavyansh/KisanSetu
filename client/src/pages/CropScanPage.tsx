import React, { useState, useRef, useEffect } from 'react';
import { cropHealthAPI } from '../services/cropHealthService';
import { ScanHistoryService, ScanHistoryItem } from '../services/scanHistoryService';
import { useAuth } from '../contexts/AuthContext';
import CropProductionChart from '../components/charts/CropProductionChart';

const CropScanPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useBackCamera, setUseBackCamera] = useState(true);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Load scan history from Firebase when user changes or component mounts
  useEffect(() => {
    if (currentUser) {
      loadScanHistory();
    } else {
      setScanHistory([]);
    }
  }, [currentUser]);

  // Debug effect to monitor result state changes
  useEffect(() => {
    console.log('🔄 Result state changed:', result);
    console.log('🔄 Loading state:', loading);
  }, [result, loading]);

  // Load scan history from Firebase
  const loadScanHistory = async () => {
    if (!currentUser) return;
    
    try {
      setHistoryLoading(true);
      setError(null); // Clear any previous errors
      const history = await ScanHistoryService.getUserScanHistory(currentUser.uid);
      setScanHistory(history);
    } catch (err) {
      console.error('Error loading scan history:', err);
      // Don't show error for history loading as it's not critical
      // Just log it and continue with empty history
    } finally {
      setHistoryLoading(false);
    }
  };

  // Add new scan to Firebase history
  const addToHistory = async (scanResult: any, imageFile: File) => {
    if (!currentUser || !imageFile) return;
    
    try {
      setUploadingImage(true);
      const scanData = {
        crop: scanResult.data?.crop || 'Unknown',
        disease: scanResult.data?.disease || 'Unknown',
        confidence: scanResult.data?.confidence || 0,
        result: scanResult
      };

      await ScanHistoryService.addScan(currentUser.uid, scanData, imageFile);
      
      // Reload history to show the new scan
      await loadScanHistory();
    } catch (err: any) {
      console.error('Error saving scan to history:', err);
      // Don't show error to user as this is not critical
      // The scan result is still displayed, just not saved to history
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove scan from Firebase history
  const removeFromHistory = async (id: string) => {
    if (!id) return;
    
    try {
      await ScanHistoryService.deleteScan(id);
      setScanHistory(prev => prev.filter(scan => scan.id !== id));
    } catch (err) {
      console.error('Error deleting scan:', err);
      setError('Failed to delete scan from history');
    }
  };

  // Clear all scans from Firebase history
  const clearHistory = async () => {
    if (!currentUser) return;
    
    try {
      await ScanHistoryService.clearUserHistory(currentUser.uid);
      setScanHistory([]);
    } catch (err) {
      console.error('Error clearing scan history:', err);
      setError('Failed to clear scan history');
    }
  };

  // Load scan result from history
  const loadFromHistory = (scan: ScanHistoryItem) => {
    setResult(scan.result);
    // Convert base64 image data back to blob URL for display
    if (scan.imageData) {
      const blob = new Blob([Uint8Array.from(atob(scan.imageData), c => c.charCodeAt(0))], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
    setFile(null); // Clear current file since we're loading from history
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    let date: Date;
    
    // Handle Firestore timestamp
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get confidence badge color
  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [previewUrl]);

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setFile(null);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newFile = files[0];
      const objectUrl = URL.createObjectURL(newFile);
      setPreviewUrl(objectUrl);
      setFile(newFile);
      setError(null);
      setResult(null);
      if (showCamera) stopCamera();
    }
  };

  useEffect(() => {
    if (showCamera && videoRef.current && cameraStreamRef.current) {
      const video = videoRef.current;
      video.srcObject = cameraStreamRef.current;
      video.muted = true;
      const tryPlay = () => {
        const p = video.play();
        if (p && typeof p.then === 'function') {
          p.catch(() => {});
        }
      };
      if (video.readyState >= 2) {
        tryPlay();
      } else {
        video.onloadedmetadata = () => tryPlay();
      }
    }
  }, [showCamera]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedFiles = e.clipboardData.files;
    if (pastedFiles && pastedFiles[0] && pastedFiles[0].type.startsWith('image/')) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const newFile = pastedFiles[0];
      const objectUrl = URL.createObjectURL(newFile);
      setPreviewUrl(objectUrl);
      setFile(newFile);
      setError(null);
      setResult(null);
      if (showCamera) stopCamera();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const dt = e.dataTransfer;
    const droppedFile = dt.files && dt.files[0] ? dt.files[0] : null;
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const objectUrl = URL.createObjectURL(droppedFile);
      setPreviewUrl(objectUrl);
      setFile(droppedFile);
      setError(null);
      setResult(null);
      if (showCamera) stopCamera();
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: useBackCamera ? 'environment' : 'user'
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;
      setShowCamera(true);
      clearPreview();
      setError(null);
      setResult(null);
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
    }
  };

  const switchCamera = async () => {
    if (cameraStreamRef.current) {
      stopCamera();
      setUseBackCamera(!useBackCamera);
      // Small delay to ensure previous stream is stopped
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  const stopCamera = () => {
    const stream = cameraStreamRef.current || (videoRef.current?.srcObject as MediaStream | null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cameraStreamRef.current = null;
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        
        canvasRef.current.toBlob((blob) => {
          if (blob) {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            const objectUrl = URL.createObjectURL(blob);
            const capturedFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            setPreviewUrl(objectUrl);
            setFile(capturedFile);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image file or capture a photo');
      return;
    }

    if (!currentUser) {
      setError('Please log in to save scan history');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting crop analysis...');
      const response = await cropHealthAPI.analyzeCrop({
        image: file
      });
      console.log('✅ Analysis response received:', response);
      console.log('📊 Response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        isPlant: response.data?.isPlant,
        disease: response.data?.disease,
        confidence: response.data?.confidence
      });
      
      // Validate response structure
      if (!response || !response.data) {
        throw new Error('Invalid response structure from server');
      }
      
      console.log('🔄 About to set result state...');
      setResult(response);
      console.log('🔄 Result state set, waiting for re-render...');
      
      // Add to Firebase history
      if (file) {
        console.log('💾 Saving to history...');
        try {
          await addToHistory(response, file);
          console.log('✅ Saved to history');
        } catch (historyError) {
          console.warn('⚠️ Failed to save to history:', historyError);
          // Show a subtle notification to the user
          setError('Analysis completed! Note: Scan history saving failed.');
          // Clear the error after 5 seconds
          setTimeout(() => setError(null), 5000);
        }
      }
      
    } catch (err: any) {
      console.error('❌ Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze crop image');
    } finally {
      console.log('🔄 Setting loading to false...');
      setLoading(false);
      console.log('🔄 Loading state set to false');
    }
  };

  // Show login required message if user is not authenticated
  if (!currentUser) {
    return (
      <div className="flex-1 overflow-auto relative min-h-screen p-6">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Health Scanner</h1>
            <p className="text-gray-600">
              Upload a photo of your crop or capture one using your camera to get instant disease detection and treatment recommendations
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Login Required</h3>
            <p className="text-yellow-700">
              Please log in to use the crop health scanner and save your scan history.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crop Health Scanner</h1>
          <p className="text-gray-600">
            Upload a photo of your crop or capture one using your camera to get instant disease detection and treatment recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Image</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Source
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    disabled={showCamera}
                    className="flex-1 bg-green-200 text-green-800 py-2 px-4 rounded-md hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {navigator.userAgent.includes('Mobile') ? 'Camera (Back)' : 'Open Camera'}
                  </button>
                  <label
                    htmlFor="file-upload"
                    className="flex-1 bg-green-200 text-green-800 py-2 px-4 rounded-md hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300 cursor-pointer text-center"
                  >
                    Upload File
                  </label>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    capture="environment"
                    onChange={onFileChange}
                  />
                </div>
                {navigator.userAgent.includes('Mobile') && (
                  <p className="text-xs text-gray-500 mt-1">
                    Camera defaults to back camera for better crop photos
                  </p>
                )}
              </div>

              {/* Unified Drag/Preview/Camera Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crop Image
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${isDragActive ? 'border-green-400 bg-green-50' : 'border-gray-300'}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onPaste={handlePaste}
                >
                  <div className="w-full space-y-2 text-center">
                    {showCamera ? (
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className={`w-full rounded-lg ${useBackCamera ? '' : 'transform scale-x-[-1]'}`}
                          style={{ maxHeight: '300px' }}
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex justify-center space-x-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-green-200 text-green-800 py-2 px-4 rounded-md hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-300"
                          >
                            Capture Photo
                          </button>
                          <button
                            type="button"
                            onClick={switchCamera}
                            className="bg-blue-200 text-blue-800 py-2 px-4 rounded-md hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
                          >
                            {useBackCamera ? 'Front Camera' : 'Back Camera'}
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                          >
                            Close Camera
                          </button>
                        </div>
                      </div>
                    ) : previewUrl ? (
                      <div>
                        <img src={previewUrl} alt="Preview" className="mx-auto max-h-64 rounded" />
                        <button
                          type="button"
                          onClick={clearPreview}
                          className="mt-3 text-red-600 hover:text-red-800 text-xs underline"
                        >
                          Remove
                        </button>
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
                        <div className="text-sm text-gray-600">
                          <p>Use camera, paste, or drag and drop an image</p>
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
                {uploadingImage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      <p className="text-blue-800 text-sm">Saving scan to history...</p>
                    </div>
                  </div>
                )}
                {(() => {
                  console.log('🔍 Rendering results with data:', result);
                  const res: any = (result as any)?.data || result;
                  console.log('📊 Processed result data:', res);
                  
                  if (res && res.isPlant === false) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-900 mb-2">Analysis</h3>
                        <p className="text-red-800 text-sm">Invalid plant picture</p>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Disease Detection</h3>
                        <p className="text-gray-700">{res?.disease || 'Unknown'}</p>
                        {typeof res?.confidence === 'number' && (
                          <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBadgeColor(res.confidence)}`}>
                            Confidence: {res.confidence}%
                          </div>
                        )}
                      </div>

                      {Array.isArray(res?.treatments) && res.treatments.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-900 mb-2">Treatment Recommendations</h3>
                          <ul className="text-blue-800 text-sm space-y-1">
                            {res.treatments.map((treatment: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-600 mr-2">•</span>
                                {treatment}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {Array.isArray(res?.prevention) && res.prevention.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="font-semibold text-green-900 mb-2">Prevention Tips</h3>
                          <ul className="text-green-800 text-sm space-y-1">
                            {res.prevention.map((tip: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-600 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {res?.marketImpact && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h3 className="font-semibold text-purple-900 mb-2">Market Impact</h3>
                          <p className="text-purple-800 text-sm">{res.marketImpact}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
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

        {/* Crop Production Insights */}
        <div className="mb-8">
          <CropProductionChart
            height={360}
            selectedCrop={result?.data?.crop || 'Rice'}
            state={'Karnataka'}
            availableStates={[
              'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh',
              'Telangana', 'Kerala', 'Gujarat', 'Rajasthan'
            ]}
            onChangeState={(newState) => {}}
          />
        </div>

        {/* History Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Scan History</h2>
              {scanHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kisan-green mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading scan history...</p>
              </div>
            ) : scanHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanHistory.map((scan) => (
                  <div key={scan.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">{scan.crop}</h3>
                        <p className="text-xs text-gray-600">{formatTimestamp(scan.timestamp)}</p>
                      </div>
                                             <button
                         onClick={() => removeFromHistory(scan.id!)}
                         className="text-red-500 hover:text-red-700 text-sm ml-2"
                       >
                         ×
                       </button>
                    </div>
                    
                                         <div className="mb-3">
                       {scan.imageData && (
                         <img 
                           src={`data:image/jpeg;base64,${scan.imageData}`}
                           alt={`${scan.crop} scan`} 
                           className="w-full h-24 object-cover rounded mb-2"
                         />
                       )}
                     </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Disease:</span>
                        <span className="text-xs font-medium text-gray-900">{scan.disease}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Confidence:</span>
                        <span className={`text-xs font-medium ${getConfidenceColor(scan.confidence)}`}>
                          {scan.confidence}%
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => loadFromHistory(scan)}
                      className="w-full mt-3 px-3 py-2 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors"
                    >
                      Load Result
                    </button>
                  </div>
                ))}
              </div>
            ) : (
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
                <p>No scan history yet</p>
                <p className="text-sm">Your crop scan results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropScanPage;
