import { GoogleGenAI, Type } from "@google/genai";
import { AgencyDetails } from "../types";

const parseAgencyText = async (rawText: string): Promise<AgencyDetails | null> => {
  if (!process.env.API_KEY) {
    console.warn("API Key is missing for Gemini Smart Parse");
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Parse the following raw text into structured agency contact information. 
      If a field is missing, leave it as an empty string. 
      Split long addresses into three lines if necessary.
      
      Raw Text:
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            addressLine1: { type: Type.STRING },
            addressLine2: { type: Type.STRING },
            addressLine3: { type: Type.STRING },
            cityCountry: { type: Type.STRING },
            phone: { type: Type.STRING },
            email: { type: Type.STRING },
          },
          required: ["companyName", "addressLine1", "phone", "email"]
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AgencyDetails;
    }
    return null;
  } catch (error) {
    console.error("Gemini parsing error:", error);
    throw error;
  }
};

export { parseAgencyText };