"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

const GuidanceToolbar = ({ stage, setStage, annotations, onHoverAnnotation, onSelectAnnotation }) => {
  const [submittedData, setSubmittedData] = useState(null)
  const [selectedReviewId, setSelectedReviewId] = useState(null)

  const instructions = [
    "Read through the article and highlight biased or notable passages.",
    "Choose a bias category from the sidebar that best matches the selection.",
    "Add a short note explaining why the passage reflects that bias.",
    "After you're done with annotations, hit the submit button on the very bottom.",
  ]

  const stageLabel = stage === "reviewing" ? "Reviewing" : "Annotating"

  // Color mapping for each bias category (kept consistent with canvas)
  const categoryColors = {
    'Loaded Language': '#ffeb3b',
    'Framing': '#ff9800',
    'Source Imbalance': '#f44336',
    'Speculation': '#e91e63',
    'Unverified': '#9c27b0',
    'Omission': '#673ab7',
    'Neutral': '#4caf50'
  }

  // Load submitted annotations from localStorage when in reviewing mode
  useEffect(() => {
    if (stage === "reviewing") {
      const savedData = localStorage.getItem('submittedAnnotations')
      if (savedData) {
        setSubmittedData(JSON.parse(savedData))
      }
    }
  }, [stage])

  // Clear canvas highlight when leaving reviewing or when list deselects
  useEffect(() => {
    if (onHoverAnnotation) {
      // Only maintain highlight in reviewing when a selection exists
      onHoverAnnotation(stage === 'reviewing' ? selectedReviewId : null)
    }
  }, [stage, selectedReviewId, onHoverAnnotation])

  const handleReviewClick = (ann) => {
    const nextId = selectedReviewId === (ann.id ?? null) ? null : (ann.id ?? null)
    setSelectedReviewId(nextId)
    onHoverAnnotation && onHoverAnnotation(nextId)
    onSelectAnnotation && onSelectAnnotation(nextId ? ann : null)
  }

  return (
    <motion.div
      className="guidance-toolbar"
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="guidance-content">
        <aside className = "guidance-actions">
        <div className="guidance-summary">
            <span className="summary-label">Annotations</span>
            <span className="summary-value">{annotations.length}</span>
          </div>
          <div className="guidance-stage-indicator" aria-live="polite">
            <span className="stage-indicator-label">Current stage</span>
            <span className="stage-indicator-value">{stageLabel}</span>
          </div>
          <div className="guidance-stage-toggle" role="tablist" aria-label="Workspace mode">
            <button
              type="button"
              className={`stage-button ${stage === "annotating" ? "active" : ""}`}
              onClick={() => setStage("annotating")}
              aria-pressed={stage === "annotating"}
            >
              Annotating
            </button>
            <button
              type="button"
              className={`stage-button ${stage === "reviewing" ? "active" : ""}`}
              onClick={() => setStage("reviewing")}
              aria-pressed={stage === "reviewing"}
            >
              Reviewing
            </button>
          </div>
          </aside>

          {stage === "annotating" && (
            <div>

            <section className="guidance-instructions">
          <h3>Annotation Workflow</h3>
          <ol>
            {instructions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ol>
        </section>

        <aside className="guidance-actions">
          <div className="guidance-tip">
            <span className="tip-label">Tip</span>
            <p>Select text from the article pane to open the annotation window.</p>
          </div>
        </aside>
            </div>
          )}
          {
            stage === "reviewing" && (
              <div>
                <h3>Review Submitted Annotations</h3>
                {!submittedData || !submittedData.annotations || submittedData.annotations.length === 0 ? (
                  <div className="guidance-tip">
                    <p>No submitted annotations found. Submit annotations in the Annotating mode first.</p>
                  </div>
                ) : (
                  <div>
                    <div className="guidance-summary" style={{ marginBottom: '15px' }}>
                      <span className="summary-label">Submitted</span>
                      <span className="summary-value">
                        {new Date(submittedData.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ 
                      maxHeight: '400px', 
                      overflowY: 'auto',
                      padding: '10px',
                      background: 'rgba(226, 125, 96, 0.05)',
                      borderRadius: '8px'
                    }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {submittedData.annotations.map((ann, index) => {
                          const active = selectedReviewId === (ann.id ?? null)
                          const color = categoryColors[ann.category] || 'var(--primary)'
                          return (
                            <li
                              key={ann.id || index}
                              onClick={() => handleReviewClick(ann)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleReviewClick(ann) } }}
                              style={{ 
                                marginBottom: '12px',
                                padding: '10px',
                                background: active ? 'rgba(0,0,0,0.03)' : 'white',
                                borderRadius: '6px',
                                borderLeft: `4px solid ${color}`,
                                cursor: 'pointer',
                                boxShadow: active ? '0 0 0 2px rgba(0,0,0,0.05) inset' : 'none'
                              }}
                            >
                              <strong style={{ color: '#222', background: color, padding: '2px 6px', borderRadius: '4px' }}>{ann.category}</strong>
                              <p style={{ 
                                margin: '5px 0 0 0', 
                                fontSize: '0.9em',
                                fontStyle: 'italic',
                                color: '#555'
                              }}>
                                "{ann.text}"
                              </p>
                              {ann.note && (
                                <p style={{ 
                                  margin: '5px 0 0 0', 
                                  fontSize: '0.85em',
                                  color: '#666'
                                }}>
                                  Note: {ann.note}
                                </p>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                )}

              <div className="guidance-tip" style={{ marginTop: '20px' }}>
                <span className="tip-label">Tip</span>
                <p>Engage in discussions with collaborators on specific annotations.</p>
              </div>
              </div>
            )
          }
      </div>
    </motion.div>
  )
}

export default GuidanceToolbar
