"use client"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import "./collaborate.css"

// Threaded collaboration panel; opens the thread for the currently selected annotation (if any).
// selectedAnnotation: { id, text, category, note, startOffset, endOffset }
const CollaborationPane = ({ selectedAnnotation }) => {
  // Keep in-memory threads keyed by annotation id. For dev simplicity, we don't persist threads.
  const [threadsByAnnId, setThreadsByAnnId] = useState({})
  const [activeAnnId, setActiveAnnId] = useState(null)
  const [draft, setDraft] = useState("")

  // Derive the currently active thread comments
  const comments = useMemo(() => {
    if (!activeAnnId) return []
    return threadsByAnnId[activeAnnId] || []
  }, [activeAnnId, threadsByAnnId])

  // When selection changes, open existing thread or initialize a new one
  useEffect(() => {
    const annId = selectedAnnotation?.id || null
    setActiveAnnId(annId)
    if (!annId) return
    setThreadsByAnnId(prev => {
      if (prev[annId]) return prev
      // Seed a starter message referencing the original note if available
      const seed = selectedAnnotation?.note
        ? [{
            id: `seed-${annId}`,
            author: "Annotator",
            role: "annotator",
            text: selectedAnnotation.note,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }]
        : []
      return { ...prev, [annId]: seed }
    })
  }, [selectedAnnotation])

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    if (!activeAnnId) return
    const newComment = {
      id: `c-${Date.now()}`,
      author: "You",
      role: "you",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setThreadsByAnnId(prev => ({
      ...prev,
      [activeAnnId]: [...(prev[activeAnnId] || []), newComment]
    }))
    setDraft("")
  }

  const handleEscalate = () => {
    console.debug("Escalating thread to moderator")
  }

  return (
    <motion.section
      className="collaboration-pane"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <motion.header
        className="collaboration-header"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
      >
        <div>
            <span>
          <h2 style={{ margin: 0 }}>Thread</h2>

            </span>
          {selectedAnnotation && (
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              <strong>{selectedAnnotation.category}</strong> • {selectedAnnotation.startOffset}-{selectedAnnotation.endOffset}
            </div>
          )}
        </div>
        <span className="collaboration-count">{comments.length} repl{comments.length === 1 ? 'y' : 'ies'}</span>
      </motion.header>

      <motion.section
        className="original-note"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="note-meta">
          <strong>Original note</strong>
          <span className="note-meta-author">Annotator</span>
        </div>
        {!selectedAnnotation ? (
          <p className="note-placeholder">Select an annotation from the left to open its thread.</p>
        ) : selectedAnnotation.note ? (
          <p>{selectedAnnotation.note}</p>
        ) : (
          <p className="note-placeholder">This annotator did not leave a note for this highlight.</p>
        )}
      </motion.section>

      <section className="conversation">
        <div className="conversation-header">
          <h3>Conversation</h3>
          <span className="conversation-hint">Discuss and refine this annotation together.</span>
        </div>

        <div className="conversation-feed">
          {(!selectedAnnotation || !activeAnnId) && (
            <div className="note-placeholder" style={{ padding: '12px 4px' }}>
              No thread open. Choose an annotation to start.
            </div>
          )}
          {comments.map((comment, index) => {
            const bubbleClassName = `comment-bubble comment-bubble-${comment.role}`
            return (
              <motion.article
                key={comment.id}
                className={bubbleClassName}
                initial={{ opacity: 0, x: comment.role === "you" ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 * index }}
              >
                <header className="comment-header">
                  <span className="comment-author">{comment.author}</span>
                  <span className="comment-timestamp">{comment.timestamp}</span>
                </header>
                <p className="comment-body">{comment.text}</p>
              </motion.article>
            )
          })}
        </div>
      </section>

      <motion.form
        className="comment-composer"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      >
        <label htmlFor="commentDraft" className="composer-label">
          Reply as reviewer
        </label>
        <textarea
          id="commentDraft"
          name="commentDraft"
          placeholder="Share feedback or ask a clarifying question..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          disabled={!activeAnnId}
        />
        <div className="composer-actions">
          <motion.button
            type="button"
            className="composer-escalate"
            onClick={handleEscalate}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={!activeAnnId}
          >
            Escalate
          </motion.button>
          <motion.button
            type="submit"
            className="composer-submit"
            disabled={!draft.trim() || !activeAnnId}
            whileHover={{ scale: draft.trim() && activeAnnId ? 1.03 : 1 }}
            whileTap={{ scale: draft.trim() && activeAnnId ? 0.97 : 1 }}
          >
            Reply
          </motion.button>
        </div>
      </motion.form>
    </motion.section>
  )
}

export default CollaborationPane