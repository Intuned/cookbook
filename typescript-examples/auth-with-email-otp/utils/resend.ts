import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Extracts OTP code from email text content
 */
function extractOTPFromText(text: string): string | null {
  // Look for numeric codes (4-12 digits) - more flexible for various OTP formats
  const otpPattern = /\b\d{4,12}\b/g;
  const matches = text.match(otpPattern);

  if (matches && matches.length > 0) {
    // Return the longest match (likely to be the OTP code)
    return matches.reduce((longest, current) =>
      current.length > longest.length ? current : longest
    );
  }

  return null;
}

/**
 * Checks if an email was received within the specified time window (in seconds)
 */
function isEmailRecent(createdAt: string, maxAgeSeconds: number = 30): boolean {
  const emailTime = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = (now.getTime() - emailTime.getTime()) / 1000;

  return diffInSeconds <= maxAgeSeconds;
}

/**
 * Gets the most recent email from the list
 */
async function getLatestEmail() {
  const emails = await resend.emails.receiving.list({
    limit: 1,
  });

  if (!emails.data || emails.data?.data?.length === 0) {
    throw new Error("No emails found");
  }

  return emails.data.data[0];
}

/**
 * Retrieves full email details by ID
 */
async function getEmailDetails(emailId: string) {
  const message = await resend.emails.receiving.get(emailId);

  if (!message.data) {
    throw new Error(`Email with ID ${emailId} not found`);
  }

  return message.data;
}

/**
 * Helper function to sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Main function to extract OTP from the latest email if it's recent enough
 * Retries for up to timeoutSeconds (default 30s) with polling intervals
 */
export async function getRecentOTP(
  maxAgeSeconds: number = 30,
  timeoutSeconds: number = 30,
  pollingIntervalMs: number = 2000
): Promise<string | null> {
  const startTime = Date.now();
  const timeoutMs = timeoutSeconds * 1000;
  let attemptNumber = 0;

  while (Date.now() - startTime < timeoutMs) {
    attemptNumber++;
    try {
      console.log(`Attempt ${attemptNumber}: Checking for OTP...`);

      // Get the latest email
      const latestEmail = await getLatestEmail();

      // Check if it's recent enough
      if (
        latestEmail &&
        !isEmailRecent(latestEmail?.created_at, maxAgeSeconds)
      ) {
        console.log("Latest email is too old, waiting for new email...");
      } else if (!latestEmail?.id) {
        console.log("No latest email found, retrying...");
      } else {
        // Get full email details
        const emailDetails = await getEmailDetails(latestEmail.id);

        // Extract OTP from text content
        const otp = extractOTPFromText(emailDetails.text || "");

        if (otp) {
          console.log(
            `Found OTP: ${otp} from email received at ${latestEmail?.created_at} (after ${attemptNumber} attempt(s))`
          );
          return otp;
        } else {
          console.log("No OTP found in email, retrying...");
        }
      }
    } catch (error) {
      console.error(`Error on attempt ${attemptNumber}:`, error);
    }

    // Wait before next attempt if we haven't timed out
    const elapsed = Date.now() - startTime;
    if (elapsed < timeoutMs) {
      const remainingTime = timeoutMs - elapsed;
      const waitTime = Math.min(pollingIntervalMs, remainingTime);
      console.log(`Waiting ${waitTime}ms before next attempt...`);
      await sleep(waitTime);
    }
  }

  console.log(
    `Timeout reached after ${attemptNumber} attempts and ${timeoutSeconds}s. No OTP found.`
  );
  return null;
}
