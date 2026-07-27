'use server';
/**
 * @fileOverview Predictive fault detection flow for identifying potential machine faults based on sensor data.
 *
 * - predictFault - An asynchronous function that takes sensor data as input and returns a prediction of potential faults.
 * - PredictiveFaultInput - The input type for the predictFault function, representing sensor data.
 * - PredictiveFaultOutput - The output type for the predictFault function, representing the fault prediction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictiveFaultInputSchema = z.object({
  vibration: z.number().describe('Vibration sensor reading.'),
  temperature: z.number().describe('Temperature sensor reading.'),
  humidity: z.number().describe('Humidity sensor reading.'),
  voltage: z.number().describe('Voltage sensor reading.'),
  current: z.number().describe('Current sensor reading.'),
  earthLineStatus: z.boolean().describe('Earth line status (true if OK, false if not OK).'),
  machineName: z.string().describe('The name of the machine being monitored.')
});
export type PredictiveFaultInput = z.infer<typeof PredictiveFaultInputSchema>;

const PredictiveFaultOutputSchema = z.object({
  faultPredicted: z.boolean().describe('Whether a fault is predicted (true) or not (false).'),
  faultDescription: z.string().describe('Description of the predicted fault, if any.'),
  confidenceLevel: z.number().describe('Confidence level of the prediction (0-1).'),
  suggestedMaintenance: z.string().describe('Suggested maintenance actions to prevent the fault.')
});
export type PredictiveFaultOutput = z.infer<typeof PredictiveFaultOutputSchema>;

export async function predictFault(input: PredictiveFaultInput): Promise<PredictiveFaultOutput> {
  return predictiveFaultFlow(input);
}

const predictiveFaultPrompt = ai.definePrompt({
  name: 'predictiveFaultPrompt',
  input: {schema: PredictiveFaultInputSchema},
  output: {schema: PredictiveFaultOutputSchema},
  prompt: `You are an AI expert in predicting machine faults based on sensor data. Analyze the following data from machine {{{machineName}}} and predict potential faults. Provide a confidence level for your prediction and suggest maintenance actions.

Sensor Data:
- Vibration: {{{vibration}}}
- Temperature: {{{temperature}}}
- Humidity: {{{humidity}}}
- Voltage: {{{voltage}}}
- Current: {{{current}}}
- Earth Line Status: {{{earthLineStatus}}}

Based on this data, predict if a fault is likely to occur, describe the potential fault, provide a confidence level (0-1), and suggest maintenance actions to prevent it.

Consider these factors:
* High vibration can indicate mechanical issues.
* High temperature can indicate overheating or cooling system failure.
* High humidity can indicate corrosion or electrical problems.
* Voltage and current fluctuations can indicate electrical faults.
* A faulty earth line can indicate a safety hazard.

Ensure that if earthLineStatus is false, faultPredicted is always true and the faultDescription indicates an earth line fault.

Output in JSON format:
{{{toJson output}}}
`
});

const predictiveFaultFlow = ai.defineFlow(
  {
    name: 'predictiveFaultFlow',
    inputSchema: PredictiveFaultInputSchema,
    outputSchema: PredictiveFaultOutputSchema,
  },
  async input => {
    const {output} = await predictiveFaultPrompt(input);
    return output!;
  }
);
