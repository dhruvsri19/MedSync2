
import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload as UploadIcon, X, Loader2, ShieldAlert, AlertTriangle, CheckCircle, Info, Stethoscope, ChevronDown, ChevronUp, Eye, EyeOff, Thermometer, Bandage, Phone, Users, SwitchCamera } from 'lucide-react';
import { analyzeInjury } from '../services/geminiService';
import { UserProfile } from '../types';
import { getRecommendedEmergencyNumber } from '../services/emergencyService';

interface AssessmentResult {
  assessment: {
    injuryType: string;
    severity: 'minor' | 'moderate' | 'severe';
    bodyPart: string;
    summary: string;
  };
  firstAid: {
    steps: string[];
    supplies: string[];
    whatNotToDo: string[];
  };
  medicalConsultation: {
    required: 'Yes' | 'No' | 'Monitor';
    urgency: string;
    warningSigns: string[];
  };
  careTips: {
    painManagement: string[];
    timeline: string;
    followUp: string;
  };
  disclaimer: string;
}

interface QuickHelpProps {
  userProfile?: UserProfile;
}

export const QuickHelp: React.FC<QuickHelpProps> = ({ userProfile }) => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blurImage, setBlurImage] = useState(true);
  
  // Drag & Drop State
  const [isDragOver, setIsDragOver] = useState(false);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Emergency SOS State
  const [sosActive, setSosActive] = useState(false);
  const [sosCount, setSosCount] = useState(3);

  const emergencyNumber = userProfile?.emergencyNumber || getRecommendedEmergencyNumber(userProfile?.country || 'United States');

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleSOS = () => {
    setSosActive(true);
    let count = 3;
    setSosCount(count);
    const interval = setInterval(() => {
      count -= 1;
      setSosCount(count);
      if (count <= 0) {
        clearInterval(interval);
        window.location.href = `tel:${emergencyNumber}`;
        // Simulate Alerting Family
        setTimeout(() => setSosActive(false), 2000);
      }
    }, 1000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosCount(3);
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      setError("Unable to access camera. Please check permissions or use upload.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImage(dataUrl);
        setBlurImage(true); // Default blur for injuries
        stopCamera();
        
        // Analyze immediately
        const base64Data = dataUrl.split(',')[1];
        analyzeImage(base64Data, 'image/jpeg');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setResult(null);
    
    // Basic validation
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size too large. Please use an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setImage(base64String);
      setBlurImage(true); 
      
      const base64Data = base64String.split(',')[1];
      analyzeImage(base64Data, file.type);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async (base64Data: string, mimeType: string) => {
    setAnalyzing(true);
    try {
      const analysis = await analyzeInjury(base64Data, mimeType);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setError("Unable to analyze image. Please try a clearer photo or try again later.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setBlurImage(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-rose-500 text-white border-rose-600';
      case 'moderate': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-emerald-500 text-white border-emerald-600';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
      
      {/* SOS Banner */}
      <div className="bg-rose-600 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-700 to-rose-500 z-0"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full animate-pulse">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Emergency SOS</h2>
            <p className="text-rose-100">
              Call {emergencyNumber} ({userProfile?.country || 'Local'}) & Alert Family
            </p>
          </div>
        </div>
        
        <div className="relative z-10 w-full md:w-auto">
          {sosActive ? (
            <button 
              onClick={cancelSOS}
              className="w-full md:w-auto bg-white text-rose-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-6 h-6" />
              Cancel Call ({sosCount}s)
            </button>
          ) : (
            <button 
              onClick={handleSOS}
              className="w-full md:w-auto bg-white text-rose-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 transform active:scale-95"
            >
              <Phone className="w-6 h-6 fill-current" />
              CALL {emergencyNumber} NOW
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
            <div className="bg-emerald-500 p-2 rounded-xl text-white">
              <Bandage className="w-6 h-6" />
            </div>
            AI First Aid Assistant
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Upload a photo of an injury for immediate care instructions.</p>
        </div>
        
        {/* Urgent Warning Banner */}
        {result?.medicalConsultation?.required === 'Yes' && (
          <div className="hidden md:flex items-center gap-3 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-xl animate-pulse">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold">Medical Attention Recommended</span>
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Disclaimer:</strong> This tool provides general information using AI. It is not a substitute for professional medical advice, diagnosis, or treatment. 
          <span className="font-bold block mt-1">Use the SOS button above for life-threatening emergencies.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload & Preview */}
        <div className="lg:col-span-1 space-y-6">
          {!image ? (
            <div 
              className={`bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all min-h-[400px] ${
                isDragOver 
                  ? 'border-primary-500 bg-primary-100/50 dark:bg-primary-900/20 scale-[1.02]' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-full mb-6">
                <Camera className="w-10 h-10 text-slate-500 dark:text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Analyze an Injury</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
                Take a photo or drag & drop an image to get instant first aid steps.
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <button 
                  onClick={startCamera}
                  className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white py-3.5 rounded-xl font-medium cursor-pointer transition-transform active:scale-95 shadow-lg shadow-primary-500/20"
                >
                  <Camera className="w-5 h-5" />
                  Take Photo
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-600 py-3.5 rounded-xl font-medium cursor-pointer transition-colors"
                >
                  <UploadIcon className="w-5 h-5" />
                  Upload from Gallery
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-4">Max 10MB • PNG, JPG</p>
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-4 shadow-sm relative overflow-hidden">
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-[3/4]">
                <img 
                  src={image} 
                  alt="Uploaded injury" 
                  className={`w-full h-full object-cover transition-all duration-500 ${blurImage ? 'blur-xl scale-110 opacity-50' : 'blur-0 scale-100 opacity-100'}`}
                />
                
                {/* Blur Toggle */}
                <button 
                  onClick={() => setBlurImage(!blurImage)}
                  className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
                  title={blurImage ? "Show Image" : "Blur Image"}
                >
                  {blurImage ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                {analyzing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                    <Loader2 className="w-12 h-12 text-white animate-spin mb-4" />
                    <p className="text-white font-medium text-lg animate-pulse">Analyzing Injury...</p>
                  </div>
                )}
              </div>
              
              {!analyzing && (
                <button 
                  onClick={handleReset}
                  className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Analyze Another
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
          {analyzing ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-6">
                <Stethoscope className="w-10 h-10 text-primary-600 dark:text-primary-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Consulting MedCoach AI...</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
                We are identifying the injury and generating specific first aid instructions. This may take a few seconds.
              </p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl">
              <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
              <h3 className="text-xl font-semibold text-rose-700 dark:text-rose-400 mb-2">Analysis Failed</h3>
              <p className="text-rose-600 dark:text-rose-300 mb-6">{error}</p>
              <button onClick={handleReset} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Try Again
              </button>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
              
              {/* Assessment Card */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
                      <ShieldAlert className="w-6 h-6 text-slate-700 dark:text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assessment</h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{result.assessment.bodyPart}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${getSeverityColor(result.assessment.severity)}`}>
                    {result.assessment.severity}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{result.assessment.injuryType}</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{result.assessment.summary}</p>
              </div>

              {/* Action Plan Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* First Aid Steps */}
                <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                       <Bandage className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                     </div>
                     <h3 className="font-bold text-slate-900 dark:text-white">First Aid Steps</h3>
                  </div>
                  <ul className="space-y-4 flex-1">
                    {result.firstAid.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold border border-emerald-200 dark:border-emerald-800">
                          {idx + 1}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {result.firstAid.supplies.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Needed Supplies</p>
                      <div className="flex flex-wrap gap-2">
                        {result.firstAid.supplies.map((item, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded text-xs font-medium border border-slate-200 dark:border-slate-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Recommendation */}
                <div className="flex flex-col gap-6">
                   <div className={`rounded-2xl p-6 border shadow-sm ${
                     result.medicalConsultation.required === 'Yes' 
                      ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' 
                      : result.medicalConsultation.required === 'Monitor'
                      ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                   }`}>
                     <div className="flex items-center gap-3 mb-3">
                       <Stethoscope className={`w-5 h-5 ${
                          result.medicalConsultation.required === 'Yes' ? 'text-rose-600' : 
                          result.medicalConsultation.required === 'Monitor' ? 'text-amber-600' : 'text-emerald-600'
                       }`} />
                       <h3 className={`font-bold ${
                          result.medicalConsultation.required === 'Yes' ? 'text-rose-900 dark:text-rose-100' : 
                          result.medicalConsultation.required === 'Monitor' ? 'text-amber-900 dark:text-amber-100' : 'text-emerald-900 dark:text-emerald-100'
                       }`}>Doctor Recommendation</h3>
                     </div>
                     <div className="space-y-2">
                       <div className="flex justify-between text-sm">
                         <span className="opacity-70">See Doctor?</span>
                         <span className="font-bold">{result.medicalConsultation.required}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="opacity-70">Urgency</span>
                         <span className="font-bold">{result.medicalConsultation.urgency}</span>
                       </div>
                     </div>
                   </div>

                   {/* Warning Signs */}
                   <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm flex-1">
                      <div className="flex items-center gap-3 mb-4">
                         <AlertTriangle className="w-5 h-5 text-amber-500" />
                         <h3 className="font-bold text-slate-900 dark:text-white">Watch For</h3>
                      </div>
                      <ul className="space-y-2">
                        {result.medicalConsultation.warningSigns.map((sign, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                             {sign}
                          </li>
                        ))}
                      </ul>
                   </div>
                </div>
              </div>

              {/* Additional Tips Accordion style */}
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Thermometer className="w-5 h-5 text-purple-500" />
                    Recovery & Care Tips
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Dos & Don'ts</h4>
                      <ul className="space-y-2">
                        {result.firstAid.whatNotToDo.map((dont, idx) => (
                           <li key={idx} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <X className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                              {dont}
                           </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Timeline</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">{result.careTips.timeline}</p>
                      
                      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pain Management</h4>
                      <ul className="space-y-1">
                        {result.careTips.painManagement.map((tip, idx) => (
                           <li key={idx} className="text-sm text-slate-700 dark:text-slate-300">• {tip}</li>
                        ))}
                      </ul>
                    </div>
                 </div>
              </div>

            </div>
          ) : (
            // Placeholder State for Right Column
            <div className="hidden lg:flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-slate-50/50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 rounded-2xl border-dashed">
               <ShieldAlert className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
               <h3 className="text-lg font-medium text-slate-400 dark:text-slate-500">Waiting for image...</h3>
               <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs mt-2">
                 Upload an image or take a photo to see the AI assessment here.
               </p>
            </div>
          )}
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col">
          <div className="relative flex-1 bg-black">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               className="absolute inset-0 w-full h-full object-cover"
             />
             <canvas ref={canvasRef} className="hidden" />
             
             {/* Overlay Guides */}
             <div className="absolute inset-0 pointer-events-none border-[40px] border-black/50 z-10">
               <div className="w-full h-full border-2 border-white/50 rounded-lg relative"></div>
             </div>
             
             <button 
               onClick={stopCamera}
               className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full backdrop-blur-md z-20"
             >
               <X className="w-6 h-6" />
             </button>
          </div>
          
          <div className="h-32 bg-black flex items-center justify-center gap-8 relative z-20">
             <button 
               onClick={capturePhoto}
               className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
             >
               <div className="w-full h-full bg-white rounded-full"></div>
             </button>
          </div>
        </div>
      )}
    </div>
  );
};
