
import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Globe, Server, UserCheck } from 'lucide-react';
import { AppRoute } from '../types';

interface PrivacyPolicyProps {
  onNavigate: (route: AppRoute) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => onNavigate(AppRoute.SETTINGS)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400">Last Updated: October 26, 2025</p>
        </div>
      </div>

      {/* Quick Summary Card */}
      <div className="bg-gradient-to-br from-primary-50 to-emerald-50 dark:from-slate-800 dark:to-slate-800/50 border border-primary-100 dark:border-slate-700 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white dark:bg-slate-700 p-2 rounded-lg shadow-sm">
            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Privacy at a Glance</h2>
        </div>
        <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
          At MedSync, we believe your health data belongs to you. We are committed to transparency and security. 
          This policy explains how we collect, use, and protect your personal and medical information. 
          We do not sell your data to third parties.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Lock, text: "Data is encrypted at rest and in transit." },
            { icon: Eye, text: "We do not sell your personal data." },
            { icon: Server, text: "Data stored on secure HIPAA-compliant servers." },
            { icon: UserCheck, text: "You have full control to export or delete your data." }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-white/60 dark:bg-slate-700/60 p-3 rounded-xl border border-white/50 dark:border-slate-600">
              <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 md:p-10 border border-slate-200 dark:border-slate-800 space-y-10">
        
        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. Information We Collect</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            We collect information to provide and improve our services. This includes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
            <li><strong>Personal Information:</strong> Name, email address, age, gender, and profile picture.</li>
            <li><strong>Health Data:</strong> Information you choose to sync from Apple Health, Google Fit, or Oura (e.g., heart rate, steps, sleep).</li>
            <li><strong>Medical Records:</strong> Lab reports, prescriptions, and images you upload for analysis.</li>
            <li><strong>Device Information:</strong> Device model, operating system, and unique identifiers for troubleshooting and security.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. How We Use Your Information</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Your data is used solely to power the MedSync experience:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
            <li>To visualize your health trends and timeline.</li>
            <li>To provide AI-powered analysis of your lab reports and health metrics.</li>
            <li>To generate personalized health insights and alerts.</li>
            <li>To allow you to share summaries with family members or healthcare providers (only at your explicit direction).</li>
            <li>To improve app performance and fix bugs.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. AI Analysis & Third Parties</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            We use Google Gemini API to analyze your documents and data. 
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border-l-4 border-primary-500">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong>Important:</strong> Data sent to our AI partners is anonymized where possible and is not used to train their public models. We do not share your data with advertisers or insurance companies.
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. Data Security</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            We implement industry-standard security measures, including AES-256 encryption for stored data and TLS 1.3 for data in transit. Access to your account is protected by strict authentication protocols.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Your Rights</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Under laws like GDPR and CCPA, you have the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
            <li><strong>Access:</strong> Request a copy of all data we hold about you.</li>
            <li><strong>Correction:</strong> Update inaccurate or incomplete information.</li>
            <li><strong>Deletion:</strong> Request permanent deletion of your account and data.</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Children's Privacy</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            MedSync is not intended for use by children under the age of 13 without parental consent. We do not knowingly collect personal data from children under 13. If you are a parent or guardian and believe your child has provided us with personal data, please contact us.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Contact Us</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at:
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
            <p className="text-slate-900 dark:text-white font-medium">MedSync Privacy Team</p>
            <p className="text-primary-600 dark:text-primary-400">privacy@medsync.app</p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">123 Health Way, San Francisco, CA 94105</p>
          </div>
        </section>

      </div>
      
      <div className="text-center pt-8 border-t border-slate-200 dark:border-slate-800">
         <p className="text-slate-400 text-sm">© 2025 MedSync Inc. All rights reserved.</p>
      </div>
    </div>
  );
};
