
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Job, Client } from '../types';

// Ensure API_KEY is set in your environment variables
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY for Gemini is not set. AI Assistant will not work. Please set process.env.API_KEY.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;
const MODEL_NAME = 'gemini-2.5-flash-preview-04-17'; // Recommended model

interface AppContextData {
  jobs: Job[];
  clients: Client[];
}

const formatDataForPrompt = (data: AppContextData): string => {
  let contextString = "Dados do Sistema:\n";
  contextString += "--- Jobs ---\n";
  if (data.jobs.length > 0) {
    data.jobs.forEach(job => {
      const clientName = data.clients.find(c => c.id === job.clientId)?.name || 'Desconhecido';
      contextString += `Nome: ${job.name}, Cliente: ${clientName}, Valor: R$${job.value}, Prazo: ${new Date(job.deadline).toLocaleDateString('pt-BR')}, Status: ${job.status}, Tipo: ${job.serviceType}\n`;
    });
  } else {
    contextString += "Nenhum job cadastrado.\n";
  }
  
  contextString += "\n--- Clientes ---\n";
  if (data.clients.length > 0) {
    data.clients.forEach(client => {
      const clientJobs = data.jobs.filter(j => j.clientId === client.id);
      const totalBilled = clientJobs.reduce((sum, j) => sum + j.value, 0);
      contextString += `Nome: ${client.name}, Empresa: ${client.company || 'N/A'}, Email: ${client.email}, Total Faturado: R$${totalBilled}\n`;
    });
  } else {
    contextString += "Nenhum cliente cadastrado.\n";
  }
  contextString += "---\n";
  return contextString;
};

export const callGeminiApi = async (
  userQuery: string, 
  appContextData: AppContextData
): Promise<GenerateContentResponse> => {
  if (!ai) {
    // Return a mock error response if AI is not initialized
    return Promise.resolve({
        text: "Desculpe, o assistente de IA não está configurado corretamente (API Key ausente).",
        // Mock other parts of GenerateContentResponse if needed for type consistency
        candidates: [],
        promptFeedback: undefined,
        usageMetadata: undefined,
      } as unknown as GenerateContentResponse); // Cast to assure type, but it's a simplified mock
  }

  const dataContext = formatDataForPrompt(appContextData);

  const systemInstruction = `Você é um assistente de IA para o sistema BIG, uma plataforma de gestão para freelancers criativos. 
  Sua principal função é ajudar o usuário a analisar e obter informações sobre seus jobs, clientes e finanças, com base nos dados fornecidos. 
  Seja conciso, direto e amigável. Use o formato de moeda R$ (Reais Brasileiros) quando apropriado.
  Responda em Português do Brasil.
  Se a pergunta for sobre eventos atuais ou informações que não estão nos dados fornecidos, você pode usar o Google Search.
  Se usar o Google Search, cite as fontes.
  Não invente informações se não estiverem nos dados ou na busca.
  Hoje é ${new Date().toLocaleDateString('pt-BR')}.`;

  const prompt = `${dataContext}\nPergunta do Usuário: ${userQuery}`;
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        // Uncomment to enable Google Search if needed for broader queries
        // tools: [{googleSearch: {}}], 
      }
    });
    
    // The 'text' property is directly available on the response object
    // No need for response.response.text() or similar.
    return response;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Construct a more detailed error message if possible
    let errorMessage = "Ocorreu um erro ao contatar o assistente de IA.";
    if (error instanceof Error) {
        errorMessage += ` Detalhes: ${error.message}`;
    }
    // Return a mock error response
     return Promise.resolve({
        text: errorMessage,
        candidates: [],
        promptFeedback: undefined,
        usageMetadata: undefined,
      } as unknown as GenerateContentResponse);
  }
};
