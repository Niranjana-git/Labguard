'use server';
/**
 * @fileOverview A chatbot flow for Sara, the lab assistant.
 *
 * - chatWithSara - A function that handles the chat conversation.
 * - ChatWithSaraInput - The input type for the chatWithSara function.
 * - ChatWithSaraOutput - The return type for the chatWithSara function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithSaraInputSchema = z.object({
  message: z.string().describe('The user\'s message to Sara.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.array(z.object({text: z.string()})),
  })).optional().describe('The conversation history.'),
});
export type ChatWithSaraInput = z.infer<typeof ChatWithSaraInputSchema>;

const ChatWithSaraOutputSchema = z.object({
  response: z.string().describe('Sara\'s response to the user.'),
});
export type ChatWithSaraOutput = z.infer<typeof ChatWithSaraOutputSchema>;

export async function chatWithSara(input: ChatWithSaraInput): Promise<ChatWithSaraOutput> {
  return chatWithSaraFlow(input);
}

const chatWithSaraFlow = ai.defineFlow(
  {
    name: 'chatWithSaraFlow',
    inputSchema: ChatWithSaraInputSchema,
    outputSchema: ChatWithSaraOutputSchema,
  },
  async ({ message, history }) => {
    const systemPrompt = `You are Sara, a friendly and helpful AI lab assistant for LabGuard Pro. Your role is to assist users with information about lab machines, maintenance schedules, and safety protocols. Be concise and clear in your responses. Current date: ${new Date().toLocaleDateString()}`;

    const { text, output } = await ai.generate({
        prompt: message,
        history: history || [],
        system: systemPrompt,
    });
    
    return { response: text || output?.text || "I'm sorry, I couldn't process that. Please try again." };
  }
);
