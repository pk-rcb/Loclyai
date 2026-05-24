import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SmartReporter.css';
import { getAccessToken } from '../utils/api.js';

/**
 * SmartReporter
 *
 * A 5-step state machine for reporting civic issues:
 *   INPUT_METHOD → CAMERA/UPLOAD → ANALYZING → CONFIRMATION → SUCCESS
 *
 * Supports two input methods:
 *   1. Live camera capture via getUserMedia
 *   2. File upload with drag-and-drop
 *
 * Sends the image to FastAPI (localhost:8000/predict) for real YOLOv8 classification.
 *
 * @param {Function} onComplete - Called with report data after SUCCESS auto-redirect
 * @param {Function} onCancel   - Called when user taps "Back"
 */

const ML_API_URL = 'http://localhost:8000';

const SmartReporter = ({ onComplete, onCancel }) => {
  // ---- Step state machine ----
  const [step, setStep] = useState('INPUT_METHOD');

  // ---- Camera refs ----
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ---- Upload refs ----
  const fileInputRef = useRef(null);

  // ---- Captured photo data ----
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);

  // ---- AI classification result ----
  const [classification, setClassification] = useState(null);
  const [allDetections, setAllDetections] = useState([]);

  // ---- Editable complaint draft ----
  const [complaintDraft, setComplaintDraft] = useState('');

  // ---- Camera error state ----
  const [cameraError, setCameraError] = useState('');

  // ---- Location state ----
  const [locationError, setLocationError] = useState('');
  const [locationDisplay, setLocationDisplay] = useState('Fetching your location...');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Upload state ----
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);

  // ---- ML API error ----
  const [mlError, setMlError] = useState('');

  // ---- Loading state ----
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Fetch GPS location and human-readable address.
   */
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationDisplay('Geolocation not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsCoords({ lat, lng });
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
            headers: { 'User-Agent': 'LoclyAI-App/1.0 (admin@locly.ai)' }
          });
          if (response.ok) {
            const data = await response.json();
            setLocationDisplay(data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          } else {
            setLocationDisplay(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          }
        } catch (err) {
          setLocationDisplay(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        setLocationDisplay('Failed to get location. Please enable GPS.');
      },
      { enableHighAccuracy: true }
    );
  }, []);

  /**
   * Start the rear camera stream via getUserMedia.
   * Falls back to any camera if rear is unavailable.
   */
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access denied:', err);
      setCameraError('Camera access was denied. Please allow camera permissions and try again.');
    }
  }, []);

  /**
   * Stop all tracks on the camera stream.
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera when entering CAMERA step
  useEffect(() => {
    if (step === 'CAMERA') {
      startCamera();
    }
    return () => {
      if (step === 'CAMERA') {
        stopCamera();
      }
    };
  }, [step, startCamera, stopCamera]);

  /**
   * Send the captured/uploaded image to FastAPI for YOLOv8 inference.
   */
  const classifyImage = useCallback(async (blob) => {
    setIsAnalyzing(true);
    setMlError('');
    setStep('ANALYZING');

    try {
      const formData = new FormData();
      formData.append('file', blob, 'capture.jpg');

      const response = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.best_detection) {
        setMlError('No civic issues were detected in this image. Try capturing a clearer photo of the hazard.');
        setStep('ML_ERROR');
        return;
      }

      // Use the best detection
      const best = data.best_detection;
      setClassification(best);
      setAllDetections(data.detections || []);

      // Auto-generate complaint draft
      setComplaintDraft(
        `Subject: ${best.class_name} Detected — Civic Hazard Report\n\n` +
        `Dear Municipal Authority,\n\n` +
        `This is an AI-generated report submitted via LoclyAI.\n\n` +
        `Hazard Type: ${best.class_name}\n` +
        `AI Confidence: ${best.confidence}%\n` +
        `Location: GPS coordinates captured automatically.\n` +
        `Date: ${new Date().toLocaleDateString()}\n\n` +
        `A ${best.class_name.toLowerCase()} has been detected at the above location. ` +
        `Immediate attention is requested to prevent any harm to citizens.\n\n` +
        `Regards,\nLoclyAI Smart Reporter`
      );

      setStep('CONFIRMATION');
      fetchLocation(); // Start fetching GPS immediately when entering CONFIRMATION
    } catch (err) {
      console.error('ML API error:', err);
      setMlError(
        err.message.includes('Failed to fetch') || err.message.includes('NetworkError')
          ? 'Could not connect to the ML service. Make sure the FastAPI server is running on port 8000.'
          : `Classification failed: ${err.message}`
      );
      setStep('ML_ERROR');
    } finally {
      setIsAnalyzing(false);
    }
  }, [fetchLocation]);

  /**
   * Captures a frame from the live video feed onto a canvas,
   * converts it to a blob, and sends to the ML API.
   */
  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoUrl(dataUrl);

    // Stop camera
    stopCamera();

    // Convert canvas to blob for API upload
    canvas.toBlob(
      (blob) => {
        if (blob) {
          setPhotoBlob(blob);
          classifyImage(blob);
        }
      },
      'image/jpeg',
      0.85
    );
  };

  /**
   * Handle file selection from input or drag-and-drop.
   */
  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setMlError('Please select a valid image file (JPEG, PNG, etc.).');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setUploadPreview(previewUrl);
    setPhotoUrl(previewUrl);
    setPhotoBlob(file);

    // Send to ML API
    classifyImage(file);
  };

  /**
   * Handle drag events for the upload drop zone.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  /**
   * Submits the confirmed report and transitions to SUCCESS.
   * Uses pre-fetched GPS coordinates.
   */
  const handleConfirmPost = async () => {
    if (!gpsCoords) {
      setLocationError('Still waiting for GPS location. Please ensure location services are enabled and wait a moment.');
      return;
    }

    setIsSubmitting(true);
    setLocationError('');

    try {
      const formData = new FormData();
      formData.append('image', photoBlob, 'hazard.jpg');
      formData.append('description', complaintDraft);
      formData.append('latitude', gpsCoords.lat);
      formData.append('longitude', gpsCoords.lng);

      const token = getAccessToken();
      
      const response = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        setLocationError(data.error || 'Failed to submit report.');
        setIsSubmitting(false);
        return;
      }

      setStep('SUCCESS');
      setTimeout(() => {
        onComplete({
          classification: classification?.class_name,
          confidence: classification?.confidence,
          thumbnail: classification?.emoji,
          draft: complaintDraft,
        });
      }, 3000);

    } catch (err) {
      setLocationError('Network error. Failed to submit.');
      setIsSubmitting(false);
    }
  };

  /**
   * Reset state and go back to INPUT_METHOD selection.
   */
  const handleRetry = () => {
    setPhotoUrl(null);
    setPhotoBlob(null);
    setClassification(null);
    setAllDetections([]);
    setComplaintDraft('');
    setMlError('');
    setUploadPreview(null);
    setStep('INPUT_METHOD');
  };

  /**
   * Cleanup on unmount.
   */
  useEffect(() => {
    return () => {
      stopCamera();
      if (uploadPreview) {
        URL.revokeObjectURL(uploadPreview);
      }
    };
  }, [stopCamera, uploadPreview]);

  return (
    <div className="reporter">
      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ========== STEP 0: INPUT METHOD SELECTION ========== */}
      {step === 'INPUT_METHOD' && (
        <div className="reporter-step reporter-input-method">
          <div className="reporter-top-bar">
            <button className="reporter-back-btn" onClick={onCancel}>
              ← Back
            </button>
            <span className="reporter-step-label">Smart Reporter</span>
          </div>

          <div className="input-method-header">
            <h2 className="input-method-title">Report a Civic Issue</h2>
            <p className="input-method-subtitle">
              Choose how you'd like to capture the issue. Our AI will classify it instantly.
            </p>
          </div>

          <div className="input-method-cards">
            {/* Camera Card */}
            <button
              className="method-card method-card-camera"
              onClick={() => setStep('CAMERA')}
            >
              <div className="method-card-icon-wrapper method-card-icon-camera">
                <span className="method-card-icon">📷</span>
              </div>
              <span className="method-card-title">Live Camera</span>
              <span className="method-card-desc">
                Take a photo using your device camera in real-time
              </span>
              <span className="method-card-arrow">→</span>
            </button>

            {/* Upload Card */}
            <button
              className="method-card method-card-upload"
              onClick={() => setStep('UPLOAD')}
            >
              <div className="method-card-icon-wrapper method-card-icon-upload">
                <span className="method-card-icon">📁</span>
              </div>
              <span className="method-card-title">Upload Image</span>
              <span className="method-card-desc">
                Select an existing photo from your device gallery
              </span>
              <span className="method-card-arrow">→</span>
            </button>
          </div>

          <div className="input-method-footer">
            <span className="method-footer-icon">🤖</span>
            <span className="method-footer-text">Powered by YOLOv8 AI Vision Model</span>
          </div>
        </div>
      )}

      {/* ========== STEP 1a: CAMERA ========== */}
      {step === 'CAMERA' && (
        <div className="reporter-step reporter-camera">
          <div className="reporter-top-bar">
            <button className="reporter-back-btn" onClick={() => { stopCamera(); setStep('INPUT_METHOD'); }}>
              ← Back
            </button>
            <span className="reporter-step-label">Live Camera</span>
          </div>

          {cameraError ? (
            <div className="camera-error">
              <span className="camera-error-icon">📷</span>
              <p>{cameraError}</p>
              <button className="reporter-retry-btn" onClick={startCamera}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="camera-viewport">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera-video"
                />
                {/* Viewfinder overlay */}
                <div className="camera-viewfinder">
                  <div className="vf-corner vf-tl"></div>
                  <div className="vf-corner vf-tr"></div>
                  <div className="vf-corner vf-bl"></div>
                  <div className="vf-corner vf-br"></div>
                </div>
                <div className="camera-hint">Point at the civic hazard</div>
              </div>

              <button className="snap-btn" onClick={handleSnap}>
                <span className="snap-btn-icon">📸</span>
                Snap Hazard
              </button>
            </>
          )}
        </div>
      )}

      {/* ========== STEP 1b: UPLOAD ========== */}
      {step === 'UPLOAD' && (
        <div className="reporter-step reporter-upload">
          <div className="reporter-top-bar">
            <button className="reporter-back-btn" onClick={() => setStep('INPUT_METHOD')}>
              ← Back
            </button>
            <span className="reporter-step-label">Upload Image</span>
          </div>

          <div
            className={`upload-dropzone ${isDragging ? 'upload-dropzone-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            <div className="upload-dropzone-content">
              <div className="upload-icon-wrapper">
                <span className="upload-icon">☁️</span>
                <span className="upload-icon-arrow">↑</span>
              </div>
              <p className="upload-title">Drag & drop your image here</p>
              <p className="upload-subtitle">or click to browse files</p>
              <div className="upload-formats">
                <span className="upload-format-badge">JPG</span>
                <span className="upload-format-badge">PNG</span>
                <span className="upload-format-badge">WEBP</span>
                <span className="upload-format-badge">HEIC</span>
              </div>
            </div>
          </div>

          <div className="upload-hint">
            <span className="upload-hint-icon">💡</span>
            <span>For best results, upload a clear, well-lit photo of the civic issue</span>
          </div>
        </div>
      )}

      {/* ========== STEP 2: ANALYZING ========== */}
      {step === 'ANALYZING' && (
        <div className="reporter-step reporter-analyzing">
          <div className="analyzing-photo-wrapper">
            <img src={photoUrl} alt="Captured" className="analyzing-photo" />
            <div className="analyzing-overlay"></div>
            <div className="analyzing-spinner-wrapper">
              <div className="analyzing-spinner"></div>
              <p className="analyzing-text">AI is classifying the issue...</p>
              <p className="analyzing-subtext">YOLOv8 Vision Model Running</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 2b: ML ERROR ========== */}
      {step === 'ML_ERROR' && (
        <div className="reporter-step reporter-ml-error">
          <div className="ml-error-content">
            <div className="ml-error-icon-wrapper">
              <span className="ml-error-icon">⚠️</span>
            </div>
            <h3 className="ml-error-title">Classification Issue</h3>
            <p className="ml-error-message">{mlError}</p>
            <div className="ml-error-actions">
              <button className="ml-error-retry-btn" onClick={handleRetry}>
                🔄 Try Again
              </button>
              <button className="ml-error-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 3: CONFIRMATION ========== */}
      {step === 'CONFIRMATION' && (
        <div className="reporter-step reporter-confirmation">
          <div className="reporter-top-bar">
            <button className="reporter-back-btn" onClick={handleRetry}>
              ← Retake
            </button>
            <span className="reporter-step-label">Review Report</span>
          </div>

          {/* Photo with real YOLO bounding box */}
          <div className="confirmation-photo-wrapper">
            <img src={photoUrl} alt="Detected hazard" className="confirmation-photo" />
            {classification?.bbox && (
              <div
                className="yolo-bbox"
                style={{
                  top: `${classification.bbox.y1 * 100}%`,
                  left: `${classification.bbox.x1 * 100}%`,
                  width: `${(classification.bbox.x2 - classification.bbox.x1) * 100}%`,
                  height: `${(classification.bbox.y2 - classification.bbox.y1) * 100}%`,
                }}
              >
                <span className="yolo-label">
                  {classification?.class_name} — {classification?.confidence}%
                </span>
              </div>
            )}
          </div>

          {/* Classification result badge */}
          <div className="classification-result">
            <span className="classification-emoji">{classification?.emoji}</span>
            <div>
              <span className="classification-type">{classification?.class_name} Detected</span>
              <span className="classification-conf">{classification?.confidence}% Confidence</span>
            </div>
          </div>

          {/* Show additional detections if any */}
          {allDetections.length > 1 && (
            <div className="other-detections">
              <span className="other-detections-label">Other detections:</span>
              <div className="other-detections-list">
                {allDetections.slice(1, 4).map((det, i) => (
                  <span key={i} className="other-detection-badge">
                    {det.emoji} {det.class_name} ({det.confidence}%)
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Location Preview */}
          <div className="location-preview" style={{
            background: '#f8fafc',
            padding: '12px 16px',
            borderRadius: '12px',
            margin: '16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #e2e8f0',
            fontSize: '0.9rem',
            color: '#334155'
          }}>
            <span style={{ fontSize: '1.2rem' }}>📍</span>
            <span style={{ fontWeight: '500', lineHeight: '1.4' }}>{locationDisplay}</span>
          </div>

          {/* Editable complaint draft */}
          <div className="draft-section">
            <label className="draft-label">Auto-Generated Complaint Draft</label>
            <textarea
              className="draft-textarea"
              value={complaintDraft}
              onChange={(e) => setComplaintDraft(e.target.value)}
              rows={8}
            />
          </div>

          {locationError && (
            <div className="aform-error" style={{marginBottom: '15px'}}>{locationError}</div>
          )}

          <button className="confirm-btn" onClick={handleConfirmPost} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting & Getting GPS...' : '✅ Confirm & Post'}
          </button>
        </div>
      )}

      {/* ========== STEP 4: SUCCESS ========== */}
      {step === 'SUCCESS' && (
        <div className="reporter-step reporter-success">
          <div className="success-content">
            <div className="success-checkmark">✓</div>
            <h2 className="success-title">Report Submitted!</h2>
            <p className="success-subtitle">
              Your complaint has been sent to the municipality. Redirecting to dashboard...
            </p>
            <div className="success-progress">
              <div className="success-progress-bar"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartReporter;
