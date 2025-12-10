
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
          summary: "This is a simulated analysis. Please configure a valid API_KEY to use real Gemini analysis. The report indicates normal blood counts with slightly elevated cholesterol levels.",
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
      You are a medical AI assistant. Analyze this lab report image/document.
      1. Extract key health metrics (name, value, unit).
      2. Provide a concise summary for the patient (non-medical advice, just summary).
      3. Return ONLY a JSON object with this structure:
      {
        "summary": "...",
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
        resolve("I am MedCoach, your AI assistant. I see your simulated data. In a production environment with a valid API key, I would analyze your specific trends and lab reports to answer your question detailedly.");
      }, 1000);
    });
  }

  try {
    // Prepare context data summary to stay within token limits
    const metricsSummary = context.metrics.slice(0, 30).map(m => `${m.type}: ${m.value} ${m.unit} on ${m.timestamp.split('T')[0]}`);
    const reportsSummary = context.reports.map(r => `Report ${r.fileName} (${r.uploadDate}): ${r.summary} Metrics: ${JSON.stringify(r.keyMetrics)}`);

    const systemInstruction = `
      You are MedCoach, a friendly and professional medical AI assistant.
      Your goal is to help users understand their health data.
      
      CONTEXT:
      User Health Metrics (recent):
      ${JSON.stringify(metricsSummary)}
      
      User Lab Reports:
      ${JSON.stringify(reportsSummary)}
      
      INSTRUCTIONS:
      1. Answer the user's question based on the provided context.
      2. If the user asks about trends, look at the metrics.
      3. If the user asks about blood work or specific test results, look at the lab reports.
      4. Always include a disclaimer that you are an AI and this is not professional medical advice.
      5. Keep answers concise and easy to understand.
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
