"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import "./collaborate.css"

const CollaborationPane = ({ originalNote = "The tone shifts sharply when discussing alternative data sources. That might confuse readers and could benefit from clarification." }) => {
  const [comments, setComments] = useState(() => [
    {
      id: "c1",
      author: "Alex M.",
      role: "reviewer",
      text: "Thanks for flagging this passage. Can you clarify what specific bias you saw here?",
      timestamp: "5m ago",
    },
    {
      id: "c2",
      author: "Morgan S.",
      role: "annotator",
      text: "I noticed the source list excludes opposing viewpoints, which could signal selection bias.",
      timestamp: "2m ago",
    },
  ])
  const [draft, setDraft] = useState("")

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed) return

    const newComment = {
      id: `c-${Date.now()}`,
      author: "You",
      role: "you",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setComments((prev) => [...prev, newComment])
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
        <h2>Collaboration Thread</h2>
        <span className="collaboration-count">{comments.length} replies</span>
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
        {originalNote ? (
          <p>{originalNote}</p>
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
        />
        <div className="composer-actions">
          <motion.button
            type="button"
            className="composer-escalate"
            onClick={handleEscalate}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Escalate to Moderator
          </motion.button>
          <motion.button
            type="submit"
            className="composer-submit"
            disabled={!draft.trim()}
            whileHover={{ scale: draft.trim() ? 1.03 : 1 }}
            whileTap={{ scale: draft.trim() ? 0.97 : 1 }}
          >
            Send Reply
          </motion.button>
        </div>
      </motion.form>
    </motion.section>
  )
}

export default CollaborationPane