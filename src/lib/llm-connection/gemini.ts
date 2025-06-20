// import { BaseLLMConnection } from './base';

// export class GeminiConnection extends BaseLLMConnection {
//   constructor(apiKey: string) {
//     super(apiKey, 'https://generativelanguage.googleapis.com');
//   }

//   async sendMessage(message: string, tools?: string[]): Promise<string> {
//     try {
//       // Correct Gemini API endpoint and request format
//       console.log('Making request to Gemini with API key:', this.apiKey,"tools", tools); // Debug log
//       const response = await fetch(`${this.baseUrl}/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{
//               text: message
//             }]
//           }],
//           generationConfig: {
//             temperature: 0.7,
//             topK: 40,
//             topP: 0.95,
//             maxOutputTokens: 1024,
//           }
//         })
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Gemini API error response:', errorText);
//         throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
//       }

//       const data = await response.json();
      
//       // Check if response has the expected structure
//       if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
//         console.error('Unexpected Gemini API response structure:', data);
//         throw new Error('Invalid response structure from Gemini API');
//       }

//       return data.candidates[0].content.parts[0].text;
//     } catch (error) {
//       console.error('Gemini connection error:', error);
      
//       // Return a more informative error message
//       if (error instanceof Error) {
//         throw new Error(`Failed to get response from Gemini: ${error.message}`);
//       }
//       throw new Error('Unknown error occurred while communicating with Gemini');
//     }
//   }

//   async validateConnection(): Promise<boolean> {
//     try {
//       // Test the connection with a simple message
//       const testResponse = await fetch(`${this.baseUrl}/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           contents: [{
//             parts: [{
//               text: "Hello"
//             }]
//           }]
//         })
//       });

//       return testResponse.ok;
//     } catch (error) {
//       console.error('Gemini validation error:', error);
//       return false;
//     }
//   }
// }
import { BaseLLMConnection } from './base';

export class GeminiConnection extends BaseLLMConnection {
  constructor(apiKey: string) {
    // We don't actually need the API key on client side since we're calling our own API
    super(apiKey, '/api'); // Use your API route instead
  }

  async sendMessage(message: string, tools?: string[]): Promise<string> {
    try {
      // Call your own API route instead of Gemini directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: message
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if response has the expected structure from your API
      if (!data.messages || !data.messages[0]) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from API');
      }

      return data.messages[0].content;
    } catch (error) {
      console.error('Gemini connection error:', error);
      
      if (error instanceof Error) {
        throw new Error(`Failed to get response from Gemini: ${error.message}`);
      }
      throw new Error('Unknown error occurred while communicating with Gemini');
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      // Test the connection with a simple message
      const testResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        })
      });

      return testResponse.ok;
    } catch (error) {
      console.error('Gemini validation error:', error);
      return false;
    }
  }
}