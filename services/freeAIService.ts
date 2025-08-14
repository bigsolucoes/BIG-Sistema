import { Job, Client, CalendarEvent } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getJobPaymentSummary } from '../utils/jobCalculations';

interface AppContextData {
  jobs: Job[];
  clients: Client[];
  calendarEvents?: CalendarEvent[];
}

interface AIResponse {
  text: string;
  candidates?: any[];
}

// Free AI service using OpenRouter with free models
class FreeAIService {
  private readonly baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private readonly freeModels = [
    'anthropic/claude-3-haiku:beta',
    'google/gemma-2-9b-it:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'huggingfaceh4/zephyr-7b-beta:free'
  ];

  private formatDataForPrompt(data: AppContextData): string {
    let contextString = "Dados do Sistema BIG:\n";
    contextString += "--- Jobs ---\n";
    
    if (data.jobs.length > 0) {
      data.jobs.forEach(job => {
        const clientName = data.clients.find(c => c.id === job.clientId)?.name || 'Desconhecido';
        const { totalPaid, remaining } = getJobPaymentSummary(job);
        const jobValueFormatted = formatCurrency(job.value, false);
        const totalPaidFormatted = formatCurrency(totalPaid, false);
        const remainingFormatted = formatCurrency(remaining, false);

        contextString += `Nome: ${job.name}, Cliente: ${clientName}, Valor Total: ${jobValueFormatted}, Total Pago: ${totalPaidFormatted}, Saldo Restante: ${remainingFormatted}, Prazo: ${new Date(job.deadline).toLocaleDateString('pt-BR')}, Status: ${job.status}, Tipo: ${job.serviceType}\n`;
      });
    } else {
      contextString += "Nenhum job cadastrado.\n";
    }
    
    contextString += "\n--- Clientes ---\n";
    if (data.clients.length > 0) {
      data.clients.forEach(client => {
        const clientJobs = data.jobs.filter(j => j.clientId === client.id);
        const totalBilled = clientJobs.reduce((sum, j) => sum + getJobPaymentSummary(j).totalPaid, 0);
        const totalBilledFormatted = formatCurrency(totalBilled, false);
        contextString += `Nome: ${client.name}, Empresa: ${client.company || 'N/A'}, Email: ${client.email}, Total Faturado (pago): ${totalBilledFormatted}\n`;
      });
    } else {
      contextString += "Nenhum cliente cadastrado.\n";
    }

    if (data.calendarEvents && data.calendarEvents.length > 0) {
      contextString += "\n--- Próximos Eventos do Calendário ---\n";
      const upcomingEvents = data.calendarEvents
        .filter(event => new Date(event.start) >= new Date())
        .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime())
        .slice(0, 10);
      
      if (upcomingEvents.length > 0) {
        upcomingEvents.forEach(event => {
          contextString += `Evento: ${event.title}, Data: ${new Date(event.start).toLocaleString('pt-BR')}, Origem: ${event.source}\n`;
        });
      } else {
        contextString += "Nenhum evento futuro no calendário.\n";
      }
    }

    contextString += "---\n";
    return contextString;
  }

  async callAI(userQuery: string, appContextData: AppContextData): Promise<AIResponse> {
    const dataContext = this.formatDataForPrompt(appContextData);

    const systemPrompt = `Você é um assistente de IA para o sistema BIG, uma plataforma de gestão para freelancers criativos. 
Sua principal função é ajudar o usuário a analisar e obter informações sobre seus jobs, clientes, finanças e calendário, com base nos dados fornecidos. 
Seja conciso, direto e amigável. Use o formato de moeda R$ (Reais Brasileiros) quando apropriado.
Responda em Português do Brasil.
Não invente informações se não estiverem nos dados fornecidos.
Hoje é ${new Date().toLocaleDateString('pt-BR')}.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `${dataContext}\nPergunta do Usuário: ${userQuery}`
      }
    ];

    // Try each free model until one works
    for (const model of this.freeModels) {
      try {
        const response = await fetch(this.baseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || 'sk-or-v1-free'}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'BIG Gestor'
          },
          body: JSON.stringify({
            model,
            messages,
            max_tokens: 1000,
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content || 'Desculpe, não consegui gerar uma resposta.';
          
          return {
            text,
            candidates: []
          };
        }
      } catch (error) {
        console.warn(`Failed to use model ${model}:`, error);
        continue;
      }
    }

    // Fallback to local processing if all models fail
    return this.fallbackResponse(userQuery, appContextData);
  }

  private fallbackResponse(userQuery: string, appContextData: AppContextData): AIResponse {
    const query = userQuery.toLowerCase();
    
    // Simple keyword-based responses
    if (query.includes('faturei') || query.includes('recebi') || query.includes('ganho')) {
      const totalRevenue = appContextData.jobs.reduce((sum, job) => {
        return sum + getJobPaymentSummary(job).totalPaid;
      }, 0);
      
      return {
        text: `Com base nos dados disponíveis, você faturou um total de ${formatCurrency(totalRevenue, false)} considerando todos os pagamentos recebidos.`,
        candidates: []
      };
    }
    
    if (query.includes('atrasado') || query.includes('prazo')) {
      const today = new Date();
      const overdueJobs = appContextData.jobs.filter(job => {
        const deadline = new Date(job.deadline);
        return deadline < today && job.status !== 'Pago' && job.status !== 'Finalizado';
      });
      
      if (overdueJobs.length > 0) {
        const jobsList = overdueJobs.map(job => `• ${job.name} (${new Date(job.deadline).toLocaleDateString('pt-BR')})`).join('\n');
        return {
          text: `Você tem ${overdueJobs.length} job(s) atrasado(s):\n\n${jobsList}`,
          candidates: []
        };
      } else {
        return {
          text: 'Parabéns! Você não tem jobs atrasados no momento.',
          candidates: []
        };
      }
    }
    
    if (query.includes('cliente') || query.includes('clientes')) {
      const clientCount = appContextData.clients.length;
      const topClient = appContextData.clients.reduce((top, client) => {
        const clientJobs = appContextData.jobs.filter(j => j.clientId === client.id);
        const clientRevenue = clientJobs.reduce((sum, j) => sum + getJobPaymentSummary(j).totalPaid, 0);
        
        if (!top || clientRevenue > top.revenue) {
          return { client, revenue: clientRevenue };
        }
        return top;
      }, null as { client: Client; revenue: number } | null);
      
      let response = `Você tem ${clientCount} cliente(s) cadastrado(s).`;
      
      if (topClient && topClient.revenue > 0) {
        response += ` Seu cliente que mais faturou é ${topClient.client.name} com ${formatCurrency(topClient.revenue, false)}.`;
      }
      
      return {
        text: response,
        candidates: []
      };
    }
    
    if (query.includes('job') || query.includes('projeto')) {
      const activeJobs = appContextData.jobs.filter(job => !job.isDeleted && job.status !== 'Pago');
      const completedJobs = appContextData.jobs.filter(job => job.status === 'Pago');
      
      return {
        text: `Você tem ${activeJobs.length} job(s) ativo(s) e ${completedJobs.length} job(s) concluído(s).`,
        candidates: []
      };
    }
    
    // Default response
    return {
      text: `Desculpe, não consegui processar sua pergunta "${userQuery}". Tente perguntar sobre seus jobs, clientes, faturamento ou prazos. Por exemplo: "Quanto eu faturei este mês?" ou "Quais jobs estão atrasados?"`,
      candidates: []
    };
  }
}

export const freeAIService = new FreeAIService();

// Export the main function for compatibility
export const callFreeAI = (userQuery: string, appContextData: AppContextData): Promise<AIResponse> => {
  return freeAIService.callAI(userQuery, appContextData);
};
