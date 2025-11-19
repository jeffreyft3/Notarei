"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'next/navigation'

// Placeholder Admin Console with basic client-side gate and drag-and-drop mock UI

const AdminPage = () => {
  const user = useUserStore(s => s.user)
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  // Mock data
  const articles = useMemo(() => ([
    { id: 'a1', title: 'SNAP shutdown ripple effects', source: 'US News', words: 820 },
    { id: 'a2', title: 'Policy debate: Energy subsidies', source: 'Policy Weekly', words: 1290 },
    { id: 'a3', title: 'Elections and polling methods', source: 'Civic Journal', words: 1740 },
  ]), [])

  const annotators = useMemo(() => ([
    { id: 'u1', name: 'Alex Morgan', specialty: 'Loaded Language' },
    { id: 'u2', name: 'Jamie Lee', specialty: 'Framing' },
    { id: 'u3', name: 'Priya Singh', specialty: 'Source Imbalance' },
    { id: 'u4', name: 'Chris Zhao', specialty: 'Speculation' },
  ]), [])

  const [assignments, setAssignments] = useState({ /* articleId: string[] of userIds */ })


  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      router.replace('/auth/login')
    }
  }, [user, router])

  const ADMIN_CODE = process.env.NEXT_PUBLIC_ADMIN_CODE || ''
  const isLocal = typeof window !== 'undefined' && window.location.hostname === 'localhost'

  const verify = () => {
    setError("")
    // If an env code is set, require it; otherwise allow localhost.
    if (ADMIN_CODE) {
      if (code.trim() === ADMIN_CODE) {
        localStorage.setItem('isAdmin', 'true')
        setIsAdmin(true)
      } else {
        setError('Invalid admin code')
      }
    } else if (isLocal) {
      localStorage.setItem('isAdmin', 'true')
      setIsAdmin(true)
    } else {
      setError('Admin access not configured. Set NEXT_PUBLIC_ADMIN_CODE in .env.local')
    }
  }

  // DnD handlers for annotator assignment
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
    setAssignments(prev => {
      const set = new Set(prev[articleId] || [])
      set.add(userId)
      return { ...prev, [articleId]: Array.from(set) }
    })
  }
  const unassign = (articleId, userId) => {
    setAssignments(prev => {
      const list = (prev[articleId] || []).filter(id => id !== userId)
      return { ...prev, [articleId]: list }
    })
  }


  if (!user || user.role !== 'admin') {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: 20 }}>
        <h1>Admin Console</h1>
        <p style={{ color: '#555' }}>This area is restricted to administrators.</p>
        <p style={{ color: '#777' }}>You must be logged in as an admin to view this page.</p>
      </div>
    )
  }

  // ...existing code...
}

export default AdminPage