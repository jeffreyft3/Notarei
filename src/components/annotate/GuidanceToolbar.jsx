"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

const GuidanceToolbar = ({ stage, setStage, annotations }) => {
  const [submittedData, setSubmittedData] = useState(null)

  const instructions = [
    "Read through the article and highlight biased or notable passages.",
    "Choose a bias category from the sidebar that best matches the selection.",
    "Add a short note explaining why the passage reflects that bias.",
    "After you're done with annotations, hit the submit button on the very bottom.",
  ]

  const stageLabel = stage === "reviewing" ? "Reviewing" : "Annotating"

  // Load submitted annotations from localStorage when in reviewing mode
  useEffect(() => {
    if (stage === "reviewing") {
      const savedData = localStorage.getItem('submittedAnnotations')
      if (savedData) {
        setSubmittedData(JSON.parse(savedData))
      }
    }
  }, [stage])

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
                        {submittedData.annotations.map((ann, index) => (
                          <li key={ann.id || index} style={{ 
                            marginBottom: '12px',
                            padding: '10px',
                            background: 'white',
                            borderRadius: '6px',
                            borderLeft: '3px solid var(--primary)'
                          }}>
                            <strong style={{ color: 'var(--primary)' }}>{ann.category}</strong>
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
                        ))}
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
