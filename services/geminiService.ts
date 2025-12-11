
import { GoogleGenAI } from "@google/genai";
import { HealthMetric, LabReport } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeLabReport = async (
  fileBase64: string,
  mimeType: string
): Promise<{ summary: string; metrics: Record<string, string | number> }> => {
  const ai = getAiClient();
  if (!ai) {
    // Return mock response if no API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "This is a simulated analysis. The report indicates normal blood counts. Your cholesterol is slightly elevated (210 mg/dL), but your good cholesterol (HDL) is also high, which is good. Hemoglobin levels are healthy.",
          metrics: {
            "Hemoglobin": "14.5 g/dL",
            "WBC": "6.5 K/uL",
            "Platelets": "250 K/uL",
            "Total Cholesterol": "210 mg/dL"
          }
        });
      }, 2000);
    });
  }

  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a friendly medical AI assistant.
      
      TASK:
      Analyze the provided medical report/image.
      
      OUTPUT REQUIREMENTS:
      1. EXTRACT key health metrics (name, value, unit).
      2. GENERATE A SUMMARY that is EXTREMELY SIMPLE.
         - Imagine you are explaining this to someone with ZERO medical knowledge.
         - Do not use complex jargon without immediately explaining it in plain English.
         - Use analogies if possible.
         - Be reassuring.
         - Explicitly state if the results are good/normal or if they need attention, but use soft language (e.g., "slightly higher than usual" instead of "abnormal").
      
      Return ONLY a JSON object:
      {
        "summary": "Plain English explanation...",
        "metrics": { "Metric Name": "Value Unit", ... }
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw new Error("Failed to analyze report");
  }
};
export const analyzeInjury = async (
  fileBase64: string,
  mimeType: string
): Promise<any> => {
  const ai = getAiClient();
  if (!ai) {
    // Mock response for testing without API key
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          assessment: {
            injuryType: "Minor Cut / Abrasion",
            severity: "minor",
            bodyPart: "Hand/Finger",
            summary: "It appears to be a superficial cut with minimal bleeding."
          },
          firstAid: {
            steps: [
              "Wash your hands before touching the wound.",
              "Clean the area with cool water and mild soap.",
              "Pat dry with a clean cloth.",
              "Apply an antibiotic ointment if available.",
              "Cover with a sterile bandage."
            ],
            supplies: ["Water", "Mild Soap", "Clean Cloth", "Antibiotic Ointment", "Bandage"],
            whatNotToDo: ["Do not scrub the wound aggressively.", "Do not use hydrogen peroxide or iodine as it may irritate the tissue."]
          },
          medicalConsultation: {
            required: "Monitor",
            urgency: "If worsens",
            warningSigns: ["Increased redness", "Swelling", "Pus", "Fever", "Wound feels hot to touch"]
          },
          careTips: {
            painManagement: ["Over-the-counter pain relievers like Acetaminophen if needed."],
            timeline: "Should heal within 3-5 days.",
            followUp: "Check daily for signs of infection."
          },
          disclaimer: "This is AI-generated guidance. Consult a healthcare professional for serious injuries."
        });
      }, 2500);
    });
  }

  try {
    const prompt = `
      You are a medical first aid assistant. Analyze this image of an external injury carefully.
      
      Requirements:
      1. Identify the injury type, severity, and affected body part.
      2. Provide step-by-step first aid instructions.
      3. Recommend if medical consultation is needed and urgency level.
      4. Provide additional care tips.
      
      IMPORTANT: If the image is unclear or not an injury, state that in the assessment summary.
      
      Return JSON format:
      {
        "assessment": {
          "injuryType": "string",
          "severity": "minor" | "moderate" | "severe",
          "bodyPart": "string",
          "summary": "string"
        },
        "firstAid": {
          "steps": ["string"],
          "supplies": ["string"],
          "whatNotToDo": ["string"]
        },
        "medicalConsultation": {
          "required": "Yes" | "No" | "Monitor",
          "urgency": "Emergency" | "Within 24 hours" | "Within a week" | "If worsens",
          "warningSigns": ["string"]
        },
        "careTips": {
          "painManagement": ["string"],
          "timeline": "string",
          "followUp": "string"
        },
        "disclaimer": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini injury analysis failed:", error);
    throw new Error("Failed to analyze injury");
  }
};

export const analyzeMedication = async (
  fileBase64: string,
  mimeType: string
): Promise<any> => {
  const ai = getAiClient();
  if (!ai) {
    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          medicine_name: "Amoxicillin 500mg",
          dosage: "500mg",
          form: "Capsule",
          manufactured_date: "2023-05-10",
          expiry_date: "2025-05-10",
          manufacturer: "Sandoz",
          batch_number: "B78923",
          confidence: 0.95
        });
      }, 2000);
    });
  }

  try {
    const prompt = `
      Analyze this medicine packaging image and extract the following information in JSON format:
      - medicine_name: the full name of the medication (include both brand and generic names if visible)
      - manufactured_date: the date of manufacture (format: YYYY-MM-DD, or null if not visible)
      - expiry_date: the expiration date (format: YYYY-MM-DD, or null if not visible)
      - dosage: the dosage strength if visible (e.g., '500mg', '10ml')
      - form: the medicine form if visible (e.g., 'tablet', 'syrup', 'injection', 'capsule')
      - manufacturer: the company name if visible
      - batch_number: batch/lot number if visible

      Look for common indicators like 'MFG:', 'EXP:', 'Expiry:', 'Best Before:', 'Manufacturing Date:', 'Batch No:', 'Lot:', etc. 
      Be thorough in checking all visible text on the packaging. 
      Return ONLY valid JSON with no additional text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini medication analysis failed:", error);
    throw new Error("Failed to analyze medication");
  }
};

export const generateHealthInsights = async (
  metrics: any[]
): Promise<Array<{ title: string; description: string; severity: string }>> => {
  const ai = getAiClient();
  if (!ai) {
    return [
      {
        title: "Stable Heart Rate",
        description: "Your resting heart rate has been consistent over the last 7 days.",
        severity: "info"
      },
      {
        title: "Sleep Pattern",
        description: "You are averaging 6.5 hours of sleep. Try to reach 7.5 hours for better recovery.",
        severity: "warning"
      }
    ];
  }

  try {
    const prompt = `
      Analyze the following health metrics trends and generate 3 short, actionable insights for the user.
      Data: ${JSON.stringify(metrics.slice(0, 20))}
      
      Return a JSON array of objects: [{ "title": "...", "description": "...", "severity": "info"|"warning"|"alert" }]
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini insights failed:", error);
    return [];
  }
};

export const chatWithMedCoach = async (
  message: string,
  context: { metrics: HealthMetric[]; reports: LabReport[] }
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("I am MedCoach, your AI assistant. I see your simulated data. Your recent heart rate average is 72bpm, which is healthy. Your latest blood work shows normal levels.");
      }, 1000);
    });
  }

  try {
    // Prepare context data summary to stay within token limits
    const metricsSummary = context.metrics.slice(0, 30).map(m => `${m.type}: ${m.value} ${m.unit} on ${m.timestamp.split('T')[0]}`);
    const reportsSummary = context.reports.map(r => `Report ${r.fileName} (${r.uploadDate}): ${r.summary} Metrics: ${JSON.stringify(r.keyMetrics)}`);

    const systemInstruction = `
      You are MedCoach, a friendly and professional medical AI assistant.
      
      GOAL: Help users understand their health data in VERY SIMPLE terms.
      
      CONTEXT:
      User Health Metrics (recent):
      ${JSON.stringify(metricsSummary)}
      
      User Lab Reports:
      ${JSON.stringify(reportsSummary)}
      
      INSTRUCTIONS:
      1. Answer the user's question based on the provided context.
      2. If the user asks for a SUMMARY or "Detailed Report":
         - Provide a comprehensive overview of their vitals and lab results.
         - Highlight important stats (Heart Rate, Steps, recent Lab Results).
         - Explain what these numbers mean for their health in PLAIN ENGLISH.
         - Keep it encouraging.
      3. Always include a disclaimer that you are an AI and this is not professional medical advice.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response at this time.";
  } catch (error) {
    console.error("MedCoach chat failed:", error);
    return "I'm having trouble connecting to my medical database right now. Please try again later.";
  }
};
