import { BrowserContext, Page } from "playwright";

/**
 * API Requests
 *
 * Demonstrates making HTTP requests using page.request:
 * - GET requests
 * - POST requests
 * - Requests share the browser's cookies/session
 */

interface Params {}

export default async function handler(
  params: Params,
  page: Page,
  context: BrowserContext
) {
  // Navigate to establish a session (some APIs need cookies)
  await page.goto("https://jsonplaceholder.typicode.com/");
  await page.waitForLoadState("networkidle");

  // GET request - fetch a list of posts
  const getResponse = await page.request.get(
    "https://jsonplaceholder.typicode.com/posts",
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  if (!getResponse.ok()) {
    throw new Error(`GET request failed: ${getResponse.status()}`);
  }

  const posts = await getResponse.json();
  const firstFivePosts = posts.slice(0, 5);

  // GET request with query parameters
  const filteredResponse = await page.request.get(
    "https://jsonplaceholder.typicode.com/posts",
    {
      params: {
        userId: 1,
      },
    }
  );

  const userPosts = await filteredResponse.json();

  // POST request - create a new post
  const postResponse = await page.request.post(
    "https://jsonplaceholder.typicode.com/posts",
    {
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        title: "Automation Test Post",
        body: "This post was created via Playwright automation",
        userId: 1,
      },
    }
  );

  if (!postResponse.ok()) {
    throw new Error(`POST request failed: ${postResponse.status()}`);
  }

  const createdPost = await postResponse.json();

  return {
    postsCount: posts.length,
    firstFivePosts: firstFivePosts.map((p: any) => ({
      id: p.id,
      title: p.title.substring(0, 50),
    })),
    userPostsCount: userPosts.length,
    createdPost,
  };
}
