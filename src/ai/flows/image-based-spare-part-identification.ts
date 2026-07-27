'use server';
/**
 * @fileOverview An AI agent that identifies spare parts and their market prices from an image of a machine part.
 *
 * - identifySparePart - A function that handles the identification process.
 * - IdentifySparePartInput - The input type for the identifySparePart function.
 * - IdentifySparePartOutput - The return type for the identifySparepart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifySparePartInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a machine part, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifySparePartInput = z.infer<typeof IdentifySparePartInputSchema>;

const IdentifySparePartOutputSchema = z.object({
  partName: z.string().describe('The name of the identified spare part.'),
  marketPrice: z.string().describe('The market price of the spare part in Indian Rupees (₹).'),
  parametersToMeasure: z.array(z.string()).describe('Key parameters to measure for the part\'s health (e.g., "wear and tear", "voltage tolerance").'),
  thresholds: z.string().describe('Recommended operational thresholds for the measured parameters, as a descriptive text.'),
});
export type IdentifySparePartOutput = z.infer<typeof IdentifySparePartOutputSchema>;

export async function identifySparePart(input: IdentifySparePartInput): Promise<IdentifySparePartOutput> {
  return identifySparePartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifySparePartPrompt',
  input: {schema: IdentifySparePartInputSchema},
  output: {schema: IdentifySparePartOutputSchema},
  prompt: `You are an expert in identifying spare parts for machines and determining their market prices and operational parameters.

You will be given a photo of a machine part. You will identify the part, determine its market price in Indian Rupees (₹), and provide key parameters to measure for its health, along with recommended operational thresholds.

Use the following as the primary source of information about the machine part.

Photo: {{media url=photoDataUri}}

Respond with the part name, market price in INR, parameters to measure, and their thresholds.`,
});

const identifySparePartFlow = ai.defineFlow(
  {
    name: 'identifySparePartFlow',
    inputSchema: IdentifySparePartInputSchema,
    outputSchema: IdentifySparePartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
