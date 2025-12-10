from playwright.async_api import Page, BrowserContext
from typing import TypedDict, List


class Params(TypedDict):
    email: str


class Consultation(TypedDict):
    id: str
    status: str
    client_name: str
    email: str
    phone: str
    date: str
    time: str
    topic: str


async def automation(
    page: Page,
    params: Params | None = None,
    context: BrowserContext | None = None,
    **_kwargs
):
    try:
        # Validation: Check if email is provided
        if not params or not params.get("email") or params["email"].strip() == "":
            raise ValueError("Email parameter is required")

        # Step 1: Navigate to the consultations list page
        # wait_until="networkidle" ensures all consultations are loaded
        await page.goto(
            "https://sandbox.intuned.dev/consultations-auth/list",
            wait_until="networkidle",
        )

        # Step 2: Wait for the consultations list container to be visible
        # This ensures the page has loaded before we try to extract data
        consultations_list = page.locator("#consultations-list")
        await consultations_list.wait_for(state="visible")

        # Step 3: Search by email
        search_input = page.locator("input[placeholder='Search by name, email, or phone']")
        await search_input.wait_for(state="visible")
        await search_input.fill(params["email"])
        
        search_button = page.locator("#search-btn")
        await search_button.click()
        
        # Wait for search results to load
        await page.wait_for_timeout(1000)

        # Step 4: Find all consultation items on the page
        # Each consultation item has the class "consultation-item"
        consultation_items = await page.locator(".consultation-item").all()

        print(f"Found {len(consultation_items)} consultations")

        # Step 5: Extract data from each consultation item
        consultations: List[Consultation] = []

        for consultation_item in consultation_items:
            try:
                # Extract the consultation ID
                id_element = consultation_item.locator(".consultation-id")
                consultation_id = await id_element.text_content()

                # Extract the status
                status_element = consultation_item.locator(".consultation-status")
                status = await status_element.text_content()

                # Extract client name (using .data-value to get clean text)
                client_name_element = consultation_item.locator(".client-name .data-value")
                client_name = await client_name_element.text_content()

                # Extract client email (using .data-value to get clean text)
                email_element = consultation_item.locator(".client-email .data-value")
                email = await email_element.text_content()

                # Extract client phone (using .data-value to get clean text)
                phone_element = consultation_item.locator(".client-phone .data-value")
                phone = await phone_element.text_content()

                # Extract consultation date (using .data-value to get clean text)
                date_element = consultation_item.locator(".consultation-date .data-value")
                date = await date_element.text_content()

                # Extract consultation time (using .data-value to get clean text)
                time_element = consultation_item.locator(".consultation-time .data-value")
                time = await time_element.text_content()

                # Extract consultation topic (using .data-value to get clean text)
                topic_element = consultation_item.locator(".consultation-topic .data-value")
                topic = await topic_element.text_content()

                # Add the consultation to our list
                consultations.append({
                    "id": consultation_id.strip() if consultation_id else "",
                    "status": status.strip() if status else "",
                    "client_name": client_name.strip() if client_name else "",
                    "email": email.strip() if email else "",
                    "phone": phone.strip() if phone else "",
                    "date": date.strip() if date else "",
                    "time": time.strip() if time else "",
                    "topic": topic.strip() if topic else "",
                })

                print(f"Successfully extracted consultation: {consultation_id}")
            except Exception as error:
                # If extraction fails for a single consultation, log it but continue with others
                print(f"Failed to extract consultation data: {error}")
                continue

        # Step 6: Return all extracted consultations
        print(f"Successfully extracted {len(consultations)} consultations")

        return {
            "success": True,
            "total": len(consultations),
            "consultations": consultations,
        }
    except Exception as error:
        # Handle any errors that occur during the listing process
        error_message = str(error)

        print(f"Failed to list consultations: {error_message}")

        # Return error response instead of throwing
        return {
            "success": False,
            "total": 0,
            "consultations": [],
            "message": f"Failed to list consultations: {error_message}",
            "error": error_message,
        }