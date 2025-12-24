import React, { useState, useRef } from 'react';
import { Upload, Download, ZoomIn, ImageIcon, Loader2, X } from 'lucide-react';
import './App.css';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [enhancedUrl, setEnhancedUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(4);
  const [originalZoomLevel, setOriginalZoomLevel] = useState(1);
  const [enhancementScale, setEnhancementScale] = useState(4);
  const [processingTime, setProcessingTime] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setEnhancedUrl(null);
      setError(null);
      setProcessingTime(null);
    } else {
      setError('Please select a valid image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setEnhancedUrl(null);
      setError(null);
      setProcessingTime(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('scale', enhancementScale.toString());

      const response = await fetch('http://127.0.0.1:4500/enhance', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Enhancement failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEnhancedUrl(url);
      
      const endTime = Date.now();
      setProcessingTime(((endTime - startTime) / 1000).toFixed(2));
    } catch (err) {
      setError('Failed to enhance image. Make sure the backend API is running at http://localhost:5000');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!enhancedUrl) return;
    
    const link = document.createElement('a');
    link.href = enhancedUrl;
    link.download = 'enhanced_image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setEnhancedUrl(null);
    setError(null);
    setProcessingTime(null);
    setEnhancementScale(4);
    setOriginalZoomLevel(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <h1 className="title">
            <ZoomIn className="title-icon" />
            AI Image Enhancer
          </h1>
          <p className="subtitle">
            Upscale your images using Real-ESRGAN AI
          </p>
        </div>

        {/* Upload Section */}
        {!previewUrl && (
          <div className="upload-container">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="upload-box"
            >
              <Upload className="upload-icon" />
              <p className="upload-text-main">
                Drop an image here or click to upload
              </p>
              <p className="upload-text-sub">
                Supports JPG, PNG, and other image formats
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="file-input"
              />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Image Processing Section */}
        {previewUrl && (
          <div className="processing-section">
            {/* Control Buttons */}
            <div className="controls">
              {/* Scale Selector */}
              <div className="scale-selector">
                <label className="scale-label">Enhancement Scale:</label>
                <select
                  value={enhancementScale}
                  onChange={(e) => setEnhancementScale(Number(e.target.value))}
                  className="scale-select"
                  disabled={isProcessing || enhancedUrl}
                >
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                  <option value={4}>4x</option>
                </select>
              </div>

              <button
                onClick={processImage}
                disabled={isProcessing || enhancedUrl}
                className="btn btn-primary"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="btn-icon spin" />
                    Processing...
                  </>
                ) : enhancedUrl ? (
                  <>
                    <ImageIcon className="btn-icon" />
                    Enhanced
                  </>
                ) : (
                  <>
                    <ZoomIn className="btn-icon" />
                    Enhance Image
                  </>
                )}
              </button>

              {enhancedUrl && (
                <button
                  onClick={downloadImage}
                  className="btn btn-success"
                >
                  <Download className="btn-icon" />
                  Download Enhanced
                </button>
              )}

              <button
                onClick={reset}
                className="btn btn-secondary"
              >
                <X className="btn-icon" />
                Reset
              </button>
            </div>

            {/* Processing Time */}
            {processingTime && (
              <div className="processing-time">
                ⏱️ Enhancement took {processingTime} seconds
              </div>
            )}

            {/* Image Comparison */}
            <div className="image-grid">
              {/* Original Image */}
              <div className="image-card">
                <div className="image-card-header">
                  <h3 className="image-card-title">
                    <ImageIcon className="card-icon" />
                    Original Image
                  </h3>
                  <div className="zoom-control">
                    <span className="zoom-label">Zoom:</span>
                    <select
                      value={originalZoomLevel}
                      onChange={(e) => setOriginalZoomLevel(Number(e.target.value))}
                      className="zoom-select"
                    >
                      <option value={1}>1x</option>
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                      <option value={4}>4x</option>
                    </select>
                  </div>
                </div>
                <div className="image-wrapper scrollable">
                  <img
                    src={previewUrl}
                    alt="Original"
                    className="image"
                    style={{ 
                      transform: `scale(${originalZoomLevel})`, 
                      transformOrigin: 'top left' 
                    }}
                  />
                </div>
              </div>

              {/* Enhanced Image with Zoom */}
              <div className="image-card">
                <div className="image-card-header">
                  <h3 className="image-card-title">
                    <ZoomIn className="card-icon" />
                    Enhanced Image ({enhancementScale}x)
                  </h3>
                  {enhancedUrl && (
                    <div className="zoom-control">
                      <span className="zoom-label">Zoom:</span>
                      <select
                        value={zoomLevel}
                        onChange={(e) => setZoomLevel(Number(e.target.value))}
                        className="zoom-select"
                      >
                        <option value={1}>1x</option>
                        <option value={2}>2x</option>
                        <option value={3}>3x</option>
                        <option value={4}>4x</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="image-wrapper scrollable">
                  {enhancedUrl ? (
                    <img
                      src={enhancedUrl}
                      alt="Enhanced"
                      className="image"
                      style={{ 
                        transform: `scale(${zoomLevel})`, 
                        transformOrigin: 'top left' 
                      }}
                    />
                  ) : (
                    <div className="placeholder">
                      {isProcessing ? (
                        <div className="placeholder-content">
                          <Loader2 className="placeholder-icon spin" />
                          <p>Enhancing your image...</p>
                        </div>
                      ) : (
                        <p>Click "Enhance Image" to process</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;