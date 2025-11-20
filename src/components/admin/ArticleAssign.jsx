"use client"
import React, { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useUser } from '@auth0/nextjs-auth0/client'
import ArticleItem from './ArticleItem'
import AssignmentCanvas from './AssignmentCanvas'

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
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      {/* Articles column */}
      <div>
        <h2 style={{ marginTop: 0, marginBottom: '10px' }}>Articles</h2>
        {isLoadingArticles ? (
          <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
            Loading articles...
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
            {(fetchedArticles.length > 0 ? fetchedArticles : articles).map((article, index) => {
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
            })}
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
            {(fetchedUsers.length > 0 ? fetchedUsers : annotators).map(u => {
              const userId = u.user_id
              return (
                <div
                  key={userId}
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
                  <div style={{ fontWeight: 700 }}>{u.name || u.email || 'Unknown User'}</div>
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
