from pydantic import BaseModel


class ConnectToCdpParams(BaseModel):
    """Parameters for connect-to-cdp API"""

    url: str


class BrowserInfo(BaseModel):
    """Browser information from CDP endpoint"""

    browser_version: str
    protocol_version: str
    user_agent: str
    web_socket_debugger_url: str  # WebSocket URL as string (ws:// or wss://)


class PageInfo(BaseModel):
    """Page information"""

    title: str
    url: str  # Page URL as string


class WebDriverInfo(BaseModel):
    """WebDriver capabilities and session info"""

    capabilities: dict
    session_id: str | None = None


class CDPConnectionResult(BaseModel):
    """Result returned from CDP connection API"""

    message: str
    cdp_url: str  # CDP URL can be HTTP or WS, use string for flexibility
    browser_info: BrowserInfo
    page_info: PageInfo
    web_driver_info: WebDriverInfo
