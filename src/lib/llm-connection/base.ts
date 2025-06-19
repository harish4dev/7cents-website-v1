export abstract class BaseLLMConnection {
    protected apiKey: string;
    protected baseUrl: string;
  
    constructor(apiKey: string, baseUrl: string) {
      this.apiKey = apiKey;
      this.baseUrl = baseUrl;
    }
  
    abstract sendMessage(message: string, tools?: string[]): Promise<string>;
    abstract validateConnection(): Promise<boolean>;
  }