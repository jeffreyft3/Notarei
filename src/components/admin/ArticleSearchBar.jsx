"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'

const ArticleSearchBar = ({ onSearch, isLoading }) => {
  const [keywords, setKeywords] = useState([])
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [searchIn, setSearchIn] = useState('both') // 'title', 'body', or 'both'

  const handleAddKeyword = (e) => {
    if (e.key === 'Enter' && currentKeyword.trim()) {
      e.preventDefault()
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword('')
    }
  }

  const handleRemoveKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index))
  }

  const handleSearch = () => {
    // Build the $and array
    const andConditions = []

    // Add keyword conditions
    keywords.forEach(keyword => {
      if (searchIn === 'both' || searchIn === 'title') {
        andConditions.push({
          keyword: keyword,
          keywordLoc: 'title'
        })
      }
      if (searchIn === 'both' || searchIn === 'body') {
        andConditions.push({
          keyword: keyword,
          keywordLoc: 'body'
        })
      }
    })

    // Add source (hardcoded to reuters.com)
    andConditions.push({
      sourceUri: 'reuters.com'
    })

    // Add date range and language
    andConditions.push({
      dateStart: dateStart || '2025-11-13',
      dateEnd: dateEnd || new Date().toISOString().split('T')[0],
      lang: 'eng'
    })

    // Build complete query
    const query = {
      query: {
        $query: {
          $and: andConditions
        }
      },
      resultType: 'articles',
      articlesSortBy: 'date',
      includeArticleSocialScore: true,
      includeArticleConcepts: true,
      includeArticleCategories: true,
      includeArticleLocation: true,
      includeArticleLinks: true,
      includeArticleExtractedDates: true,
      includeArticleDuplicateList: true,
      includeArticleOriginalArticle: true,
      apiKey: process.env.NEXT_PUBLIC_NEWSAPI_KEY
    }

    onSearch(query)
  }

  const handleClear = () => {
    setKeywords([])
    setCurrentKeyword('')
    setDateStart('')
    setDateEnd('')
    setSearchIn('both')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600, color: '#333' }}>
        Search Articles
      </h3>

      {/* Keywords Input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
          Keywords (press Enter to add)
        </label>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={currentKeyword}
            onChange={(e) => setCurrentKeyword(e.target.value)}
            onKeyDown={handleAddKeyword}
            placeholder="Add keywords..."
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = '#007acc'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        
        {/* Keywords chips */}
        {keywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {keywords.map((keyword, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: 16,
                  fontSize: 13,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {keyword}
                <button
                  onClick={() => handleRemoveKeyword(index)}
                  style={{
                    background: 'rgba(255,255,255,0.3)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Search In selector */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
          Search In
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          {['both', 'title', 'body'].map((option) => (
            <button
              key={option}
              onClick={() => setSearchIn(option)}
              disabled={isLoading}
              style={{
                padding: '8px 16px',
                border: searchIn === option ? '2px solid #007acc' : '1px solid #ddd',
                borderRadius: 8,
                background: searchIn === option ? 'rgba(0, 122, 204, 0.1)' : '#fff',
                color: searchIn === option ? '#007acc' : '#666',
                fontSize: 13,
                fontWeight: searchIn === option ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
            Start Date
          </label>
          <input
            type="date"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            disabled={isLoading}
            style={{
                fontFamily: 'inherit',
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>
            End Date
          </label>
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            disabled={isLoading}
            style={{
              width: '100%',
                fontFamily: 'inherit',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px 24px',
            background: isLoading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? 'Searching...' : 'Search Articles'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClear}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            background: '#fff',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Clear
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ArticleSearchBar
