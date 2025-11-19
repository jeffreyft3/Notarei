"use client"
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Custom storage layer: tries localStorage first, falls back to API if needed
 */
const createHybridStorage = () => {
  const STORAGE_KEY = 'articles-cache'
  
  return {
    getItem: async (name) => {
      try {
        // 1. Try localStorage first (fast path)
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem(name || STORAGE_KEY)
          if (stored) {
            console.log('[Store] Loaded from localStorage')
            return stored
          }
        }
      } catch (e) {
        console.warn('[Store] localStorage read error:', e)
      }

      // 2. Fall back to API if no localStorage
      try {
        console.log('[Store] Attempting to fetch articles from API...')
        const response = await fetch('http://127.0.0.1:4000/articles', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        const articles = Array.isArray(data) ? data : data.articles || []

        // Store in localStorage for next time
        if (typeof window !== 'undefined' && articles.length > 0) {
          const stateObj = {
            articles: Object.fromEntries(articles.map(a => [a.id, a])),
            _hydrated: true,
          }
          localStorage.setItem(name || STORAGE_KEY, JSON.stringify(stateObj))
          console.log('[Store] Cached API response to localStorage')
        }

        return JSON.stringify({
          articles: Object.fromEntries(articles.map(a => [a.id, a])),
          _hydrated: true,
        })
      } catch (apiErr) {
        console.warn('[Store] API fetch error:', apiErr)
        // Return empty state if both localStorage and API fail
        return JSON.stringify({
          articles: {},
          _hydrated: false,
        })
      }
    },

    setItem: (name, value) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(name || STORAGE_KEY, value)
          console.log('[Store] Saved to localStorage')
        }
      } catch (e) {
        console.warn('[Store] localStorage write error:', e)
      }
    },

    removeItem: (name) => {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(name || STORAGE_KEY)
          console.log('[Store] Cleared localStorage')
        }
      } catch (e) {
        console.warn('[Store] localStorage remove error:', e)
      }
    },
  }
}

export const useArticlesStore = create(
  persist(
    (set, get) => ({
      // map of id -> article
      articles: {},
      _hydrated: false,

      // write an array of articles
      setArticles: (list) =>
        set({
          articles: Object.fromEntries(list.map(a => [a.id, a])),
          _hydrated: true,
        }),

      // add/update one
      upsertArticle: (article) =>
        set({ articles: { ...get().articles, [article.id]: article } }),

      // read single by id
      getById: (id) => get().articles[id],

      // get all articles as array
      getAll: () => Object.values(get().articles),

      // check if store has been hydrated
      isHydrated: () => get()._hydrated,

      // clear all
      clear: () => set({ articles: {}, _hydrated: false }),
    }),
    {
      name: 'articles-cache',
      version: 1,
      storage: createHybridStorage(),
    }
  )
)