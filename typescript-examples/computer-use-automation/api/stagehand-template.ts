import z from "zod";
import type { Page, Stagehand } from "@browserbasehq/stagehand";
import { attemptStore } from "@intuned/runtime";

interface Params {
  check_in_date: string;    // Check-in date in DD/MM/YYYY format
  check_out_date: string;   // Check-out date in DD/MM/YYYY format
  budget: number;           // Maximum budget in pounds
  first_name: string;       // Guest first name
  last_name: string;        // Guest last name
  phone_number: string;     // Guest phone number
  email: string;            // Guest email
  extra_details?: string;   // Additional requirements or preferences
  model?: string;           // Model to use (default: 'anthropic/claude-sonnet-4-20250514')
}

type BrowserContext = Stagehand['context'];
export default async function handler(
  params: Params,
  page: Page,
  _: BrowserContext,
) {
  const {
    check_in_date,
    check_out_date,
    budget,
    first_name,
    last_name,
    phone_number,
    email,
    extra_details,
    model = 'anthropic/claude-sonnet-4-20250514',
  } = params;

  // Validate required parameters
  if (!check_in_date || !check_out_date || !budget || !first_name || !last_name || !phone_number || !email) {
    throw new Error('All booking parameters are required: check_in_date, check_out_date, budget, first_name, last_name, phone_number, email');
  }

  const stagehand: Stagehand = attemptStore.get("stagehand");

  // Set viewport size to match the computer tool's display dimensions
  await page.setViewportSize(1280, 720);

  await page.goto("https://automationintesting.online");

  const agent = stagehand.agent({
    model: model,
    systemPrompt: "You are a helpful hotel booking assistant that can use a web browser to complete booking tasks.",
  });

  // Build the instruction with all the booking details
  const instruction = `
1. Go to https://automationintesting.online (if not already there).

2. Fill in the check-in date '${check_in_date}' and check-out date '${check_out_date}' in the format DD/MM/YYYY (all numbers). Hit search.

3. Find a room that is within the budget of ${budget} pounds. ${extra_details ? `Keep in mind the following: '${extra_details}'` : ""}

4. Book the room with first name '${first_name}' last name '${last_name}' phone number '${phone_number}' email '${email}'
`.trim();

  console.log("Executing hotel booking with instruction:", instruction);

  // Agent runs on current Stagehand page
  const result = await agent.execute({
    instruction: instruction,
    maxSteps: 20,
  });

  console.log(result.success ? "Hotel booking completed successfully" : "Hotel booking failed");

  return {
    success: result.success,
    check_in_date,
    check_out_date,
    budget,
    guest_name: `${first_name} ${last_name}`,
    message: result.success 
      ? `Successfully booked a room for ${first_name} ${last_name}` 
      : 'Booking failed - please check the parameters and try again'
  };
}
