"use client"
import React from 'react'

const ArticleSearchInternal = ({ searchQuery, onSearchChange, resultCount, onDatabaseSearch, isSearching }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() && onDatabaseSearch) {
      onDatabaseSearch(searchQuery)
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Search articles by title, source, or content..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
          background: '#eee',
            flex: 1,
            padding: '12px 16px',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            borderRadius: 8,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = '#007acc'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />
        {onDatabaseSearch && (
          <button
            onClick={() => searchQuery.trim() && onDatabaseSearch(searchQuery)}
            disabled={!searchQuery.trim() || isSearching}
            style={{
              padding: '12px 20px',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              borderRadius: 8,
              background: searchQuery.trim() && !isSearching ? '#007acc' : '#ccc',
              color: '#fff',
              cursor: searchQuery.trim() && !isSearching ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {isSearching ? 'Searching...' : 'Search DB'}
          </button>
        )}
      </div>
      {searchQuery && (
        <div style={{ 
          marginTop: 8, 
          fontSize: 13, 
          color: '#666',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{resultCount} article{resultCount !== 1 ? 's' : ''} found</span>
          <button
            onClick={() => onSearchChange('')}
            style={{
              padding: '4px 10px',
              fontSize: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              background: '#fff',
              color: '#666',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}

export default ArticleSearchInternal
