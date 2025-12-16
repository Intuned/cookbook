from urllib.parse import urlparse, urlunparse


def normalize_url(url: str, ignore_query: bool = False) -> str:
    parsed = urlparse(url)
    if ignore_query:
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, "", "", ""))
    return url


def is_subdomain_of(url: str, base_url: str) -> bool:
    url_domain = urlparse(url).netloc.lower()
    base_domain = urlparse(base_url).netloc.lower()

    if url_domain == base_domain:
        return True
    return url_domain.endswith("." + base_domain)
