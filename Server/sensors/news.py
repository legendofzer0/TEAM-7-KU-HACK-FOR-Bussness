from newsapi import NewsApiClient
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("NEWS_API_KEY")

if not api_key:
    raise ValueError("Missing NEWS_API_KEY in environment variables")

newsapi = NewsApiClient(api_key=api_key)

# Use get_everything instead, since get_top_headlines does not support 'np'
all_articles = newsapi.get_everything(
    q='Nepal',
    language='en',
    sort_by='publishedAt',
    page=1
)

articles = all_articles.get('articles', [])

if articles:
    print("📰 Recent News About Nepal:")
    for i, article in enumerate(articles[:10], 1):
        print(f"\n{i}. {article['title']}")
        print(f"   Source: {article['source']['name']}")
        print(f"   URL: {article['url']}")
else:
    print("No articles found for Nepal.")
