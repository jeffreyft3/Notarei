"use client"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import "./collaborate.css"

// Threaded collaboration panel; opens the thread for the currently selected annotation (if any).
// selectedAnnotation: { id, text, category, note, startOffset, endOffset, opponentCategory, opponentNote }
const CollaborationPane = ({ 
  selectedAnnotation, 
  onEditAnnotation, 
  onSubmitRevisedAnnotations,
  revisedAnnotations = [],
  totalAnnotationsCount = 0,
  thresholdMet = false 
}) => {
  // Keep in-memory threads keyed by annotation id. For dev simplicity, we don't persist threads.
  const [threadsByAnnId, setThreadsByAnnId] = useState({})
  const [activeAnnId, setActiveAnnId] = useState(null)
  const [draft, setDraft] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      // Initialize empty thread (no automatic seeding with original note)
      return { ...prev, [annId]: [] }
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

  const handleAgreeAndAccept = () => {
    if (!selectedAnnotation || !onEditAnnotation) return
    
    console.debug("Agreeing and accepting changes for annotation:", activeAnnId)
    
    // Handle synthetic annotations (neither user nor opponent had annotations)
    if (selectedAnnotation.synthetic) {
      console.debug("Cannot accept changes for synthetic annotation - no opponent annotation exists")
      return
    }
    
    // Check if user has an annotation for this position
    const hasUserAnnotation = selectedAnnotation.category && selectedAnnotation.category !== 'No category'
    const hasOpponentAnnotation = selectedAnnotation.opponentPrimaryCategory && selectedAnnotation.opponentPrimaryCategory !== 'No category'
    
    if (!hasOpponentAnnotation) {
      console.debug("No opponent annotation to accept")
      return
    }
    
    const sentenceOrder = typeof selectedAnnotation?.sentenceOrder === 'number'
      ? selectedAnnotation.sentenceOrder
      : (typeof selectedAnnotation?.sentence_order === 'number' ? selectedAnnotation.sentence_order : null)

    if (hasUserAnnotation) {
      // Replace user's annotation with opponent's
      const updatedAnnotation = {
        ...selectedAnnotation,
        category: selectedAnnotation.opponentPrimaryCategory || selectedAnnotation.opponentCategory,
        primaryCategory: selectedAnnotation.opponentPrimaryCategory || selectedAnnotation.opponentCategory,
        secondaryCategory: selectedAnnotation.opponentSecondaryCategory || '',
        note: selectedAnnotation.opponentNote || selectedAnnotation.note,
        revised: true,
        acceptedFrom: 'opponent',
        revisedAt: new Date().toISOString(),
        sentenceOrder: sentenceOrder,
        sentence_order: sentenceOrder
      }
      onEditAnnotation(updatedAnnotation)
    } else {
      // Add opponent's annotation since user had none
      const newAnnotation = {
        id: `accepted-${Date.now()}`,
        text: selectedAnnotation.text,
        startOffset: selectedAnnotation.startOffset,
        endOffset: selectedAnnotation.endOffset,
        category: selectedAnnotation.opponentPrimaryCategory || selectedAnnotation.opponentCategory,
        primaryCategory: selectedAnnotation.opponentPrimaryCategory || selectedAnnotation.opponentCategory,
        secondaryCategory: selectedAnnotation.opponentSecondaryCategory || '',
        note: selectedAnnotation.opponentNote || '',
        revised: true,
        acceptedFrom: 'opponent',
        revisedAt: new Date().toISOString(),
        sentenceOrder: sentenceOrder,
        sentence_order: sentenceOrder
      }
      onEditAnnotation(newAnnotation)
    }
  }

  const handleSubmitToBackend = async () => {
    if (!onSubmitRevisedAnnotations || !thresholdMet) return
    
    setIsSubmitting(true)
    try {
      await onSubmitRevisedAnnotations(revisedAnnotations)
      console.log("Successfully submitted revised annotations to backend")
    } catch (error) {
      console.error("Failed to submit revised annotations:", error)
    } finally {
      setIsSubmitting(false)
    }
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
          {thresholdMet && (
            <span className="threshold-indicator">✓ Ready to Submit</span>
          )}
            </span>
          {selectedAnnotation && (
            <div style={{ fontSize: '0.85rem', color: '#555' }}>
              <strong>{selectedAnnotation.category}</strong> • {selectedAnnotation.startOffset}-{selectedAnnotation.endOffset}
              {selectedAnnotation.revised && (
                <span className="revised-indicator"> • Revised</span>
              )}
            </div>
          )}
        </div>
        <span className="collaboration-count">
          {comments.length} repl{comments.length === 1 ? 'y' : 'ies'}
          {revisedAnnotations.length > 0 && (
            <span className="revised-count"> • {revisedAnnotations.length} revised</span>
          )}
        </span>
      </motion.header>

      {/* Category Comparison Section */}
      {selectedAnnotation && (
        <motion.section
          className="category-comparison"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        >
          <div className="comparison-header">
            <h3>Annotation Comparison</h3>
          </div>
          <div className="comparison-grid">
            <div className="comparison-item">
              <div className="comparison-label">Your Choice</div>
              <div className="comparison-category your-category">
                {selectedAnnotation.category || selectedAnnotation.primaryCategory || 'No category'}
              </div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">Opponent's Choice</div>
              <div className="comparison-category opponent-category">
                {selectedAnnotation.opponentCategory || selectedAnnotation.opponentPrimaryCategory || 'No category'}
              </div>
            </div>
          </div>
          {selectedAnnotation.opponentNote && (
            <div className="opponent-notes">
              <div className="comparison-label">Opponent's Notes</div>
              <p className="opponent-note-text">{selectedAnnotation.opponentNote}</p>
            </div>
          )}
        </motion.section>
      )}

      <motion.section
        className="original-note"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="note-meta">
          <strong>Your Notes</strong>
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

      {/* Agree and Accept Section */}
      {selectedAnnotation && (
        <motion.div
          className="accept-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.15 }}
        >
          <motion.button
            type="button"
            className="accept-button"
            onClick={handleAgreeAndAccept}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={
              !activeAnnId || 
              selectedAnnotation?.synthetic || 
              !selectedAnnotation?.opponentPrimaryCategory || 
              selectedAnnotation?.opponentPrimaryCategory === 'No category'
            }
          >
            {selectedAnnotation?.synthetic 
              ? 'No Changes to Accept'
              : selectedAnnotation?.category && selectedAnnotation?.category !== 'No category' 
                ? 'Accept Opponent\'s Changes' 
                : 'Add Opponent\'s Annotation'
            }
          </motion.button>
        </motion.div>
      )}

      {/* Submit to Backend Section */}
      {thresholdMet && (
        <motion.div
          className="submit-section"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.2 }}
        >
          <div className="submission-status">
            <div className="status-text">
              <span className="status-icon">✓</span>
              Threshold met! {revisedAnnotations.length} annotations revised.
            </div>
          </div>
          <motion.button
            type="button"
            className="submit-backend-button"
            onClick={handleSubmitToBackend}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            disabled={isSubmitting || revisedAnnotations.length === 0}
          >
            {isSubmitting ? 'Submitting...' : 'Submit to Backend'}
          </motion.button>
        </motion.div>
      )}
    </motion.section>
  )
}

export default CollaborationPane