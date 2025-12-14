from playwright.async_api import Page, BrowserContext
from typing import List, Union, TypedDict
from intuned_browser import go_to_url

from utils.types_and_schemas import GetConsultationsByEmailSchema, Consultation


class SuccessResponse(TypedDict):
    success: bool
    total: int
    consultations: List[dict]


class ErrorResponse(TypedDict):
    success: bool
    total: int
    consultations: List
    message: str
    error: str


HandlerResponse = Union[SuccessResponse, ErrorResponse]


async def search_by_email(page: Page, email: str):
    search_input = page.locator("input[placeholder='Search by name, email, or phone']")
    await search_input.wait_for(state="visible")
    await search_input.fill(email)

    search_button = page.locator("#search-btn")
    await search_button.click()

    # Wait for search results to load
    await page.wait_for_timeout(1000)


async def find_consultation_items(page: Page):
    consultation_items = await page.locator(".consultation-item").all()
    print(f"Found {len(consultation_items)} consultations")
    return consultation_items


async def extract_consultations_data(consultation_items: list) -> List[Consultation]:
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
            consultations.append(
                Consultation(
                    id=consultation_id.strip() if consultation_id else "",
                    status=status.strip() if status else "",
                    clientName=client_name.strip() if client_name else "",
                    email=email.strip() if email else "",
                    phone=phone.strip() if phone else "",
                    date=date.strip() if date else "",
                    time=time.strip() if time else "",
                    topic=topic.strip() if topic else "",
                )
            )

            print(f"Successfully extracted consultation: {consultation_id}")
        except Exception as error:
            # If extraction fails for a single consultation, log it but continue with others
            print(f"Failed to extract consultation data: {error}")
            continue

    return consultations


async def automation(
    page: Page,
    params: dict | None = None,
    context: BrowserContext | None = None,
    **_kwargs,
) -> HandlerResponse:
    try:
        if params is None:
            raise ValueError("Params are required for this automation")

        # Validate params using pydantic model
        validated_params = GetConsultationsByEmailSchema(**params)

        # Step 1: Navigate to the consultations list page
        # waitUntil: "networkidle" ensures all consultations are loaded
        await go_to_url(
            page=page,
            url="https://sandbox.intuned.dev/consultations-auth/list",
            wait_for_load_state="networkidle",
        )

        # Step 2: Wait for the consultations list container to be visible
        # This ensures the page has loaded before we try to extract data
        consultations_list = page.locator("#consultations-list")
        await consultations_list.wait_for(state="visible")

        # Step 3: Search by email
        await search_by_email(page, validated_params.email)

        # Step 4: Find all consultation items on the page
        # Each consultation item has the class "consultation-item"
        consultation_items = await find_consultation_items(page)

        # Step 5: Extract data from each consultation item
        consultations = await extract_consultations_data(consultation_items)

        # Step 6: Return all extracted consultations
        print(f"Successfully extracted {len(consultations)} consultations")

        return {
            "success": True,
            "total": len(consultations),
            "consultations": [c.model_dump() for c in consultations],
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
