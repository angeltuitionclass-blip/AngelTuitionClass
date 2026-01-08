
import { GoogleGenAI, Type } from "@google/genai";
import { Student, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStudentReport = async (student: Student, selectedTraits: string[], lang: Language, teacherName: string) => {
  const behaviorSummary = student.behaviors
    .slice(0, 8)
    .map(b => `- ${b.label}`)
    .join('\n');

  const traitList = selectedTraits.join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a warm, empathetic, and experienced primary school teacher named ${teacherName}.
    You are writing a short, heart-felt letter to the parents of ${student.name}.
    
    Specific points to include: ${traitList}.
    Recent classroom observations:
    ${behaviorSummary}
    
    Student's total achievement: ${student.points} stars.
    
    INSTRUCTIONS:
    - Write as if you are ${teacherName}, a real human teacher who genuinely cares about the student.
    - DO NOT use templates or rigid bullet points.
    - Use a conversational, encouraging, and natural tone.
    - Start with a friendly greeting and end with a warm closing, signed as ${teacherName}.
    - Avoid using the word "Summary" or "Report". It's a "Progress Note".
    - Output Language: ${lang === 'zh' ? 'Naturally written Chinese with a short English translation below' : 'Naturally written English with a short Chinese translation below'}.`,
  });

  return response.text;
};

export const generateTuitionReceipt = async (student: Student, amount: number, month: string, lang: Language, academyName: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a warm and professional Payment Confirmation / Receipt for:
    Student Name: ${student.name}
    Amount Paid: RM ${amount}
    Payment Period: ${month}
    Academy/School Name: ${academyName}
    
    Tone: Appreciative and professional.
    Include a "Tip for Learning at Home" related to ${month}'s theme at the bottom.
    Output Language: Bilingual ${lang === 'zh' ? 'Chinese-English' : 'English-Chinese'}.`,
  });

  return response.text;
};

export const generateGameQuestion = async (subject: 'Math' | 'English' | 'Chinese' | 'Malay', grade: number, lang: Language) => {
  const prompt = {
    Math: `Generate 5 fun math puzzles for Grade ${grade}. Format: JSON. Lang: ${lang === 'zh' ? 'Chinese/English' : 'English'}.`,
    English: `Generate 5 English challenges for Grade ${grade}. Format: JSON.`,
    Chinese: `Generate 5 Chinese challenges for Grade ${grade}. Format: JSON.`,
    Malay: `Generate 5 BM challenges for Grade ${grade}. Format: JSON.`
  }[subject];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING }
          },
          required: ["question", "options", "answer"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};
