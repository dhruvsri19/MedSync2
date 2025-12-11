
import React, { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { analyzeLabReport } from '../services/geminiService';
import { LabReport } from '../types';

interface UploadProps {
  onAddReport: (report: LabReport) => void;
  reports: LabReport[];
}

export const Upload: React.FC<UploadProps> = ({ onAddReport, reports }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // Extract base64 data only (remove data:image/jpeg;base64, prefix)
        const base64Data = base64String.split(',')[1];
        
        try {
          const analysis = await analyzeLabReport(base64Data, file.type);
          
          const newReport: LabReport = {
            id: Date.now().toString(),
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            status: 'analyzed',
            summary: analysis.summary,
            keyMetrics: analysis.metrics
          };
          
          onAddReport(newReport);
        } catch (err) {
          setError("Failed to analyze report with Gemini.");
          console.error(err);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error reading file.");
      setUploading(false);
    }
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload Lab Reports</h1>
        <p className="text-slate-500 dark:text-slate-400">Upload PDF or images of your medical reports for AI analysis.</p>
      </div>

      <div 
        className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors ${
          isDragOver 
            ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/20' 
            : 'border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4 mx-auto" />
            <p className="text-slate-900 dark:text-white font-medium">Analyzing with Gemini AI...</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Extracting vital metrics and generating summary.</p>
          </div>
        ) : (
          <>
            <div className="bg-slate-200 dark:bg-slate-700 p-4 rounded-full mb-4">
              <UploadIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Drag & Drop your report here</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 text-center max-w-sm">
              Supports JPG, PNG, and PDF formats. We secure all data with HIPAA-compliant encryption.
            </p>
            <label className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium cursor-pointer transition-colors shadow-lg shadow-primary-500/30">
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
              />
            </label>
          </>
        )}
        {error && <p className="text-rose-500 mt-4 text-sm">{error}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Reports</h3>
        {reports.length === 0 ? (
          <div className="text-slate-500 text-center py-10 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            No reports uploaded yet.
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary-500 dark:text-primary-400" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{report.fileName}</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Uploaded {new Date(report.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                    report.status === 'analyzed' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              
              {report.summary && (
                <div className="p-4">
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{report.summary}</p>
                  
                  {report.keyMetrics && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(report.keyMetrics).map(([key, value]) => (
                        <div key={key} className="bg-slate-100 dark:bg-slate-900/50 p-2 rounded border border-slate-200 dark:border-slate-700/50">
                          <div className="text-xs text-slate-500 uppercase">{key}</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
