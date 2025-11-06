"use client"
import React from 'react'
import { motion } from 'framer-motion'
import './annotate.css'

// Reusable annotation window for creating or editing an annotation selection
// Props contract:
// - pendingSelection: { text, startOffset, endOffset }
// - currentAnnotation: { primaryCategory, secondaryCategory, note }
// - biasCategories: string[]
// - selectOpen: boolean, setSelectOpen: fn(boolean)
// - onPrimaryChange, onSecondaryChange, onNoteChange, onSave, onCancel: handlers
const AnnotationWindow = ({
  pendingSelection,
  currentAnnotation,
  biasCategories = [],
  selectOpen,
  setSelectOpen,
  onPrimaryChange,
  onSecondaryChange,
  onNoteChange,
  onSave,
  onCancel,
  title = 'Annotate Selection'
}) => {
  if (!pendingSelection) return null

  return (
    <motion.div 
      key="new-annotation-window"
      className="annotation-window"
      initial={{ opacity: 0, scale: 0.95, y: '-45%' }}
      animate={{ opacity: 1, scale: 1, y: '-50%' }}
      exit={{ opacity: 0, scale: 0.95, y: '-45%' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000
      }}
    >
      <h3>{title}</h3>
      <div className="selected-text" style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Selected text:</strong>
        <p>"{pendingSelection.text}"</p>
        <small style={{ color: '#666' }}>
          Characters {pendingSelection.startOffset}-{pendingSelection.endOffset}
        </small>
      </div>

      <div className="bias-category-selection">
        <label>Primary Bias Category:</label>
        <div className={`custom-select-wrapper${selectOpen ? ' open' : ''}`}>
          <select
            value={currentAnnotation?.primaryCategory || ''}
            onChange={(e) => onPrimaryChange && onPrimaryChange(e.target.value)}
            onFocus={() => setSelectOpen && setSelectOpen(true)}
            onBlur={() => setSelectOpen && setSelectOpen(false)}
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

      <div className="bias-category-selection" style={{ marginTop: 12 }}>
        <label>Secondary Bias Category (optional):</label>
        <div className={`custom-select-wrapper${selectOpen ? ' open' : ''}`}>
          <select
            value={currentAnnotation?.secondaryCategory || ''}
            onChange={(e) => onSecondaryChange && onSecondaryChange(e.target.value)}
            onFocus={() => setSelectOpen && setSelectOpen(true)}
            onBlur={() => setSelectOpen && setSelectOpen(false)}
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

      <div className="annotation-note">
        <label>Note (optional):</label>
        <textarea
          value={currentAnnotation?.note || ''}
          onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
          placeholder="Add a note about this annotation..."
        />
      </div>

      <div className="annotation-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
        <button 
          onClick={onSave}
          disabled={!currentAnnotation?.primaryCategory}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: currentAnnotation?.primaryCategory ? '#007acc' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: currentAnnotation?.primaryCategory ? 'pointer' : 'not-allowed'
          }}
        >
          Save
        </button>
        <button 
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  )
}

export default AnnotationWindow
