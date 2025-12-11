
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Calendar, Clock, Camera, RefreshCw, Upload, AlertCircle, CheckCircle, Search, Scan, FileText, Image as ImageIcon } from 'lucide-react';
import { Medication } from '../types';
import { analyzeMedication } from '../services/geminiService';

interface MedicationsProps {
  medications: Medication[];
  onAdd: (med: Medication) => void;
  onUpdate: (med: Medication) => void;
  onDelete: (id: string) => void;
}

export const Medications: React.FC<MedicationsProps> = ({ medications, onAdd, onUpdate, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // UI state for "Analyzing..."
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // Camera & Stream Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Medication>>({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    form: 'Tablet',
    startDate: '',
    endDate: '',
    expiryDate: '',
    manufacturedDate: '',
    manufacturer: '',
    batchNumber: '',
    notes: ''
  });

  // Autocomplete State
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Expiry Warning
  const [expiryWarning, setExpiryWarning] = useState<string | null>(null);

  // Check expiry date whenever it changes
  useEffect(() => {
    if (formData.expiryDate) {
      const today = new Date();
      const expiry = new Date(formData.expiryDate);
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        setExpiryWarning('This medication has expired!');
      } else if (diffDays <= 30) {
        setExpiryWarning(`Expires in ${diffDays} days.`);
      } else {
        setExpiryWarning(null);
      }
    } else {
      setExpiryWarning(null);
    }
  }, [formData.expiryDate]);

  // Handle Autocomplete (Debounced)
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!formData.name || formData.name.length < 3) {
        setSuggestions([]);
        return;
      }
      
      try {
        // Mocking an API call or using OpenFDA if CORS permits (often problematic in pure client-side without proxy)
        // For robustness, we will try OpenFDA, fallback to mock.
        const response = await fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${formData.name}"*&limit=5`).catch(() => null);
        
        if (response && response.ok) {
           const data = await response.json();
           const names = data.results.map((r: any) => r.openfda.brand_name[0]).filter((n: string) => n);
           setSuggestions(Array.from(new Set(names)));
        } else {
           // Fallback Mock Data
           const mocks = [
             "Amoxicillin", "Atorvastatin", "Amlodipine", "Azithromycin", 
             "Ibuprofen", "Lisinopril", "Metformin", "Omeprazole", "Prednisone", "Tylenol"
           ].filter(n => n.toLowerCase().includes(formData.name!.toLowerCase()));
           setSuggestions(mocks);
        }
      } catch (e) {
        // Silent fail
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [formData.name]);

  const handleOpenModal = (med?: Medication) => {
    if (med) {
      setEditingMed(med);
      setFormData(med);
      setCapturedImage(med.photoUrl || null);
      setShowScanner(false);
      setIsSelectionMode(false);
    } else {
      setEditingMed(null);
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        form: 'Tablet',
        startDate: new Date().toISOString().split('T')[0],
      });
      setCapturedImage(null);
      setShowScanner(false);
      setIsSelectionMode(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    stopCamera();
    setIsModalOpen(false);
    setCapturedImage(null);
    setShowScanner(false);
    setIsSelectionMode(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Camera Logic ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError(null);
    } catch (err) {
      setCameraError("Unable to access camera. Please enter details manually.");
      setShowScanner(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (showScanner && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showScanner, capturedImage]);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
        processImage(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedImage(base64String);
        setIsSelectionMode(false);
        setShowScanner(true); // Show preview in scanner area
        processImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64Image: string) => {
    setIsScanning(true);
    try {
      // Clean base64 string
      const data = base64Image.split(',')[1];
      const result = await analyzeMedication(data, 'image/jpeg');
      
      // Auto-fill form
      setFormData(prev => ({
        ...prev,
        name: result.medicine_name || prev.name,
        dosage: result.dosage || prev.dosage,
        form: result.form || prev.form,
        manufacturedDate: result.manufactured_date || prev.manufacturedDate,
        expiryDate: result.expiry_date || prev.expiryDate,
        manufacturer: result.manufacturer || prev.manufacturer,
        batchNumber: result.batch_number || prev.batchNumber,
      }));
    } catch (error) {
      console.error("Scan failed", error);
      // Don't block UI, just let user manually enter
    } finally {
      setIsScanning(false);
      setShowScanner(false); // Move to form view
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMed = {
      ...formData,
      photoUrl: capturedImage || undefined,
      id: editingMed ? editingMed.id : Date.now().toString()
    } as Medication;

    if (editingMed) {
      onUpdate(finalMed);
    } else {
      onAdd(finalMed);
    }
    handleCloseModal();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Medication Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage prescriptions, track expiry, and set reminders.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary-500/30"
        >
          <Plus className="w-5 h-5" />
          <span>Add Medication</span>
        </button>
      </div>

      <div className="grid gap-4">
        {medications.length === 0 ? (
           <div className="text-slate-500 text-center py-10 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            No medications tracked yet.
          </div>
        ) : (
          medications.map((med) => (
            <div key={med.id} className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm relative overflow-hidden">
               {med.photoUrl && (
                 <div className="absolute top-0 right-0 w-24 h-full opacity-5 pointer-events-none">
                   <img src={med.photoUrl} alt="" className="w-full h-full object-cover" />
                 </div>
               )}
              <div className="flex items-start gap-4 z-10">
                <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center justify-center min-w-[80px]">
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">{med.dosage}</div>
                  <div className="text-[10px] text-emerald-500 uppercase font-semibold">{med.form || 'Tablet'}</div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{med.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-1 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{med.frequency}</span>
                    </div>
                    {med.expiryDate && (
                      <div className={`flex items-center gap-1 ${new Date(med.expiryDate) < new Date() ? 'text-rose-500 font-semibold' : ''}`}>
                        <AlertCircle className="w-3 h-3" />
                        <span>Exp: {med.expiryDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={() => handleOpenModal(med)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onDelete(med.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {editingMed ? <Edit2 className="w-5 h-5 text-primary-500" /> : <Plus className="w-5 h-5 text-primary-500" />}
                {editingMed ? 'Edit Medication' : 'Add Medication'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
              {isSelectionMode ? (
                <div className="p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 min-h-[400px] items-center">
                  <button
                    onClick={() => { setIsSelectionMode(false); setShowScanner(true); }}
                    className="flex flex-col items-center justify-center p-6 gap-4 border-2 border-dashed border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10 rounded-2xl hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all group h-full"
                  >
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-800/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Scan className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Scan Packaging</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Use camera to auto-fill</p>
                    </div>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 gap-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-all group h-full relative"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-800/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Upload Image</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Select from gallery</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setIsSelectionMode(false); setShowScanner(false); }}
                    className="flex flex-col items-center justify-center p-6 gap-4 border-2 border-dashed border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group h-full"
                  >
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Manual Entry</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Type details yourself</p>
                    </div>
                  </button>
                </div>
              ) : (
                <>
                  {/* SECTION 1: SCANNER */}
                  {showScanner ? (
                    <div className="bg-slate-900 relative aspect-video flex flex-col items-center justify-center overflow-hidden group">
                      {cameraError ? (
                         <div className="text-center p-6">
                            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
                            <p className="text-rose-200">{cameraError}</p>
                            <button onClick={() => setShowScanner(false)} className="mt-4 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium">
                              Enter Manually
                            </button>
                         </div>
                      ) : capturedImage ? (
                        <div className="relative w-full h-full">
                           <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                           {isScanning && (
                             <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center backdrop-blur-sm">
                               <RefreshCw className="w-12 h-12 text-primary-400 animate-spin mb-4" />
                               <p className="text-white font-medium text-lg">Analyzing Packaging...</p>
                             </div>
                           )}
                        </div>
                      ) : (
                        <>
                          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {/* Overlay Guides */}
                          <div className="absolute inset-0 border-[40px] border-black/50 z-10 pointer-events-none">
                             <div className="w-full h-full border-2 border-white/50 rounded-lg relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 -mt-1 -ml-1"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 -mt-1 -mr-1"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 -mb-1 -ml-1"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 -mb-1 -mr-1"></div>
                             </div>
                          </div>
                          
                          <div className="absolute bottom-6 z-20 flex gap-6 items-center">
                            <button 
                               onClick={() => setShowScanner(false)}
                               className="text-white text-sm bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-black/60 transition"
                            >
                              Manual Entry
                            </button>
                            <button 
                              onClick={captureImage}
                              className="w-16 h-16 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center hover:scale-105 transition active:scale-95 shadow-lg"
                            >
                              <div className="w-12 h-12 rounded-full bg-primary-600"></div>
                            </button>
                          </div>
                          <p className="absolute top-4 z-20 text-white/80 text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">Position packaging within frame</p>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Scanner Collapsed State (If image exists) */
                    capturedImage && !showScanner && (
                       <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <img src={capturedImage} alt="Reference" className="w-12 h-12 rounded object-cover border border-slate-300 dark:border-slate-600" />
                             <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Image Captured</p>
                                <button onClick={() => { setShowScanner(true); setCapturedImage(null); }} className="text-xs text-primary-600 hover:text-primary-500">Retake Photo</button>
                             </div>
                          </div>
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                       </div>
                    )
                  )}

                  {/* SECTION 2: MANUAL ENTRY FORM */}
                  {/* Hide form if scanner is active (unless image captured) */}
                  {(!showScanner || capturedImage) && (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                      
                      {/* Manual Entry Header (if scanner was skipped) */}
                      {!showScanner && !capturedImage && !editingMed && (
                        <div className="grid grid-cols-2 gap-3 mb-6">
                           <button 
                            type="button" 
                            onClick={() => setShowScanner(true)}
                            className="w-full py-3 border-2 border-dashed border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-900/10 rounded-xl text-primary-600 dark:text-primary-400 font-medium flex items-center justify-center gap-2 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-colors"
                          >
                            <Scan className="w-5 h-5" />
                            Scan Packaging
                          </button>
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-3 border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl text-indigo-600 dark:text-indigo-400 font-medium flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileUpload}
                            />
                            <Upload className="w-5 h-5" />
                            Upload Image
                          </button>
                        </div>
                      )}

                      <div className="relative">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Medicine Name <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={e => {
                              setFormData({...formData, name: e.target.value});
                              setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg pl-9 pr-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                            placeholder="Search medicine (e.g. Amoxicillin)"
                            autoComplete="off"
                          />
                        </div>
                        {/* Autocomplete Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute z-30 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                            {suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm text-slate-700 dark:text-slate-200"
                                onClick={() => {
                                  setFormData({...formData, name: suggestion});
                                  setShowSuggestions(false);
                                }}
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Dosage</label>
                          <input 
                            type="text" 
                            value={formData.dosage}
                            onChange={e => setFormData({...formData, dosage: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                            placeholder="e.g. 500mg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Form</label>
                          <select 
                            value={formData.form}
                            onChange={e => setFormData({...formData, form: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500 appearance-none"
                          >
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Injection">Injection</option>
                            <option value="Cream">Cream</option>
                            <option value="Drops">Drops</option>
                            <option value="Inhaler">Inhaler</option>
                            <option value="Patch">Patch</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Frequency</label>
                          <select 
                            value={formData.frequency}
                            onChange={e => setFormData({...formData, frequency: e.target.value as any})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                          >
                            <option value="Once daily">Once daily</option>
                            <option value="Twice daily">Twice daily</option>
                            <option value="Thrice daily">Thrice daily</option>
                            <option value="Custom">Custom</option>
                          </select>
                        </div>
                         <div>
                          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Manufacturer (Optional)</label>
                          <input 
                            type="text" 
                            value={formData.manufacturer || ''}
                            onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                            placeholder="e.g. Pfizer"
                          />
                        </div>
                      </div>

                      {/* Dates Section */}
                      <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Timeline & Expiry</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Start Date</label>
                            <input 
                              type="date" 
                              required
                              value={formData.startDate}
                              onChange={e => setFormData({...formData, startDate: e.target.value})}
                              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Expiry Date <span className="text-rose-500">*</span></label>
                            <input 
                              type="date" 
                              required
                              value={formData.expiryDate || ''}
                              onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                              className={`w-full bg-white dark:bg-slate-800 border rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-1 ${
                                expiryWarning ? 'border-amber-500 focus:border-amber-500' : 'border-slate-200 dark:border-slate-600 focus:border-primary-500'
                              }`}
                            />
                          </div>
                        </div>
                        
                        {expiryWarning && (
                           <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
                              <AlertCircle className="w-4 h-4" />
                              {expiryWarning}
                           </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Mfg Date</label>
                              <input 
                                type="date" 
                                value={formData.manufacturedDate || ''}
                                max={new Date().toISOString().split('T')[0]}
                                onChange={e => setFormData({...formData, manufacturedDate: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Batch #</label>
                              <input 
                                type="text" 
                                value={formData.batchNumber || ''}
                                onChange={e => setFormData({...formData, batchNumber: e.target.value})}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-primary-500"
                                placeholder="Lot/Batch"
                              />
                           </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Notes</label>
                        <textarea 
                          rows={2}
                          value={formData.notes || ''}
                          onChange={e => setFormData({...formData, notes: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                          placeholder="Take with food, avoid sunlight, etc."
                        />
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button 
                          type="button"
                          onClick={handleCloseModal}
                          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors shadow-lg shadow-primary-500/30 font-semibold"
                        >
                          {editingMed ? 'Save Changes' : 'Save Medication'}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
