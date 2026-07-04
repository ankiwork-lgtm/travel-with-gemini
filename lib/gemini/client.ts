import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  tools: [{ googleSearchRetrieval: {} }],
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});
