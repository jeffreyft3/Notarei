"use client"
import React from 'react'

const ArticleItem = ({ article, assignedCount, isSelected, onClick }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleViewArticle = (e) => {
    e.stopPropagation() // Prevent triggering the parent onClick
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div 
      onClick={onClick}
      style={{ 
        background: '#fff', 
        border: isSelected ? '2px solid #007acc' : '1px solid #eee', 
        borderRadius: 10, 
        boxShadow: isSelected ? '0 4px 12px rgba(0, 122, 204, 0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        padding: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, marginRight: 16 }}>
          <strong style={{ fontSize: 16, lineHeight: 1.4, display: 'block', marginBottom: 10 }}>
            {article.title}
          </strong>
          
          {/* Metadata row - Source, sentence count, dates all in one line */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {article.source || article.source_uri || 'Unknown'}
            </span>
            <span style={{ fontSize: 12, color: '#999' }}>•</span>
            <span style={{ fontSize: 12, color: '#666' }}>
              {article.sentence_count || 0} sentences
            </span>
            <span style={{ fontSize: 12, color: '#999' }}>•</span>
            <span style={{ fontSize: 12, color: '#666' }}>
              Published {formatDate(article.published_at)}
            </span>
            <span style={{ fontSize: 12, color: '#999' }}>•</span>
            <span style={{ fontSize: 12, color: '#666' }}>
              Ingested {formatDate(article.ingested_at)}
            </span>
          </div>

          {/* Body preview */}
          {article.body && (
            <div style={{ 
              fontSize: 13, 
              color: '#555', 
              lineHeight: 1.5,
              marginBottom: 10,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {article.body}
            </div>
          )}

          {/* View article button */}
          {article.url && (
            <button
              onClick={handleViewArticle}
              style={{
                padding: '6px 12px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: '#007acc',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#007acc'
                e.target.style.color = '#fff'
                e.target.style.borderColor = '#007acc'
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f5f5f5'
                e.target.style.color = '#007acc'
                e.target.style.borderColor = '#ddd'
              }}
            >
              View Article →
            </button>
          )}
        </div>

        {/* Assignment badge */}
        <div style={{ 
          fontSize: 12, 
          color: '#666',
          background: assignedCount > 0 ? '#e8f5e9' : '#f5f5f5',
          padding: '6px 12px',
          borderRadius: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          {assignedCount} assigned
        </div>
      </div>
    </div>
  )
}

export default ArticleItem
