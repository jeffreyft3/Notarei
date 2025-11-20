"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Annotate from '@/components/annotate/Annotate'
import { useArticlesStore } from '@/store/Store'
import './annotate.css'

const Page = () => {
  const { slug } = useParams()
  const router = useRouter()
  const getById = useArticlesStore(s => s.getById)
  const upsertArticle = useArticlesStore(s => s.upsertArticle)

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    // Try store first (fast path)
    const fromStore = getById(slug)
    if (fromStore) {
      setArticle(fromStore)
      setLoading(false)
      return
    }

    // Optional: fetch single article if user lands directly on this route
    const fetchSingle = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/articles/${slug}`)
        if (!res.ok) throw new Error('Not found')
        const data = await res.json()
        console.log('Fetched article:', data)
        console.log('Sentences:', data.article?.sentences)
        // Backend returns { article: {...} }
        const a = data.article || data

        const normalized = {
          id: a.id || a._id || a.slug || slug,
          _id: a._id || a.id,
          title: a.title || 'Untitled',
          body: a.body || a.content || a.text || '',
          sentences: a.sentences || [],
          excerpt: a.excerpt || '',
          publishedAt: a.publishedAt || a.published_at || new Date().toISOString(),
          source: a.source?.title || a.source || 'Unknown',
          annotationCount: a.annotationCount ?? 0,
          reviewCount: a.reviewCount ?? 0,
        }
        upsertArticle(normalized)
        setArticle(normalized)
      } catch (err) {
        console.error('Error fetching article:', err)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSingle()
  }, [slug, getById, upsertArticle])

  if (loading) {
    return (
      <div className="pageWrapper">
        <div className="loading-state">Loading article…</div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="pageWrapper">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Couldn't find that article. Open from the Articles list, or go back.</p>
          <button onClick={() => router.push('/')} className="retry-button">
            Back to Articles
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pageWrapper">
      <Annotate articleText={article.body} articleSentences={article.sentences} />
    </div>
  )
}

export default Page