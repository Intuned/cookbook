"""
API Requests

Demonstrates making HTTP requests using page.request:
- GET requests
- POST requests
- Requests share the browser's cookies/session
"""

from playwright.async_api import Page
from typing import TypedDict


class Params(TypedDict):
    pass


async def automation(page: Page, params: Params | None = None, **_kwargs):
    # Navigate to establish a session (some APIs need cookies)
    await page.goto("https://jsonplaceholder.typicode.com/")
    await page.wait_for_load_state("networkidle")

    # GET request - fetch a list of posts
    get_response = await page.request.get(
        "https://jsonplaceholder.typicode.com/posts",
        headers={"Accept": "application/json"},
    )

    if not get_response.ok:
        raise Exception(f"GET request failed: {get_response.status}")

    posts = await get_response.json()
    first_five_posts = posts[:5]

    # GET request with query parameters
    filtered_response = await page.request.get(
        "https://jsonplaceholder.typicode.com/posts",
        params={"userId": 1},
    )

    user_posts = await filtered_response.json()

    # POST request - create a new post
    post_response = await page.request.post(
        "https://jsonplaceholder.typicode.com/posts",
        headers={"Content-Type": "application/json"},
        data={
            "title": "Automation Test Post",
            "body": "This post was created via Playwright automation",
            "userId": 1,
        },
    )

    if not post_response.ok:
        raise Exception(f"POST request failed: {post_response.status}")

    created_post = await post_response.json()

    return {
        "postsCount": len(posts),
        "firstFivePosts": [{"id": p["id"], "title": p["title"][:50]} for p in first_five_posts],
        "userPostsCount": len(user_posts),
        "createdPost": created_post,
    }
