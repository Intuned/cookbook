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


def is_same_domain(url: str, base_url: str, allow_subdomains: bool = False) -> bool:
    parsed_url = urlparse(url)
    parsed_base = urlparse(base_url)

    if allow_subdomains:
        return is_subdomain_of(url, base_url)
    else:
        return parsed_url.netloc == parsed_base.netloc


def is_child_path(url: str, base_url: str) -> bool:
    parsed_url = urlparse(url)
    parsed_base = urlparse(base_url)

    base_path = parsed_base.path.rstrip("/")
    target_path = parsed_url.path

    if not base_path:
        return True

    return target_path == base_path or target_path.startswith(base_path + "/")
