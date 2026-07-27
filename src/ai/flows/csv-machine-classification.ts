'use server';

/**
 * @fileOverview A flow for classifying machines into clusters and suggesting optimal threshold settings from CSV data.
 *
 * - classifyMachines - A function that handles the machine classification process.
 * - ClassifyMachinesInput - The input type for the classifyMachines function.
 * - ClassifyMachinesOutput - The return type for the classifyMachines function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClassifyMachinesInputSchema = z.object({
  csvData: z
    .string()
    .describe('The CSV data containing machine information.'),
});
export type ClassifyMachinesInput = z.infer<typeof ClassifyMachinesInputSchema>;

const ClassifyMachinesOutputSchema = z.object({
  clusters: z
    .array(z.string())
    .describe('Suggested machine clusters based on the CSV data.'),
  thresholdSettings: z
    .record(z.string(), z.number())
    .describe('Optimal threshold settings for each cluster.'),
});
export type ClassifyMachinesOutput = z.infer<typeof ClassifyMachinesOutputSchema>;

export async function classifyMachines(input: ClassifyMachinesInput): Promise<ClassifyMachinesOutput> {
  return classifyMachinesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'classifyMachinesPrompt',
  input: {schema: ClassifyMachinesInputSchema},
  output: {schema: ClassifyMachinesOutputSchema},
  prompt: `You are an expert lab technician specializing in machine organization and threshold optimization.

  Based on the provided CSV data, suggest optimal machine clusters and threshold settings for each cluster.
  The goal is to group similar machines together and define appropriate thresholds for monitoring their performance.

  Ensure that the suggested clusters are distinct and meaningful, and that the threshold settings are reasonable for the given machine types.
  Make sure that the 'clusters' and 'thresholdSettings' in the output are valid.

  CSV Data:
  {{{csvData}}}
  `,
});

const classifyMachinesFlow = ai.defineFlow(
  {
    name: 'classifyMachinesFlow',
    inputSchema: ClassifyMachinesInputSchema,
    outputSchema: ClassifyMachinesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
