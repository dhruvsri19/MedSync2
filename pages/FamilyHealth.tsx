import React, { useState, useEffect } from 'react';
import { Plus, FileText, Upload as UploadIcon, Loader2, User, Settings, Activity, Weight, Calendar, ShieldCheck, AlertCircle, Info, CheckCircle, Trash2, Edit2, ChevronDown, Users, AlertTriangle, X } from 'lucide-react';
import { FamilyMember, LabReport, Insight } from '../types';
import { analyzeLabReport } from '../services/geminiService';
import { MOCK_INSIGHTS } from '../services/mockData';

interface FamilyHealthProps {
  members: FamilyMember[];
  reports: LabReport[];
  onAddMember: (member: FamilyMember) => void;
  onAddReport: (report: LabReport) => void;
  onUpdateMember: (member: FamilyMember) => void;
  onRemoveMember: (id: string) => void;
}

type Tab = 'overview' | 'records' | 'vaccinations';

export const FamilyHealth: React.FC<FamilyHealthProps> = ({ members, reports, onAddMember, onAddReport, onUpdateMember, onRemoveMember }) => {
  // Select the first member by default if available
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members.length > 0 ? members[0].id : '');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  // Modal states
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState('');
  const [newMemberAge, setNewMemberAge] = useState('');

  // Manage Menu States
  const [isManageMenuOpen, setIsManageMenuOpen] = useState(false);
  const [isRemoveConfirmOpen, setIsRemoveConfirmOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState('');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const selectedMember = members.find(m => m.id === selectedMemberId);
  const memberReports = selectedMember 
    ? reports.filter(r => r.memberId === selectedMember.id)
    : [];

  // Mock alerts for family members (filtered by mock logic)
  const memberAlerts = MOCK_INSIGHTS.slice(0, 2); 

  // Auto-select a member if current selection is removed
  useEffect(() => {
    if (members.length > 0 && !members.find(m => m.id === selectedMemberId)) {
        setSelectedMemberId(members[0].id);
    }
  }, [members, selectedMemberId]);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    const colors = ['bg-rose-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-cyan-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newId = `f-${Date.now()}`;
    onAddMember({
      id: newId,
      name: newMemberName,
      relation: newMemberRelation,
      age: parseInt(newMemberAge) || 0,
      avatarColor: randomColor
    });
    
    setSelectedMemberId(newId);
    setIsAddingMember(false);
    setNewMemberName('');
    setNewMemberRelation('');
    setNewMemberAge('');
  };

  const handleUpdateRelationship = () => {
     if (selectedMember && editingRelationship) {
         onUpdateMember({ ...selectedMember, relation: editingRelationship });
         setIsRelationshipModalOpen(false);
     }
  };

  const handleRemoveMember = () => {
      onRemoveMember(selectedMemberId);
      setIsRemoveConfirmOpen(false);
      setIsManageMenuOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMember || !e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    setUploading(true);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        try {
          const analysis = await analyzeLabReport(base64Data, file.type);
          
          const newReport: LabReport = {
            id: `fr-${Date.now()}`,
            memberId: selectedMember.id,
            fileName: file.name,
            uploadDate: new Date().toISOString(),
            status: 'analyzed',
            summary: analysis.summary,
            keyMetrics: analysis.metrics
          };
          
          onAddReport(newReport);
          setActiveTab('records'); // Switch to records tab to see the new upload
        } catch (err) {
          setUploadError("Failed to analyze report.");
          console.error(err);
        } finally {
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadError("Error reading file.");
      setUploading(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'alert': return AlertCircle;
      case 'warning': return Info;
      default: return CheckCircle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'alert': return 'text-rose-500 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/20 border-rose-200 dark:border-rose-900';
      case 'warning': return 'text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900';
      default: return 'text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900';
    }
  };

  // If no members exist, show empty state
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-300 dark:border-slate-700">
          <User className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Family Health</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md text-center">
          Create profiles for your family members to manage their health records, track vitals, and get AI insights for everyone.
        </p>
        <button 
          onClick={() => setIsAddingMember(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add First Family Member
        </button>

        {isAddingMember && renderAddMemberModal()}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Member Selector - Responsive negative margins to bleed to edge */}
      <div className="flex items-center gap-4 overflow-x-auto py-10 px-4 -mx-4 md:-mx-8 md:px-8 scrollbar-hide">
        {members.map(member => (
          <button
            key={member.id}
            onClick={() => { setSelectedMemberId(member.id); setIsManageMenuOpen(false); }}
            className={`flex flex-col items-center gap-2 min-w-[80px] transition-all duration-200 outline-none group ${
              selectedMemberId === member.id ? 'opacity-100 scale-110' : 'opacity-60 hover:opacity-80 hover:scale-105'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 transition-all duration-200 ${
              selectedMemberId === member.id 
                ? 'border-primary-400 ring-4 ring-primary-500/20 z-10' 
                : 'border-transparent group-hover:border-slate-400 dark:group-hover:border-slate-600'
            } ${member.avatarColor}`}>
              {member.name.charAt(0)}
            </div>
            <span className={`text-sm font-medium whitespace-nowrap ${
              selectedMemberId === member.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
            }`}>
              {member.name.split(' ')[0]}
            </span>
          </button>
        ))}
        
        <button
          onClick={() => setIsAddingMember(true)}
          className="flex flex-col items-center gap-2 min-w-[80px] group"
        >
          <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 border-dashed flex items-center justify-center text-slate-400 group-hover:text-primary-500 group-hover:border-primary-500 transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-slate-500 group-hover:text-slate-400">Add New</span>
        </button>
      </div>

      {selectedMember && (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl flex-shrink-0 ${selectedMember.avatarColor}`}>
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{selectedMember.name}</h1>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                  <span>{selectedMember.relation}</span>
                  <span>•</span>
                  <span>Born {new Date().getFullYear() - selectedMember.age}</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 relative">
               {/* Manage Menu */}
               <div className="relative">
                 <button 
                   onClick={() => setIsManageMenuOpen(!isManageMenuOpen)}
                   className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                 >
                   <Settings className="w-4 h-4 text-slate-400" />
                   Manage
                   <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isManageMenuOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {isManageMenuOpen && (
                   <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                     <button 
                       onClick={() => {
                         setEditingRelationship(selectedMember.relation);
                         setIsRelationshipModalOpen(true);
                         setIsManageMenuOpen(false);
                       }}
                       className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors"
                     >
                       <Users className="w-4 h-4 text-slate-400" />
                       Change Relationship
                     </button>
                     <div className="h-px bg-slate-100 dark:bg-slate-700 mx-2"></div>
                     <button 
                       onClick={() => {
                         setIsRemoveConfirmOpen(true);
                         setIsManageMenuOpen(false);
                       }}
                       className="w-full text-left px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors"
                     >
                       <Trash2 className="w-4 h-4" />
                       Remove Member
                     </button>
                   </div>
                 )}
               </div>

               {/* Click outside to close helper - simplistic overlay */}
               {isManageMenuOpen && (
                 <div className="fixed inset-0 z-10" onClick={() => setIsManageMenuOpen(false)}></div>
               )}

              <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
                Upload Record
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-8 overflow-x-auto">
              <TabButton 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
                label="Overview" 
              />
              <TabButton 
                active={activeTab === 'records'} 
                onClick={() => setActiveTab('records')} 
                label="Medical Records" 
              />
              <TabButton 
                active={activeTab === 'vaccinations'} 
                onClick={() => setActiveTab('vaccinations')} 
                label="Vaccinations (Coming Soon)" 
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[300px]">
            {activeTab === 'overview' && renderOverview(selectedMember, memberReports)}
            {activeTab === 'records' && renderRecords(memberReports)}
            {activeTab === 'vaccinations' && renderVaccinations()}
          </div>
        </>
      )}

      {isAddingMember && renderAddMemberModal()}
      {isRemoveConfirmOpen && renderRemoveConfirmModal()}
      {isRelationshipModalOpen && renderRelationshipModal()}
    </div>
  );

  function renderOverview(member: FamilyMember, reports: LabReport[]) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-100 dark:bg-rose-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-rose-500" />
              </div>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Blood Pressure</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">120/80</span>
              <span className="text-slate-500 dark:text-slate-500 text-sm">mmHg</span>
            </div>
            <p className="text-emerald-500 dark:text-emerald-400 text-xs mt-2 font-medium">Normal Range</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl">
                <Weight className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Weight</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">72</span>
              <span className="text-slate-500 dark:text-slate-500 text-sm">kg</span>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2">Updated 2 weeks ago</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl relative overflow-hidden group hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Latest Report</h3>
            {reports.length > 0 ? (
              <>
                 <div className="text-lg font-bold text-slate-900 dark:text-white truncate w-full" title={reports[0].fileName}>
                   {reports[0].fileName}
                 </div>
                 <p className="text-slate-500 text-xs mt-2">
                   {new Date(reports[0].uploadDate).toLocaleDateString()}
                 </p>
              </>
            ) : (
              <div className="text-slate-900 dark:text-white font-medium">No recent reports</div>
            )}
            <p className="text-slate-500 text-xs mt-2">-</p>
          </div>
        </div>

        {/* Recent Alerts Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Alerts for {member.name}</h3>
          <div className="grid gap-4">
             {memberAlerts.length > 0 ? (
               memberAlerts.map(alert => {
                 const Icon = getSeverityIcon(alert.severity);
                 const colorClass = getSeverityColor(alert.severity);
                 return (
                    <div key={alert.id} className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex gap-4 shadow-sm">
                       <div className={`p-2 rounded-lg h-fit border ${colorClass}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className="font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                         <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{alert.description}</p>
                         <p className="text-xs text-slate-500 mt-2">{new Date(alert.date).toLocaleDateString()}</p>
                       </div>
                    </div>
                 );
               })
             ) : (
                <div className="text-slate-500 text-sm p-4 bg-white/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  No recent alerts for this member.
                </div>
             )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Uploads</h3>
          {reports.length > 0 ? (
             <div className="space-y-4">
               {reports.slice(0, 3).map(report => (
                 <div key={report.id} className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                         <FileText className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                       </div>
                       <div>
                         <h4 className="font-medium text-slate-900 dark:text-white">{report.fileName}</h4>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Uploaded on {new Date(report.uploadDate).toLocaleDateString()}</p>
                       </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      {report.status}
                    </span>
                 </div>
               ))}
             </div>
          ) : (
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center bg-white/30 dark:bg-slate-800/20">
              <p className="text-slate-500 dark:text-slate-400 mb-6">No records found for {member.name}.</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors cursor-pointer shadow-sm">
                <UploadIcon className="w-4 h-4" />
                Upload First Record
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderRecords(reports: LabReport[]) {
    if (reports.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
           <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
             <FileText className="w-8 h-8 text-slate-500 dark:text-slate-600" />
           </div>
           <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No medical records yet</h3>
           <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
             Upload lab results, prescriptions, or check-up reports to store them securely and get AI insights.
           </p>
           <label className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-lg shadow-primary-500/30">
              <UploadIcon className="w-5 h-5" />
              Upload Document
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
        </div>
      );
    }

    return (
      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {reports.map(report => (
          <div key={report.id} className="bg-white/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-sm">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{report.fileName}</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(report.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                report.status === 'analyzed' 
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900' 
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
              }`}>
                {report.status}
              </span>
            </div>
            
            {report.summary && (
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">{report.summary}</p>
                {report.keyMetrics && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(report.keyMetrics).map(([k, v]) => (
                      <div key={k} className="bg-white dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50">
                        <div className="text-xs text-slate-500 uppercase font-medium mb-1">{k}</div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderVaccinations() {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8 text-slate-500 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Vaccination Tracker Coming Soon</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          We are building a feature to help you track vaccination schedules for your whole family.
        </p>
      </div>
    );
  }

  function renderAddMemberModal() {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Family Member</h2>
          </div>
          <form onSubmit={handleCreateMember} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Name</label>
              <input 
                type="text" 
                required
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                placeholder="e.g. Sarah"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Relation</label>
                <select 
                  required
                  value={newMemberRelation}
                  onChange={e => setNewMemberRelation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="">Select...</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Age</label>
                <input 
                  type="number" 
                  required
                  value={newMemberAge}
                  onChange={e => setNewMemberAge(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                  placeholder="e.g. 32"
                />
              </div>
            </div>
            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsAddingMember(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function renderRemoveConfirmModal() {
    return (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                   <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
                   </div>
                   <div>
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Remove Member?</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                         Are you sure you want to remove <strong>{selectedMember?.name}</strong>? This action cannot be undone and will remove all their records.
                      </p>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-8">
                   <button 
                      onClick={() => setIsRemoveConfirmOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                   >
                      Cancel
                   </button>
                   <button 
                      onClick={handleRemoveMember}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-500 transition-colors font-medium shadow-lg shadow-rose-500/20"
                   >
                      Yes, Remove
                   </button>
                </div>
             </div>
          </div>
       </div>
    );
  }

  function renderRelationshipModal() {
      return (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
               <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Update Relationship</h2>
                  <button onClick={() => setIsRelationshipModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                     <X className="w-5 h-5" />
                  </button>
               </div>
               <div className="p-6">
                  <div className="mb-6">
                     <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Relation to you</label>
                     <select 
                        value={editingRelationship}
                        onChange={e => setEditingRelationship(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-primary-500"
                     >
                        <option value="Spouse">Spouse</option>
                        <option value="Child">Child</option>
                        <option value="Parent">Parent</option>
                        <option value="Sibling">Sibling</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
                  <button 
                     onClick={handleUpdateRelationship}
                     className="w-full px-4 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-500 transition-colors font-medium shadow-lg shadow-primary-500/20"
                  >
                     Save Changes
                  </button>
               </div>
            </div>
         </div>
      );
  }
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`pb-4 text-sm font-medium transition-colors relative whitespace-nowrap px-2 ${
      active ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    {label}
    {active && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
    )}
  </button>
);