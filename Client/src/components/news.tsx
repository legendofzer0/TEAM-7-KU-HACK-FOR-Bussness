// src/components/NewsModal.tsx
import { useEffect, useState } from "react";
import { fetchNewsAboutNepal, Article } from "../api/newsApi";
import "../css/NewsModal.css"

interface NewsModalProps {
  onClose: () => void;
}

export default function NewsModal({ onClose }: NewsModalProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchNewsAboutNepal()
      .then(setArticles)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button onClick={onClose} aria-label="Close modal">x</button>
        <h2>Recent News About Nepal</h2>

        {loading && <p>Loading news...</p>}
        {error && <p style={{color:"red"}}>Error: {error}</p>}

        {!loading && !error && articles.length === 0 && (
          <p>No articles found.</p>
        )}

        {!loading && !error && articles.length > 0 && (
          <ul>
            {articles.slice(0, 10).map((article, idx) => (
              <li key={idx}>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
                <br />
                <small>Source: {article.source.name}</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
