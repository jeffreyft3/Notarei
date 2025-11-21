"use client"
import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@auth0/nextjs-auth0/client'
import ArticleItem from './ArticleItem'
import AssignmentCanvas from './AssignmentCanvas'
import ArticleSearchInternal from './ArticleSearchInternal'

const ArticleAssign = ({ 
  articles, 
  annotators, 
  assignments, 
  onAssign, 
  onUnassign 
}) => {
  const { user, error, isLoading } = useUser()
  const [selectedArticleId, setSelectedArticleId] = useState(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [fetchedArticles, setFetchedArticles] = useState([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [fetchedUsers, setFetchedUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSources, setSelectedSources] = useState(new Set())
  const [isSearchingDB, setIsSearchingDB] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreResults, setHasMoreResults] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [lastSearchKeyword, setLastSearchKeyword] = useState('')

  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoadingArticles(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch articles: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Fetched articles for assignment:', data.articles)
        console.log('Sample article structure:', data.articles?.[0])
        setFetchedArticles(data.articles || [])
      } catch (error) {
        console.error('Error fetching articles:', error)
        setFetchedArticles([])
      } finally {
        setIsLoadingArticles(false)
      }
    }

    fetchArticles()
  }, [])

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.sub) return
      
      setIsLoadingUsers(true)
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth0_id: user.sub,
          }),
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Fetched users for assignment:', data)
        setFetchedUsers(data.users || [])
      } catch (error) {
        console.error('Error fetching users:', error)
        setFetchedUsers([])
      } finally {
        setIsLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [user])

  
  const handleArticleClick = (articleId) => {
    setSelectedArticleId(selectedArticleId === articleId ? null : articleId)
  }

  const handleConfirmAssignment = async (articleId, assignedIds) => {
    if (assignedIds.length < 2) {
      alert('Please assign at least 2 annotators')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pairings/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          article_id: articleId,
          user1_id: assignedIds[0],
          user2_id: assignedIds[1],
        }),
      })

      if (!response.ok) {
        throw new Error(`Assignment failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Assignment successful:', data)
      alert('Annotators assigned successfully!')
    } catch (error) {
      console.error('Error assigning annotators:', error)
      alert(`Failed to assign annotators: ${error.message}`)
    } finally {
      setIsAssigning(false)
    }
  }

  const onDragStart = (e, userId) => {
    e.dataTransfer.setData('text/plain', userId)
  }

  const onDragOver = (e) => {
    e.preventDefault()
  }

  const onDropToArticle = (e, articleId) => {
    e.preventDefault()
    const userId = e.dataTransfer.getData('text/plain')
    if (!userId) return
    onAssign(articleId, userId)
  }

  // Filter articles based on search query
  const filteredArticles = (fetchedArticles.length > 0 ? fetchedArticles : articles).filter(article => {
    if (!searchQuery.trim() && selectedSources.size === 0) return true
    
    // Search query filter
    let matchesSearch = true
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const title = (article.title || '').toLowerCase()
      const body = (article.body || '').toLowerCase()
      const source = (article.source?.title || '').toLowerCase()
      matchesSearch = title.includes(query) || body.includes(query) || source.includes(query)
    }
    
    // Source filter
    let matchesSource = true
    if (selectedSources.size > 0) {
      const articleSource = article.source?.title || 
                           article.source?.name || 
                           article.source || 
                           article.source_uri || 
                           article.sourceUri ||
                           'Unknown'
      matchesSource = selectedSources.has(articleSource)
    }
    
    return matchesSearch && matchesSource
  })

  // Get all unique sources from articles
  const availableSources = [...new Set(
    (fetchedArticles.length > 0 ? fetchedArticles : articles)
      .map(article => {
        // Try multiple possible source field names
        return article.source?.title || 
               article.source?.name || 
               article.source || 
               article.source_uri || 
               article.sourceUri ||
               'Unknown'
      })
      .filter(Boolean)
  )].sort()

  const toggleSource = (source) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(source)) {
        newSet.delete(source)
      } else {
        newSet.add(source)
      }
      return newSet
    })
  }

  const clearSourceFilters = () => {
    setSelectedSources(new Set())
  }

  const searchArticlesInDB = async (keyword, page = 1, append = false) => {
    if (!keyword.trim()) return
    
    const isInitialSearch = page === 1
    if (isInitialSearch) {
      setIsSearchingDB(true)
    } else {
      setIsLoadingMore(true)
    }
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=20`
      )
      
      if (!response.ok) {
        throw new Error(`Database search failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`${isInitialSearch ? 'Search' : 'Load more'} results (page ${page}):`, data)
      
      const newArticles = data.articles || []
      setFetchedArticles(prev => append ? [...prev, ...newArticles] : newArticles)
      
      if (isInitialSearch) {
        setSearchQuery(keyword)
        setLastSearchKeyword(keyword)
        setCurrentPage(1)
      } else {
        setCurrentPage(page)
      }
      
      setHasMoreResults(newArticles.length === 20)
    } catch (error) {
      console.error('Error searching database:', error)
      alert(`Failed to ${isInitialSearch ? 'search' : 'load more results from'} database: ${error.message}`)
    } finally {
      if (isInitialSearch) {
        setIsSearchingDB(false)
      } else {
        setIsLoadingMore(false)
      }
    }
  }

  const handleDatabaseSearch = (keyword) => searchArticlesInDB(keyword, 1, false)
  
  const loadMoreResults = () => {
    if (lastSearchKeyword && !isLoadingMore) {
      searchArticlesInDB(lastSearchKeyword, currentPage + 1, true)
    }
  }

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50
    if (bottom && hasMoreResults && !isLoadingMore && lastSearchKeyword) {
      loadMoreResults()
    }
  }

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      {/* Articles column */}
      <div>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Articles</h2>
        
        <ArticleSearchInternal 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultCount={filteredArticles.length}
          onDatabaseSearch={handleDatabaseSearch}
          isSearching={isSearchingDB}
        />

        {/* Source filter toolbar */}
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#f8f9fa', 
          borderRadius: 8,
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 8
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#495057' }}>
              Filter by Source 
            </span>
            {selectedSources.size > 0 && (
              <button
                onClick={clearSourceFilters}
                style={{
                  padding: '4px 8px',
                  fontSize: 12,
                  border: '1px solid #dee2e6',
                  borderRadius: 4,
                  background: '#fff',
                  color: '#6c757d',
                  cursor: 'pointer'
                }}
              >
                Clear all
              </button>
            )}
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 8 
          }}>
            {availableSources.map(source => {
              const isSelected = selectedSources.has(source)
              return (
                <button
                  key={source}
                  onClick={() => toggleSource(source)}
                  style={{
                    padding: '12px 20px',
                    fontSize: 13,
                    border: isSelected ? '1px solid #007acc' : '1px solid #dee2e6',
                    borderRadius: 30,
                    fontWeight: 700,
                    background: isSelected ? '#007acc' : '#fff',
                    color: isSelected ? '#fff' : '#495057',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontWeight: isSelected ? 600 : 400
                  }}
                >
                  {source}
                </button>
              )
            })}
          </div>
          {selectedSources.size > 0 && (
            <div style={{ 
              marginTop: 8, 
              fontSize: 12, 
              color: '#6c757d' 
            }}>
              {selectedSources.size} source{selectedSources.size !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {isLoadingArticles ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
            Loading articles...
          </div>
        ) : (
          <div 
            style={{ display: 'grid', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}
            onScroll={handleScroll}
          >
            {filteredArticles.length === 0 ? (
              <div style={{ 
                padding: 40, 
                textAlign: 'center', 
                color: '#999',
                background: '#f9f9f9',
                borderRadius: 8,
                border: '1px dashed #ddd'
              }}>
                {searchQuery ? 'No articles match your search' : 'No articles available'}
              </div>
            ) : (
              filteredArticles.map((article, index) => {
              const articleId = article._id
              const assignedIds = assignments[articleId] || []
              const isSelected = selectedArticleId === articleId
              
              return (
                <div key={index}>
                  <ArticleItem
                    article={article}
                    assignedCount={assignedIds.length}
                    isSelected={isSelected}
                    onClick={() => handleArticleClick(articleId)}
                  />
                  
                  <AnimatePresence>
                    {isSelected && (
                      <AssignmentCanvas
                        articleId={articleId}
                        articleTitle={article.title}
                        assignedIds={assignedIds}
                        annotators={fetchedUsers.length > 0 ? fetchedUsers : annotators}
                        onDragOver={onDragOver}
                        onDrop={onDropToArticle}
                        onUnassign={onUnassign}
                        onConfirmAssignment={handleConfirmAssignment}
                        isAssigning={isAssigning}
                      />
                    )}
                  </AnimatePresence>
                </div>
              )
              })
            )}
            {isLoadingMore && (
              <div style={{ 
                padding: 20, 
                textAlign: 'center', 
                color: '#666',
                fontSize: 14
              }}>
                Loading more results...
              </div>
            )}
            {!isLoadingMore && hasMoreResults && lastSearchKeyword && (
              <div style={{ 
                padding: 20, 
                textAlign: 'center', 
                color: '#999',
                fontSize: 13
              }}>
                Scroll down to load more results
              </div>
            )}
          </div>
        )}
      </div>

      {/* Annotator pool */}
      <aside>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Annotators</h2>
        {isLoadingUsers ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
            Loading users...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {(fetchedUsers.length > 0 ? fetchedUsers : annotators).map((u, index) => {
              const userId = u.user_id
              return (
                <div
                  key={index}
                  draggable
                  onDragStart={(e) => onDragStart(e, userId)}
                  title="Drag to an article to assign"
                  style={{
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 10,
                    padding: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    cursor: 'grab'
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#333' }}>{u.name || u.email || 'Unknown User'}</div>
                  <div style={{ color: '#777', fontSize: 13 }}>Specialty: {u.specialty || 'General'}</div>
                </div>
              )
            })}
          </div>
        )}

        <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: '#fff1eb', border: '1px solid rgba(226, 125, 96, 0.28)', color: '#8c422d' }}>
          <strong style={{ display: 'block', marginBottom: 6 }}>Planned features</strong>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>Search/filter annotators by specialty</li>
            <li>Bulk assign via selection</li>
            <li>Lock assignment windows</li>
            <li>Audit log of assignments</li>
          </ul>
        </div>
      </aside>
    </section>
  )
}

export default ArticleAssign
