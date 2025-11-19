"use client"
import './article.css'
import { useEffect } from 'react'
import Link from 'next/link'
import { useArticlesStore } from '@/store/Store'
const ArticleList = ({ articles = [] }) => {
  const setArticlesInStore = useArticlesStore(s => s.setArticles)

  // Hydrate store with articles from server
  useEffect(() => {
    if (articles.length > 0) {
      setArticlesInStore(articles)
    }
  }, [articles, setArticlesInStore])

  if (!articles || articles.length === 0) {
    return (
      <div className="articles-container">
        <div className="loading-state">No articles available.</div>
      </div>
    )
  }

  return (
    <div className="articles-container">
      <h1>Articles for Review</h1>
      <div className="articles-grid">
        {articles.map((article) => (
          <Link
            href={`/annotate/${article.id || article._id}`}
            key={article._id}
            className="article-card"
          >
            <div className="article-content">
              <h2 className="article-title">{article.title}</h2>
              <p className="article-excerpt">
                {article.excerpt ?? ((article.body || '').slice(0, 220) + (((article.body || '').length > 220) ? '…' : ''))}
              </p>
              <div className="article-meta">
                <span className="article-date">
                  {new Date(article.published_at || Date.now()).toLocaleDateString()}
                </span>
                <span className="article-source">{article.source || 'Unknown'}</span>
              </div>
              <div className="article-stats">
                <span className="stat">
                  {/* {article.annotationCount || 0} annotations */}
                </span>
                <span className="stat">
                  {/* {article.reviewCount || 0} reviews */}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ArticleList