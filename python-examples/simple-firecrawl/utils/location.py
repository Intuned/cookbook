import pytz

DEFAULT_TIMEZONE = "America/New_York"
DEFAULT_LOCALE = "en-US"


def get_locale_settings(
    country: str = "US",
    languages: list[str] | None = None,
) -> tuple[str, str]:
    """Get locale and timezone for a country code."""
    timezones = pytz.country_timezones.get(country.upper())
    timezone_id = timezones[0] if timezones else DEFAULT_TIMEZONE

    if languages:
        locale = languages[0]
    else:
        locale = f"en-{country.upper()}"

    return locale, timezone_id
