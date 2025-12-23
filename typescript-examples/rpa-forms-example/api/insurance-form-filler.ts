import { Stagehand, AISdkClient } from "@browserbasehq/stagehand";
import { createOpenAI } from "@ai-sdk/openai";
import type { Page, BrowserContext } from "playwright";
import { attemptStore, getAiGatewayConfig } from "@intuned/runtime";
import { listParametersSchema, ListParameters } from "../utils/typesAndSchemas";

class InvalidActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidActionError";
  }
}

async function getWebSocketUrl(cdpUrl: string): Promise<string> {
  const versionUrl = cdpUrl.endsWith("/")
    ? `${cdpUrl}json/version`
    : `${cdpUrl}/json/version`;
  const response = await fetch(versionUrl);
  const data = await response.json();
  return data.webSocketDebuggerUrl;
}

async function performAction(
  stagehand: Stagehand,
  instruction: string
): Promise<void> {
  const action = await stagehand.observe(instruction);
  if (action && action.length > 0) {
    await stagehand.act(action[0]);
    await stagehand.context.pages()[0]?.waitForLoadState("domcontentloaded");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } else {
    throw new InvalidActionError(
      `Could not find action for instruction: ${instruction}`
    );
  }
}

export default async function handler(
  params: ListParameters,
  page: Page,
  _context: BrowserContext
) {
  // Get AI gateway config for Stagehand
  const { baseUrl, apiKey } = await getAiGatewayConfig();
  const cdpUrl = attemptStore.get("cdpUrl") as string;
  const webSocketUrl = await getWebSocketUrl(cdpUrl);

  // Create AI SDK provider with Intuned's AI gateway
  const openai = createOpenAI({
    apiKey,
    baseURL: baseUrl,
  });

  const llmClient = new AISdkClient({
    model: openai("gpt-5-mini"),
  });

  // Initialize Stagehand with act/extract/observe capabilities
  const stagehand = new Stagehand({
    env: "LOCAL",
    localBrowserLaunchOptions: {
      cdpUrl: webSocketUrl,
      viewport: { width: 1280, height: 800 },
    },
    // llmClient,
    logger: console.log,
  });
  await stagehand.init();
  console.log("\nInitialized 🤘 Stagehand");
  // Validate parameters
  const validatedParams = listParametersSchema.parse(params);

  const { metadata, applicant, address, vehicle } = validatedParams;
  // Navigate to site
  await page.goto(metadata.site);

  // --- Object type selection ---
  await performAction(
    stagehand,
    `Choose the ${metadata.insurance_type} option from the insurance type dropdown`
  );

  // --- ZIP entry ---
  await performAction(
    stagehand,
    `Fill in the zip code ${address.zip_code} in the zip code field`
  );

  await performAction(stagehand, "Click the Get a quote button");
  await page.waitForSelector("#mainContent");

  // --- Name ---
  await performAction(
    stagehand,
    `Fill in the first name ${applicant.first_name} in the first name field`
  );
  await performAction(
    stagehand,

    `Fill in the last name ${applicant.last_name} in the last name field`
  );

  // --- DOB ---
  await performAction(
    stagehand,

    `Fill in the date of birth ${applicant.date_of_birth} in the date of birth field`
  );

  // --- Address ---
  await performAction(
    stagehand,

    `Fill in the address ${address.street_line1} in the street address field`
  );
  await performAction(
    stagehand,

    `Fill in the city ${address.city} in the city field`
  );
  await performAction(
    stagehand,

    `select the state ${address.state} from the state dropdown`
  );
  await performAction(
    stagehand,

    `Fill in the zip code ${address.zip_code} in the zip code field`
  );
  await performAction(stagehand, "Click the Continue button");

  // --- Vehicle ---
  await performAction(
    stagehand,

    `Choose the ${vehicle.vehicle_type} option from the dropdown`
  );
  await performAction(
    stagehand,

    `Select the year ${vehicle.year} from the year dropdown`
  );
  await performAction(
    stagehand,

    `Select the make ${vehicle.make} from the make dropdown`
  );
  await performAction(
    stagehand,

    `Select the model ${vehicle.model} from the model dropdown`
  );
  await performAction(stagehand, "Click the Continue button");
  await performAction(stagehand, "Click the Continue button");

  // --- Fill driver information ---
  await performAction(
    stagehand,

    `Fill in the first name ${applicant.first_name} in the first name field if the first name field is empty`
  );
  await performAction(
    stagehand,

    `Fill in the last name ${applicant.last_name} in the last name field if the last name field is empty`
  );
  await performAction(
    stagehand,

    `click the ${applicant.gender} radio button`
  );
  await performAction(
    stagehand,

    `choose the ${applicant.marital_status} option from the marital status dropdown`
  );
  if (applicant.accident_prevention_course) {
    await performAction(stagehand, "Click the Yes radio button.");
  } else {
    await performAction(stagehand, "Click the No radio button.");
  }
  await performAction(stagehand, "Click the Continue button");
  await performAction(stagehand, "Click the Continue button");

  // --- Final details ---
  await performAction(
    stagehand,

    `Fill in the email ${applicant.email} in the email field`
  );
  await performAction(
    stagehand,

    `Fill in the phone number ${applicant.phone_number} in the phone number field`
  );
  if (applicant.is_cell_phone) {
    await performAction(
      stagehand,

      "Click the Yes radio button in the Is this a cell phone? field"
    );
  } else {
    await performAction(
      stagehand,

      "Click the No radio button in the Is this a cell phone? field"
    );
  }
  if (applicant.can_text) {
    await performAction(
      stagehand,

      "Click the Yes radio button in the Can an ERIE Agent text you about this quote? field"
    );
  } else {
    await performAction(
      stagehand,

      "Click the No radio button in the Can an ERIE Agent text you about this quote? field"
    );
  }
  if (applicant.preferred_name) {
    await performAction(
      stagehand,

      `Fill in the preferred name ${applicant.preferred_name} in the preferred name field`
    );
  }
  if (applicant.home_multi_policy_discount) {
    await performAction(
      stagehand,

      "Click the Yes radio button in the Would you like our Home Multi-Policy Discount applied to your quote? field"
    );
  } else {
    await performAction(
      stagehand,

      "Click the No radio button in the Would you like our Home Multi-Policy Discount applied to your quote? field"
    );
  }
  if (applicant.currently_has_auto_insurance) {
    await performAction(
      stagehand,

      "Click the Yes radio button in the Do you currently have auto insurance? field"
    );
  } else {
    await performAction(
      stagehand,

      "Click the No radio button in the Do you currently have auto insurance? field"
    );
  }
  await performAction(
    stagehand,

    `Fill in the coverage effective date ${applicant.coverage_effective_date} in the coverage effective date field`
  );
  await performAction(stagehand, "Click the Continue button");
  await performAction(
    stagehand,

    "Click the Submit Quote to Agent button"
  );

  const result = await stagehand.extract("Extract the confirmation message");
  if (result) {
    return result;
  } else {
    throw new InvalidActionError("Could not find confirmation message");
  }
}
