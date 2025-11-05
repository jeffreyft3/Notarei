"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './annotate.css'
import { categoryColors, getAnnotationHexColor } from './colorUtils'

const AnnotationList = ({ annotations, onRemoveAnnotation, onUpdateAnnotation, onHoverAnnotation }) => {
  const [editingAnnotation, setEditingAnnotation] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const [editSecondaryCategory, setEditSecondaryCategory] = useState('')
  const [editNote, setEditNote] = useState('')
  const [selectOpen, setSelectOpen] = useState(false)

  const biasCategories = [
    'Loaded Language',
    'Framing',
    'Source Imbalance',
    'Speculation',
    'Unverified',
    'Omission',
    'Neutral'
  ]

  // Color mapping moved to colorUtils

  const handleSubmit = () => {
    if (annotations && annotations.length > 0) {
      // Save annotations to localStorage with timestamp
      const submissionData = {
        annotations: annotations,
        submittedAt: new Date().toISOString(),
        totalCount: annotations.length
      }
      localStorage.setItem('submittedAnnotations', JSON.stringify(submissionData))
      
      // Show success message
      alert(`Successfully submitted ${annotations.length} annotation${annotations.length > 1 ? 's' : ''}! You can now view them in the Review section.`)
    } else {
      alert('No annotations to submit!')
    }
  }

  const handleEditClick = (annotation) => {
    setEditingAnnotation(annotation)
    setEditCategory(annotation.primaryCategory || annotation.category)
    setEditSecondaryCategory(annotation.secondaryCategory || '')
    setEditNote(annotation.note || '')
    // Set hover effect when editing starts
    onHoverAnnotation && onHoverAnnotation(annotation.id)
  }

  // Keep the corresponding canvas highlight active while editing
  useEffect(() => {
    if (onHoverAnnotation) {
      onHoverAnnotation(editingAnnotation ? editingAnnotation.id : null)
    }
  }, [editingAnnotation, onHoverAnnotation])

  const handleSaveEdit = () => {
    if (editingAnnotation && editCategory) {
      onUpdateAnnotation(editingAnnotation.id, {
        // keep backward compat field
        category: editCategory,
        primaryCategory: editCategory,
        secondaryCategory: editSecondaryCategory,
        note: editNote
      })
      setEditingAnnotation(null)
      setEditCategory('')
      setEditSecondaryCategory('')
      setEditNote('')
      // Clear hover effect when editing is saved
      onHoverAnnotation && onHoverAnnotation(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingAnnotation(null)
    setEditCategory('')
    setEditNote('')
    // Clear hover effect when editing is cancelled
    onHoverAnnotation && onHoverAnnotation(null)
  }

  if (!annotations || annotations.length === 0) {
    return (
      <motion.div
        className="annotations-list"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h3>Annotations</h3>
        <p className="annotations-list-empty">No annotations yet. Select text in the document to add annotations.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="annotations-list"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <h3>Annotations ({annotations.length})</h3>
      <div className="annotations-list-container">
        {annotations.map((annotation) => (
          <div 
            key={annotation.id} 
            className="annotation-item"
            onClick={() => handleEditClick(annotation)}
            onMouseEnter={() => {
              // While editing, keep the edit target highlighted; ignore other hovers
              if (!editingAnnotation) {
                onHoverAnnotation && onHoverAnnotation(annotation.id)
              }
            }}
            onMouseLeave={() => {
              // Don't clear hover if we're editing (persist selection highlight)
              if (!editingAnnotation) {
                onHoverAnnotation && onHoverAnnotation(null)
              }
            }}
            style={{
              border: `3px solid ${getAnnotationHexColor(annotation) || '#ccc'}`
            }}
          >
            <div className="annotation-item-wrapper">
              <div className="annotation-item-content">
                <strong 
                  className='annotation-item-label' 
                  style={{ background: getAnnotationHexColor(annotation), color: '#222' }}
                >
                  {annotation.primaryCategory || annotation.category}
                </strong>
                {annotation.secondaryCategory && (
                  <div style={{ marginTop: 4, fontSize: '0.85em', color: '#555' }}>
                    Secondary: {annotation.secondaryCategory}
                  </div>
                )}
                <p className="annotation-item-text">
                  "{annotation.text}"
                </p>
                {annotation.note && (
                  <p className="annotation-item-note">
                    {annotation.note}
                  </p>
                )}
                <small className="annotation-item-position">
                  Position: {annotation.startOffset}-{annotation.endOffset}
                </small>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveAnnotation(annotation.id)
                }}
                className="annotation-item-delete-btn"
                title="Remove annotation"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="annotation-actions-footer">
        <button className='submit-button' onClick={handleSubmit}>
            Submit
        </button>
      </div>

      {/* Edit Annotation Window */}
      <AnimatePresence mode="wait">
        {editingAnnotation && (
          <motion.div 
            key="edit-annotation-window"
            className="annotation-window annotation-window-fixed"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: '-45%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-45%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <h3>Edit Annotation</h3>
            
            <div className="annotation-window-content selected-text">
              <strong>Selected text:</strong>
              <p>"{editingAnnotation.text}"</p>
              <small>
                Characters {editingAnnotation.startOffset}-{editingAnnotation.endOffset}
              </small>
            </div>

            <div className="annotation-form-group bias-category-selection">
              <label className="annotation-form-label">Primary Bias Category:</label>
              <div className={`custom-select-wrapper${selectOpen ? ' open' : ''}`}>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  onFocus={() => setSelectOpen(true)}
                  onBlur={() => setSelectOpen(false)}
                >
                  <option value="">Select a primary category</option>
                  {biasCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="annotation-form-group bias-category-selection">
              <label className="annotation-form-label">Secondary Bias Category (optional):</label>
              <div className={`custom-select-wrapper${selectOpen ? ' open' : ''}`}>
                <select
                  value={editSecondaryCategory}
                  onChange={(e) => setEditSecondaryCategory(e.target.value)}
                  onFocus={() => setSelectOpen(true)}
                  onBlur={() => setSelectOpen(false)}
                >
                  <option value="">None</option>
                  {biasCategories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="annotation-form-group annotation-note">
              <label className="annotation-form-label">Note (optional):</label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                placeholder="Add a note about this annotation..."
                className="annotation-form-textarea"
              />
            </div>

            <div className="annotation-button-group">
              <button 
                onClick={handleSaveEdit}
                disabled={!editCategory}
                className="annotation-btn-save"
              >
                Save
              </button>
              <button 
                onClick={handleCancelEdit}
                className="annotation-btn-cancel"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AnnotationList