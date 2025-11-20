"use client"
import React from 'react'
import { motion } from 'framer-motion'
import './annotate.css'

// Reusable annotation window for creating or editing an annotation selection
// Props contract:
// - pendingSelection: { text, startOffset, endOffset }
// - currentAnnotation: { primaryCategory, secondaryCategory, confidenceLevel, note, additionalBiases }
// - biasCategories: string[]
// - selectOpen: boolean, setSelectOpen: fn(boolean)
// - onPrimaryChange, onSecondaryChange, onConfidenceChange, onNoteChange, onAdditionalBiasesChange, onSave, onCancel: handlers
const AnnotationWindow = ({
  pendingSelection,
  currentAnnotation,
  biasCategories = [],
  selectOpen,
  setSelectOpen,
  onPrimaryChange,
  onSecondaryChange,
  onConfidenceChange,
  onAdditionalBiasesChange,
  onNoteChange,
  onSave,
  onCancel,
  title = 'Annotate Selection'
}) => {
  if (!pendingSelection) return null

  const handleAdditionalBiasToggle = (category) => {
    const current = currentAnnotation?.additionalBiases || []
    const newBiases = current.includes(category)
      ? current.filter(b => b !== category)
      : [...current, category]
    onAdditionalBiasesChange && onAdditionalBiasesChange(newBiases)
  }

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
        width: '400px',
        minWidth: '350px',
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

      <div>
        <label>Confidence Level:</label>
        <div className={`custom-select-wrapper${selectOpen ? ' open' : ''}`}>
          <select
            value={currentAnnotation?.confidenceLevel || ''}
            onChange={(e) => onConfidenceChange && onConfidenceChange(e.target.value)}
            onFocus={() => setSelectOpen && setSelectOpen(true)}
            onBlur={() => setSelectOpen && setSelectOpen(false)}
          >
            <option value="">Confidence Level for the Primary Bias</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
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

      <div className="additional-biases-selection" style={{ marginTop: 12 }}>
        <label>Additional Biases (select multiple):</label>
        <div 
          className="checkbox-group" 
          style={{ 
            marginTop: '8px', 
            maxHeight: '120px', 
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px 12px',
            padding: '8px',
            border: '1px solid #e1e1e1',
            borderRadius: '6px',
            backgroundColor: '#fafafa'
          }}
        >
          {biasCategories.map((category, index) => {
            const isSelected = currentAnnotation?.additionalBiases?.includes(category) || false
            const isPrimary = currentAnnotation?.primaryCategory === category
            const isSecondary = currentAnnotation?.secondaryCategory === category
            const isDisabled = isPrimary || isSecondary
            
            return (
              <div key={index} className="checkbox-item" style={{ 
                opacity: isDisabled ? 0.5 : 1
              }}>
                <input
                  type="checkbox"
                  id={`additional-bias-${index}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => handleAdditionalBiasToggle(category)}
                />
                <label 
                  htmlFor={`additional-bias-${index}`}
                  style={{ 
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {category}
                  {isPrimary && <span style={{ color: '#007acc', fontSize: '12px' }}> (Primary)</span>}
                  {isSecondary && <span style={{ color: '#666', fontSize: '12px' }}> (Secondary)</span>}
                </label>
              </div>
            )
          })}
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
