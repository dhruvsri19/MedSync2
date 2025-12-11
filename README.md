# 🌙 MedSync — Unified Digital Health Records

MedSync is a **web-based digital health platform** that unifies wearable data, lab reports, medication logs, and family health information into one secure, AI-enhanced dashboard.  
Built with **Next.js**, **Supabase**, and **AI-driven analysis**, MedSync empowers users to understand their health, track wellness, manage medications, support family members, and access first-aid help — all through a polished, Apple-inspired dark interface.

---

## ✨ Features

### 🔗 1. Apple Health Data Import  
- Upload Apple Health `.zip` exports  
- Automatic XML → structured vitals conversion  
- Tracks heart rate, sleep, steps, calories and more 

---

### 🧪 2. Scan & Analyze Lab Reports (AI-Powered)  
- Upload PDF / JPG / PNG lab reports  
- AI extracts key markers (CBC, lipid profile, sugar levels, liver/kidney tests, etc.)  
- Automatically interprets results and builds structured medical data  
- Adds insights directly into the timeline  

---

### 💊 3. Medication Tracker (with Scan Option)  
- Scan medicine strips or boxes  
- Automatically recognize medication name, dosage, frequency  
- Set reminders and track adherence  
- Log side effects or treatment responses  

---

### 👨‍👩‍👧 4. Family Health Management  
- Manage multiple health profiles under one account  
- Each profile has its own timeline, lab reports, medications, and insights  
- Perfect for caregivers, parents, and elderly family members  

---

### 🧠 5. AI Insights & Trend Detection  
- Detects abnormal patterns in vitals  
- Highlights sleep inconsistencies and activity shifts  
- Interprets lab + wearable data together  
- Generates doctor-ready summaries  
- Provides non-medical, informational recommendations  

---

### 🆘 6. Quick Help Module  
#### 🩹 AI First Aid Assistant  
- Ask questions about burns, cuts, fainting, fever, etc.  
- AI provides step-by-step first-aid guidance (non-medical)  

#### 🚨 SOS Emergency Button  
- Alerts emergency contacts instantly  
- Shares live location + essential health info  
- Designed for real-time safety  

---

### 🗓 7. Unified Timeline of Health Notifications  
A complete chronological feed containing:  
- Wearable vitals  
- Medications taken  
- Lab result entries  
- AI insights  
- First-aid interactions  
- Activity changes  

---

### 🔒 8. Secure Authentication  
- Email + password login  
- Google OAuth  
- Supabase Auth + JWT  
- Row Level Security per user and per family profile  
- Encrypted storage for all uploaded health data  

---

## 🛠 Tech Stack

### Frontend  
- React + TypeScript  
- TailwindCSS  
- Recharts / Chart.js  
- Apple-style dark UI  

### AI Layer  
- Lab report extraction  
- Medication OCR scanning  
- Apple Health XML parser  
- Insight & trend engine  
- AI assisted first aid module  
- Doctor summary generator  






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
3. Run the app:
   `npm run dev`



   Roadmap

Google Fit integration

Real-time wearable sync

Doctor portal & appointment sharing

Personalized health score model

Offline PWA support

Multi-language support
