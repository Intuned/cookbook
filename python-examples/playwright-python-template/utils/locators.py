from playwright.async_api import Page, Locator


async def by_text(page: Page, text: str):
    """Locate element by visible text."""
    return page.get_by_text(text, exact=True)


async def by_placeholder(page: Page, placeholder: str):
    """Locate input by placeholder text."""
    return page.get_by_placeholder(placeholder)


async def by_label(page: Page, label: str):
    """Locate input by associated label."""
    return page.get_by_label(label)


async def by_role(
    page: Page, role: str, name: str | None = None, exact: bool = True
) -> Locator:
    """
    Locate element by ARIA role.

    Args:
        page: Playwright Page
        role: ARIA role, e.g., 'button', 'textbox', 'link'
        name: Optional accessible name (label or visible text)
        exact: Match exact name if True, partial match if False

    Returns:
        Locator
    """
    return page.get_by_role(role=role, name=name, exact=exact)


async def is_visible(locator: Locator) -> bool:
    return await locator.is_visible()


async def is_enabled(locator: Locator) -> bool:
    return await locator.is_enabled()


async def count(locator: Locator) -> int:
    return await locator.count()
