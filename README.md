🌐 MedSync — Unified Digital Health Platform with AI Insights

MedSync is a web-based digital health platform that unifies wearable data, lab reports, medication logs, and family health information into one secure, AI-enhanced dashboard.
Built with Next.js, Supabase, and AI-driven analysis, MedSync empowers users to understand their health, track wellness, manage their family’s records, and access critical first-aid support — all through a beautiful, Apple-inspired dark interface.

✨ Features
1. Apple Health Data Import
   Upload Apple Health .zip exports
   Automatic XML → structured vitals conversion
   Tracks:
      -Heart rate
      -Steps
      -Sleep
      -Calories

🧪 2. Scan & Analyze Lab Reports (AI-Powered)

   Upload PDF / JPG / PNG lab reports

   AI extracts key markers (CBC, Lipid Profile, LFT, KFT, Sugar, etc.)

   Provides interpretation + personalized feedback

   Stores the parsed data as structured medical insights

💊 3. Medication Tracker (with Scan Option)

   Scan pill strips or medicine boxes

   Auto-detect medication name and dosage

   Set reminders for timing and frequency

   Track adherence and missed doses

   Add notes / side effects over time

👨‍👩‍👧 4. Family Health Management

   Manage multiple profiles under a single account

   Each family member gets:
      -Their own timeline
      -Their own lab reports
      -Their own AI insights
      -Their own medication tracking

   Ideal for parents, caregivers, and elderly households

🧠 5. AI Insights & Trend Detection
   Identifies abnormal vital patterns

   Detects sleep inconsistencies

   Highlights changes in heart rate or steps

   Analyzes lab + wearable data together

   Generates doctor-ready summaries

   Provides non-medical, informational recommendations

🆘 6. Quick Help Module
   🩹 AI First Aid Assistant
      -Ask emergency-related questions (cut, burn, fainting, fever)
      -AI provides step-by-step non-medical first-aid guidance

   🚨 SOS Emergency Button
   One-tap action to:
      -Alert emergency contacts
      -Provide essential health info (optional)

🗓 7. Unified Timeline of Health Notifications

   Chronological stream of:
      -Vitals
      -Medications taken
      -Lab results
      -AI insights
      -First-aid interactions (optional)
      -Activity milestones
      -Gives users a complete view of their health journey

📟 8. Secure Authentication

   Email + password

   Row Level Security for each user and family profile

   Encrypted file storage for health reports

🛠 Tech Stack

Frontend:

   React + TypeScript

   TailwindCSS (Apple-like dark UI)
   
   Chart.js / Recharts

Backend:

Supabase (Postgres, Auth, RLS, Storage)

Edge Functions for parsing and heavy AI processing

AI Layer:

   Lab report extraction

   Medication OCR

   Apple Health XML processing

   Insight/trend generation

   First-aid conversational assistant

   Doctor summary creation










<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app
   
This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1SJke45xXgbzy0AVhjZCJLWJj3UGrzM6k

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. 3. Run the app:
   `npm run dev`


🧭 Roadmap

Wearable live sync (Web Bluetooth)

Multi-country units & medical ranges

Doctor portal & consult scheduling

Health score model

SmartSymptoms (AI symptom triage)

Offline PWA support

