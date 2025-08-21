import React, { useState, useRef, useEffect } from 'react';
import { cropHealthAPI } from '../services/cropHealthService';

const CropScanPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [useBackCamera, setUseBackCamera] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

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

    try {
      setLoading(true);
      setError(null);

      const response = await cropHealthAPI.analyzeCrop({
        image: file
      });
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze crop image');
    } finally {
      setLoading(false);
    }
  };

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
                {(() => {
                  const res: any = (result as any)?.data || result;
                  if (res && res.isPlant === false) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-900 mb-2">Analysis</h3>
                        <p className="text-red-800 text-sm">invalid plant picture</p>
                      </div>
                    );
                  }
                  return (
                    <>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Disease Detection</h3>
                        <p className="text-gray-700">{res?.disease || 'Unknown'}</p>
                        {typeof res?.confidence === 'number' && (
                          <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            res.confidence > 80 ? 'bg-green-100 text-green-800' :
                            res.confidence > 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
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
