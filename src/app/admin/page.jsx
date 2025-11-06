"use client"
import React, { useEffect, useMemo, useState } from 'react'

// Placeholder Admin Console with basic client-side gate and drag-and-drop mock UI
const AdminPage = () => {
  const [isAdmin, setIsAdmin] = useState(false)
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
    // Client-only admin gate (placeholder). For real auth, move this to middleware or server route checks.
    const saved = typeof window !== 'undefined' ? localStorage.getItem('isAdmin') : null
    if (saved === 'true') setIsAdmin(true)
  }, [])

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

  if (!isAdmin) {
    return (
      <div style={{ maxWidth: 560, margin: '60px auto', padding: 20 }}>
        <h1>Admin Console</h1>
        <p style={{ color: '#555' }}>This area is restricted to administrators.</p>
        {ADMIN_CODE ? (
          <p style={{ color: '#777' }}>Enter the admin code to continue.</p>
        ) : (
          <p style={{ color: '#777' }}>No admin code configured. On localhost you can continue without a code. Set NEXT_PUBLIC_ADMIN_CODE in .env.local for production-like checks.</p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {ADMIN_CODE && (
            <input
              type="password"
              placeholder="Admin code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{ flex: 1, padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd' }}
            />
          )}
          <button onClick={verify} style={{ padding: '10px 14px', border: 'none', borderRadius: 6, background: '#007acc', color: '#fff', cursor: 'pointer' }}>
            Continue
          </button>
        </div>
        {error && <p style={{ color: '#b00020', marginTop: 10 }}>{error}</p>}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin Console</h1>
          <p style={{ color: '#666', margin: '6px 0 0 0' }}>Placeholder features for assigning annotators to articles.</p>
        </div>
        <button
          onClick={() => { localStorage.removeItem('isAdmin'); setIsAdmin(false) }}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, background: '#fff', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        {/* Articles column */}
        <div>
          <h2 style={{ marginTop: 0 }}>Articles</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {articles.map((a) => {
              const assignedIds = assignments[a.id] || []
              return (
                <div key={a.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <strong>{a.title}</strong>
                      <div style={{ color: '#777', fontSize: 12 }}>{a.source} • {a.words} words</div>
                    </div>
                    <div style={{ fontSize: 12, color: '#666' }}>{assignedIds.length} assigned</div>
                  </div>
                  <div
                    onDragOver={onDragOver}
                    onDrop={(e) => onDropToArticle(e, a.id)}
                    style={{
                      padding: 12,
                      borderTop: '1px dashed #ddd',
                      minHeight: 64,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 8,
                      alignItems: 'flex-start',
                      background: 'rgba(0,0,0,0.015)'
                    }}
                    aria-label={`Drop annotators here for ${a.title}`}
                  >
                    {assignedIds.length === 0 && (
                      <span style={{ color: '#999', fontSize: 13 }}>Drag annotator cards here…</span>
                    )}
                    {assignedIds.map(uid => {
                      const user = annotators.find(u => u.id === uid)
                      if (!user) return null
                      return (
                        <div key={uid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#fafafa', border: '1px solid #eee', borderRadius: 8 }}>
                          <span style={{ fontWeight: 600 }}>{user.name}</span>
                          <span style={{ color: '#777', fontSize: 12 }}>• {user.specialty}</span>
                          <button onClick={() => unassign(a.id, uid)} title="Unassign" style={{ marginLeft: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#b00020' }}>×</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Annotator pool */}
        <aside>
          <h2 style={{ marginTop: 0 }}>Annotators</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {annotators.map(u => (
              <div
                key={u.id}
                draggable
                onDragStart={(e) => onDragStart(e, u.id)}
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
                <div style={{ fontWeight: 700 }}>{u.name}</div>
                <div style={{ color: '#777', fontSize: 13 }}>Specialty: {u.specialty}</div>
              </div>
            ))}
          </div>

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
    </div>
  )
}

export default AdminPage