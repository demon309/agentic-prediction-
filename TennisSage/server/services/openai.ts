import OpenAI from 'openai';

// Initialize OpenAI client with GPT-4 access
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface AIAnalysisResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class OpenAIService {
  private static instance: OpenAIService;

  private constructor() {}

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  async analyzeWithGPT4(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const completion = await openai.chat.completions.create({
        model: request.model || 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: request.systemPrompt || 'You are an expert tennis analyst with deep knowledge of player statistics, match dynamics, and predictive analysis.',
          },
          {
            role: 'user',
            content: request.prompt,
          },
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return {
        content: response,
        usage: completion.usage ? {
          promptTokens: completion.usage.prompt_tokens,
          completionTokens: completion.usage.completion_tokens,
          totalTokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to analyze with GPT-4: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeFactorWithSpecializedPrompt(
    factor: string,
    data: any,
    specializedPrompt: string
  ): Promise<string> {
    const systemPrompt = `You are a specialized tennis analyst focusing on ${factor}. 
    Provide objective, data-driven analysis following these rules:
    1. Always highlight advantages as "**Advantage Player X**" or "**No Clear Advantage**"
    2. Base conclusions strictly on provided data
    3. Be concise but thorough
    4. Avoid speculation or betting references
    5. Focus on factual analysis`;

    const prompt = `${specializedPrompt}\n\nData:\n${JSON.stringify(data, null, 2)}`;

    const response = await this.analyzeWithGPT4({
      prompt,
      systemPrompt,
      temperature: 0.5, // Lower temperature for more consistent factual analysis
      maxTokens: 800,
    });

    return response.content;
  }

  async synthesizeFinalPrediction(
    factorAnalyses: Array<{ factor: string; advantage: string; confidence: number }>
  ): Promise<{
    winner: string;
    confidence: number;
    reasoning: string;
  }> {
    const prompt = `Based on the following factor analyses, determine the predicted winner:

${factorAnalyses.map(f => `${f.factor}: ${f.advantage} (Confidence: ${f.confidence})`).join('\n')}

Provide:
1. Predicted winner (Player 1 or Player 2)
2. Overall confidence level (0-1)
3. Brief reasoning summarizing key advantages

Follow these rules:
- Weight significant advantages more heavily
- Consider cumulative effect of multiple small advantages
- Be decisive even in close matches
- Provide clear, logical reasoning`;

    const response = await this.analyzeWithGPT4({
      prompt,
      temperature: 0.3, // Very low temperature for consistent predictions
      maxTokens: 500,
    });

    // Parse the response to extract winner, confidence, and reasoning
    const content = response.content;
    const winnerMatch = content.match(/Player\s+(1|2)/i);
    const confidenceMatch = content.match(/confidence[:\s]+([0-9.]+)/i);
    
    return {
      winner: winnerMatch ? `Player ${winnerMatch[1]}` : 'Undetermined',
      confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5,
      reasoning: content,
    };
  }

  async extractInsightsFromNews(newsText: string, playerName: string): Promise<{
    injuries: string[];
    formIndicators: string[];
    contextualFactors: string[];
  }> {
    const prompt = `Analyze this news text about ${playerName} and extract:
1. Any injury or health concerns
2. Form indicators (recent performance mentions)
3. Other contextual factors (coaching changes, personal issues, etc.)

News text: ${newsText}

Provide only confirmed facts, no speculation.`;

    const response = await this.analyzeWithGPT4({
      prompt,
      temperature: 0.3,
      maxTokens: 500,
    });

    // Parse response to extract structured insights
    const content = response.content;
    
    return {
      injuries: this.extractBulletPoints(content, 'injur'),
      formIndicators: this.extractBulletPoints(content, 'form|performance'),
      contextualFactors: this.extractBulletPoints(content, 'context|coach|personal'),
    };
  }

  private extractBulletPoints(text: string, keyword: string): string[] {
    const regex = new RegExp(`.*${keyword}.*`, 'gi');
    const matches = text.match(regex) || [];
    return matches.map(m => m.trim()).filter(m => m.length > 0);
  }
}

export const openAIService = OpenAIService.getInstance();