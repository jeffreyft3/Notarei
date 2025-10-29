import React, { useState, useRef, useEffect } from 'react'

const AnnotationCanvas = ({ articleText }) => {
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [showAnnotationWindow, setShowAnnotationWindow] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState(null)
  const canvasRef = useRef(null)

  const biasCategories = [
    'Loaded Language',
    'Framing',
    'False Balance',
    'Cherry Picking',
    'Sensationalism',
    'Misleading Headlines',
    'Source Bias',
    'Statistical Manipulation'
  ]

  // Handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection()
    const selectedText = selection.toString().trim()
    
    if (selectedText && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      // Check if selection is within our canvas
      if (canvasRef.current && canvasRef.current.contains(range.commonAncestorContainer)) {
        setSelectedText(selectedText)
        setSelectionRange({
          start: range.startOffset,
          end: range.endOffset,
          text: selectedText,
          range: range.cloneRange()
        })
        setShowAnnotationWindow(true)
        setCurrentAnnotation({
          text: selectedText,
          category: '',
          note: ''
        })
      }
    } else {
      // Clear selection if nothing is selected
      setSelectedText('')
      setSelectionRange(null)
      setShowAnnotationWindow(false)
    }
  }

  // Add annotation
  const addAnnotation = (category, note = '') => {
    if (selectionRange && selectedText) {
      const newAnnotation = {
        id: Date.now(),
        text: selectedText,
        category,
        note,
        range: selectionRange,
        timestamp: new Date().toISOString()
      }
      
      setAnnotations(prev => [...prev, newAnnotation])
      setShowAnnotationWindow(false)
      setSelectedText('')
      setSelectionRange(null)
      setCurrentAnnotation(null)
      
      // Clear browser selection
      window.getSelection().removeAllRanges()
    }
  }

  // Remove annotation
  const removeAnnotation = (id) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id))
  }

  // Handle annotation category selection
  const handleCategorySelect = (category) => {
    if (currentAnnotation) {
      setCurrentAnnotation(prev => ({ ...prev, category }))
    }
  }

  // Handle annotation note change
  const handleNoteChange = (note) => {
    if (currentAnnotation) {
      setCurrentAnnotation(prev => ({ ...prev, note }))
    }
  }

  // Save current annotation
  const saveAnnotation = () => {
    if (currentAnnotation && currentAnnotation.category) {
      addAnnotation(currentAnnotation.category, currentAnnotation.note)
    }
  }

  // Cancel annotation
  const cancelAnnotation = () => {
    setShowAnnotationWindow(false)
    setSelectedText('')
    setSelectionRange(null)
    setCurrentAnnotation(null)
    window.getSelection().removeAllRanges()
  }

  // Render annotated text with highlights
  const renderAnnotatedText = () => {
    if (annotations.length === 0) {
      return <span>{articleText}</span>
    }

    // This is a simplified version - in a real implementation you'd want more sophisticated text parsing
    let renderedText = articleText
    annotations.forEach((annotation, index) => {
      const highlightClass = `annotation-highlight annotation-${annotation.category.toLowerCase().replace(/\s+/g, '-')}`
      renderedText = renderedText.replace(
        annotation.text,
        `<span class="${highlightClass}" data-annotation-id="${annotation.id}" title="${annotation.category}: ${annotation.note}">${annotation.text}</span>`
      )
    })

    return <span dangerouslySetInnerHTML={{ __html: renderedText }} />
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection)
    return () => {
      document.removeEventListener('mouseup', handleTextSelection)
    }
  }, [])

  return (
    <div className="annotation-canvas-container">
      <div className="annotation-canvas-header">
        <h2>Annotation Canvas</h2>
        <div className="annotation-stats">
          {annotations.length} annotation(s)
        </div>
      </div>

      <div 
        ref={canvasRef}
        className="annotation-text-content"
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          lineHeight: '1.6',
          userSelect: 'text',
          cursor: 'text'
        }}
      >
        {renderAnnotatedText()}
      </div>

      {/* Annotation Window - Fixed on right side */}
      {showAnnotationWindow && (
        <div 
          className="annotation-window"
          style={{
            position: 'fixed',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '300px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}
        >
          <h3>Annotate Selection</h3>
          
          <div className="selected-text" style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>Selected text:</strong>
            <p>"{selectedText}"</p>
          </div>

          <div className="bias-category-selection">
            <label>Bias Category:</label>
            <select 
              value={currentAnnotation?.category || ''}
              onChange={(e) => handleCategorySelect(e.target.value)}
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            >
              <option value="">Select a category</option>
              {biasCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="annotation-note">
            <label>Note (optional):</label>
            <textarea
              value={currentAnnotation?.note || ''}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Add a note about this annotation..."
              style={{ 
                width: '100%', 
                height: '60px', 
                padding: '8px', 
                margin: '5px 0',
                resize: 'vertical'
              }}
            />
          </div>

          <div className="annotation-actions" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button 
              onClick={saveAnnotation}
              disabled={!currentAnnotation?.category}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: currentAnnotation?.category ? '#007acc' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: currentAnnotation?.category ? 'pointer' : 'not-allowed'
              }}
            >
              Save Annotation
            </button>
            <button 
              onClick={cancelAnnotation}
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
        </div>
      )}

      {/* Annotations List */}
      {annotations.length > 0 && (
        <div className="annotations-list" style={{ marginTop: '20px' }}>
          <h3>Annotations</h3>
          {annotations.map((annotation) => (
            <div 
              key={annotation.id} 
              className="annotation-item"
              style={{
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: '#f9f9f9'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <strong>{annotation.category}</strong>
                  <p style={{ margin: '5px 0', fontStyle: 'italic' }}>"{annotation.text}"</p>
                  {annotation.note && <p style={{ fontSize: '0.9em', color: '#666' }}>{annotation.note}</p>}
                </div>
                <button 
                  onClick={() => removeAnnotation(annotation.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AnnotationCanvas