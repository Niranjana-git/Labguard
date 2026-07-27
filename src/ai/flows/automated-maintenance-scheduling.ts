'use server';

/**
 * @fileOverview A flow for generating automated maintenance schedules based on AI analysis of machine data.
 *
 * - generateMaintenanceSchedule - A function that generates a maintenance schedule.
 * - GenerateMaintenanceScheduleInput - The input type for the generateMaintenanceSchedule function.
 * - GenerateMaintenanceScheduleOutput - The return type for the generateMaintenanceSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMaintenanceScheduleInputSchema = z.object({
  machineData: z.string().describe('A CSV string of machine data, including sensor readings and maintenance history.'),
  scheduleType: z.enum(['weekly', 'monthly']).describe('The type of maintenance schedule to generate.'),
  numMachines: z.number().describe('The number of machines to generate a schedule for.')
});

export type GenerateMaintenanceScheduleInput = z.infer<typeof GenerateMaintenanceScheduleInputSchema>;

const GenerateMaintenanceScheduleOutputSchema = z.object({
  schedule: z.string().describe('A JSON string representing the generated maintenance schedule.  The JSON should contain an array of tasks, each with a machine identifier, task description, and due date.'),
});

export type GenerateMaintenanceScheduleOutput = z.infer<typeof GenerateMaintenanceScheduleOutputSchema>;

export async function generateMaintenanceSchedule(input: GenerateMaintenanceScheduleInput): Promise<GenerateMaintenanceScheduleOutput> {
  return generateMaintenanceScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMaintenanceSchedulePrompt',
  input: {schema: GenerateMaintenanceScheduleInputSchema},
  output: {schema: GenerateMaintenanceScheduleOutputSchema},
  prompt: `You are an AI assistant specialized in generating maintenance schedules for lab equipment.

  You will receive machine data, a schedule type (weekly or monthly), and the number of machines to generate a schedule for.
  Based on this information, you will generate a maintenance schedule in JSON format.

  The JSON should contain an array of tasks, each with a machine identifier, task description, and due date.

  Ensure that the generated schedule is optimized for efficiency and minimizes downtime.

  Here is the machine data:
  {{machineData}}

  Schedule Type: {{scheduleType}}
  Number of Machines: {{numMachines}}

  Now, generate the maintenance schedule in JSON format:
  `,
});

const generateMaintenanceScheduleFlow = ai.defineFlow(
  {
    name: 'generateMaintenanceScheduleFlow',
    inputSchema: GenerateMaintenanceScheduleInputSchema,
    outputSchema: GenerateMaintenanceScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
