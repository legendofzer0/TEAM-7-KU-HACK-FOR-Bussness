// src/api/newsApi.ts
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || process.env.REACT_APP_NEWS_API_KEY;

export interface Article {
  title: string;
  source: { name: string };
  url: string;
}

export interface NewsResponse {
  articles: Article[];
}

export async function fetchNewsAboutNepal(): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    throw new Error("Missing NEWS_API_KEY environment variable");
  }

  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", "Nepal");
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("page", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "Authorization": NEWS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`News API error: ${response.status} ${response.statusText}`);
  }

  const data: NewsResponse = await response.json();
  return data.articles || [];
}
