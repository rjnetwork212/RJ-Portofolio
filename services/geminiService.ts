import { GoogleGenAI, Type } from "@google/genai";
import type { FuturesTrade, TradeAnalysis } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we assume it's set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const tradeAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        overallSummary: { type: Type.STRING, description: "A brief, one-paragraph summary of the overall trading performance." },
        keyStrengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 key strengths observed from the trades." },
        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 main weaknesses or areas for improvement." },
        actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 2-3 concrete, actionable suggestions for the trader." },
        bestTrade: { 
            type: Type.OBJECT,
            properties: {
                pair: { type: Type.STRING },
                pnl: { type: Type.NUMBER },
                reason: { type: Type.STRING, description: "A brief explanation of why this was the best trade (e.g., good entry, strong trend ride)." }
            }
        },
        worstTrade: { 
            type: Type.OBJECT,
            properties: {
                pair: { type: Type.STRING },
                pnl: { type: Type.NUMBER },
                reason: { type: Type.STRING, description: "A brief explanation of why this was the worst trade (e.g., poor risk management, emotional decision)." }
            }
        },
    },
    required: ["overallSummary", "keyStrengths", "areasForImprovement", "actionableSuggestions", "bestTrade", "worstTrade"],
};

export const analyzeTradingPerformance = async (trades: FuturesTrade[]): Promise<TradeAnalysis> => {
  const closedTrades = trades.filter(t => t.status === 'CLOSED');
  if (closedTrades.length === 0) {
      throw new Error("No closed trades available for analysis.");
  }

  const tradeData = closedTrades.map(t => 
      `Trade: ${t.pair}, Type: ${t.type}, Entry: ${t.entryPrice}, Exit: ${t.exitPrice}, PnL: ${t.pnl.toFixed(2)} USD`
  ).join('\n');

  const prompt = `
    Analyze the following crypto futures trading history and provide a concise performance review.
    Focus on patterns, risk management, and potential biases.
    Do not give financial advice, but offer objective analysis of the provided data.
    
    Trading History:
    ${tradeData}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tradeAnalysisSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as TradeAnalysis;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI. Please check your API key and network connection.");
  }
};
