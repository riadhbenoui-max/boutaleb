import { GoogleGenAI } from "@google/genai";

// Fix: use process.env.API_KEY directly as per the @google/genai guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAttendanceInsights = async (attendanceData: any): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بناءً على بيانات الغياب التالية: ${JSON.stringify(attendanceData)}. قدم تحليلاً مختصراً بالعربية لأبرز الاتجاهات (مثلاً: اليوم الأكثر غياباً، القسم الأكثر انضباطاً) واقتراحات لتحسين الحضور.`,
    });
    // Fix: access .text property directly (it's not a method) and handle undefined
    return response.text || "لا يمكن تحليل البيانات حالياً.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "تعذر الحصول على تحليلات الذكاء الاصطناعي حالياً.";
  }
};