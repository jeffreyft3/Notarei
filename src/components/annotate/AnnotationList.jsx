"use client"
import React from 'react'
import { motion } from 'framer-motion'

const AnnotationList = ({ annotations, onRemoveAnnotation }) => {
  // Color mapping for each bias category
  const categoryColors = {
    'Loaded Language': '#ffeb3b',
    'Framing': '#ff9800',
    'Source Imbalance': '#f44336',
    'Speculation': '#e91e63',
    'Unverified': '#9c27b0',
    'Omission': '#673ab7',
    'Neutral': '#4caf50'
  }

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

  if (!annotations || annotations.length === 0) {
    return (
      <motion.div
        className="annotations-list"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <h3>Annotations</h3>
        <p style={{ color: '#666', fontStyle: 'italic' }}>No annotations yet. Select text in the document to add annotations.</p>
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
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {annotations.map((annotation) => (
          <div 
            key={annotation.id} 
            className="annotation-item"
            style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#f9f9f9',
              borderLeft: `4px solid ${categoryColors[annotation.category] || '#ccc'}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <strong style={{ color: categoryColors[annotation.category] || '#333' }}>
                  {annotation.category}
                </strong>
                <p style={{ margin: '5px 0', fontStyle: 'italic', fontSize: '0.9em' }}>
                  "{annotation.text}"
                </p>
                {annotation.note && (
                  <p style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
                    {annotation.note}
                  </p>
                )}
                <small style={{ color: '#999', fontSize: '0.75em' }}>
                  Position: {annotation.startOffset}-{annotation.endOffset}
                </small>
              </div>
              <button 
                onClick={() => onRemoveAnnotation(annotation.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '2px 6px',
                  borderRadius: '3px'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                title="Remove annotation"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="annotation-actions" style={{ marginTop: '10px', textAlign: 'center' }}>
        <button className='submit-button' onClick={handleSubmit}>
            Submit
        </button>
      </div>
    </motion.div>
  )
}

export default AnnotationList