"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { categoryColors, getAnnotationHexColor } from './colorUtils'



const GuidanceToolbar = ({ stage, annotations, unmatchedAnnotations, onHoverAnnotation, onSelectAnnotation, matchPercentage, thresholdMet, totalSentences, matchingCount }) => {
  const [submittedData, setSubmittedData] = useState(null)
  const [selectedReviewId, setSelectedReviewId] = useState(null)

  const instructions = [
    "Read through the article and highlight biased or notable passages.",
    "Choose a bias category from the sidebar that best matches the selection.",
    "Add a short note explaining why the passage reflects that bias.",
    "After you're done with annotations, hit the submit button on the very bottom.",
  ]

  const stageLabel = stage === "reviewing" ? "Reviewing" : "Annotating"

  // Colors provided by colorUtils

  // Load peer submitted annotations 
  
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
          <div className="guidance-stage-indicator" aria-live="polite">
            <span className="stage-indicator-label">Current stage</span>
            <span className="stage-indicator-value">{stageLabel}</span>
          </div>
          <div className="guidance-summary">
            <span className="summary-label">
              {stage === "reviewing" ? "Threshold" : "Annotations"}
            </span>
            <span className="summary-value">
              {stage === "reviewing" ? "85%" : annotations.length}
            </span>
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
                {!unmatchedAnnotations || unmatchedAnnotations.length === 0 ? (
                  <div className="guidance-tip">
                    <p>Great! All annotations match between you and your co-annotator.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{
                        background: (() => {
                          const percentage = matchPercentage || 0
                          if (percentage >= 85) return 'linear-gradient(135deg, #10b981, #059669)'
                          if (percentage >= 70) return 'linear-gradient(135deg, #f59e0b, #d97706)'
                          if (percentage >= 50) return 'linear-gradient(135deg, #f97316, #ea580c)'
                          return 'linear-gradient(135deg, #ef4444, #dc2626)'
                        })(),
                        padding: '12px 16px',
                        borderRadius: '8px',
                        color: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        marginBottom: '8px'
                      }}>
                        <div style={{ 
                          fontSize: '1.1em', 
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span>Match Progress</span>
                          <span style={{ fontSize: '1.3em' }}>{matchPercentage}%</span>
                        </div>
                        <div style={{ 
                          fontSize: '0.85em', 
                          opacity: 0.9,
                          marginTop: '4px'
                        }}>
                          {thresholdMet ? '✓ Threshold met (85%)' : (() => {
                            const requiredMatches = Math.ceil((totalSentences || 0) * 0.85)
                            const currentMatches = matchingCount || 0
                            const needed = Math.max(0, requiredMatches - currentMatches)
                            return `Need ${needed} more matching annotation${needed !== 1 ? 's' : ''} (${requiredMatches} total required)`
                          })()}
                        </div>
                      </div>
                      <small style={{ color: '#666' }}>
                        {unmatchedAnnotations.length} annotation(s) need attention
                      </small>
                    </div>
                    <div style={{ 
                      maxHeight: '400px', 
                      overflowY: 'auto',
                      padding: '10px',
                      background: 'rgba(228, 136, 110, 0.2)',
                      borderRadius: '8px'
                    }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {unmatchedAnnotations.map((ann, index) => {
                          const active = selectedReviewId === (ann.id ?? null)
                          const color = getAnnotationHexColor(ann) || 'var(--primary)'
                          const isOpponentOnly = ann.type === 'opponent-only'
                          
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
                                background: active ? 'hsla(44, 100%, 56%, 0.44)' : 'white',
                                borderRadius: '6px',
                                borderLeft: `4px solid ${color}`,
                                cursor: 'pointer',
                                boxShadow: active ? '0 0 0 2px rgba(0,0,0,0.05) inset' : 'none',
                                opacity: isOpponentOnly ? 0.7 : 1,
                                filter: isOpponentOnly ? 'brightness(1.1)' : 'none'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                {!isOpponentOnly && (
                                  <strong style={{ 
                                    color: '#222', 
                                    background: color, 
                                    padding: '2px 6px', 
                                    borderRadius: '4px'
                                  }}>
                                    {ann.primaryCategory || ann.category}
                                  </strong>
                                )}
                                <span style={{ 
                                  fontSize: '0.75em',
                                  color: isOpponentOnly ? '#888' : '#666',
                                  fontStyle: 'italic'
                                }}>
                                  {ann.displayText}
                                </span>
                                {/* {isOpponentOnly && (
                                  <span style={{ 
                                    fontSize: '0.7em',
                                    background: '#f3f4f6',
                                    color: '#6b7280',
                                    padding: '1px 4px',
                                    borderRadius: '3px'
                                  }}>
                                    no conflict
                                  </span>
                                )} */}
                              </div>
                              <p style={{ 
                                margin: '8px 0 0 0', 
                                fontSize: '0.9em',
                                color: isOpponentOnly ? '#777' : '#555'
                              }}>
                                "{ann.text.slice(0, 50)}{ann.text.length > 50 ? '...' : ''}"
                              </p>
                              {ann.note && (
                                <p style={{ 
                                  margin: '5px 0 0 0', 
                                  fontSize: '0.85em',
                                  color: isOpponentOnly ? '#888' : '#666'
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
                <p>Focus on disagreements (normal opacity) first. Lighter items show co-annotator annotations where you didn't annotate.</p>
              </div>
              </div>
            )
          }
      </div>
    </motion.div>
  )
}

export default GuidanceToolbar
