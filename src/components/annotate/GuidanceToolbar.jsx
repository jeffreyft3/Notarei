"use client"
import React from "react"
import { motion } from "framer-motion"

const GuidanceToolbar = ({ stage, annotationCount, setStage }) => {
  const instructions = [
    "Read through the article and highlight biased or notable passages.",
    "Choose a bias category from the sidebar that best matches the selection.",
    "Add a short note explaining why the passage reflects that bias.",
    "After you're done with annotations, hit the submit button on the very bottom.",
  ]

  const stageLabel = stage === "reviewing" ? "Reviewing" : "Annotating"

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
            <span className="summary-value">{annotationCount}</span>
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
    </motion.div>
  )
}

export default GuidanceToolbar
