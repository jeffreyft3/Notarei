"use client"
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import './annotate.css'

const AnnotationCanvas = ({ articleText, annotations, onAddAnnotation, onRemoveAnnotation }) => {
  const [pendingSelection, setPendingSelection] = useState(null) // Current selection being annotated
  const [showAnnotationWindow, setShowAnnotationWindow] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState(null)
  const [selectOpen, setSelectOpen] = useState(false)
  const canvasRef = useRef(null)
  const textContentRef = useRef(null)

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

  // Color mapping for each bias category
  const categoryColors = {
    'Loaded Language': '#ffeb3b',
    'Framing': '#ff9800',
    'False Balance': '#f44336',
    'Cherry Picking': '#e91e63',
    'Sensationalism': '#9c27b0',
    'Misleading Headlines': '#673ab7',
    'Source Bias': '#3f51b5',
    'Statistical Manipulation': '#2196f3'
  }

  // Get absolute character position in the text content
  const getAbsoluteOffset = (container, node, offset) => {
    if (!container || !node) return -1
    
    let absoluteOffset = 0
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null,
      false
    )

    let currentNode
    while (currentNode = walker.nextNode()) {
      if (currentNode === node) {
        return absoluteOffset + offset
      }
      absoluteOffset += currentNode.textContent.length
    }
    
    // If we didn't find the node, it's not within our container
    return -1
  }

  // Handle text selection
  const handleTextSelection = (e) => {
    // Don't interfere if clicking on annotation window
    if (e.target.closest('.annotation-window')) {
      return
    }

    const selection = window.getSelection()
    const selectedText = selection.toString().trim()
    
    if (selectedText && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      
      // Check if BOTH start and end of selection are within our text content
      const isStartInCanvas = textContentRef.current && textContentRef.current.contains(range.startContainer)
      const isEndInCanvas = textContentRef.current && textContentRef.current.contains(range.endContainer)
      
      if (isStartInCanvas && isEndInCanvas) {
        const startOffset = getAbsoluteOffset(textContentRef.current, range.startContainer, range.startOffset)
        const endOffset = getAbsoluteOffset(textContentRef.current, range.endContainer, range.endOffset)
        
        // Validate that we got valid offsets
        if (startOffset !== -1 && endOffset !== -1 && startOffset < endOffset) {
          const selectionData = {
            text: selectedText,
            startOffset,
            endOffset,
            id: `temp-${Date.now()}`
          }
          
          setPendingSelection(selectionData)
          setShowAnnotationWindow(true)
          setCurrentAnnotation({
            text: selectedText,
            category: '',
            note: ''
          })
          
          // Clear the browser's default selection styling since we'll handle it
          setTimeout(() => {
            window.getSelection().removeAllRanges()
          }, 0)
        }
      } else {
        // If selection spans outside our canvas, clear any pending selections
        setPendingSelection(null)
        setShowAnnotationWindow(false)
        setCurrentAnnotation(null)
      }
    } else {
      // No text selected, clear pending state
      setPendingSelection(null)
      setShowAnnotationWindow(false)
      setCurrentAnnotation(null)
    }
  }

  // Add annotation
  const addAnnotation = (category, note = '') => {
    if (pendingSelection && currentAnnotation) {
      const newAnnotation = {
        id: Date.now(),
        text: pendingSelection.text,
        category,
        note,
        startOffset: pendingSelection.startOffset,
        endOffset: pendingSelection.endOffset,
        timestamp: new Date().toISOString()
      }
      
      onAddAnnotation(newAnnotation)
      setShowAnnotationWindow(false)
      setPendingSelection(null)
      setCurrentAnnotation(null)
      
      // Clear browser selection
      window.getSelection().removeAllRanges()
    }
  }

  // Remove annotation (delegate to parent)
  const removeAnnotation = (id) => {
    onRemoveAnnotation(id)
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
    setPendingSelection(null)
    setCurrentAnnotation(null)
    window.getSelection().removeAllRanges()
  }

  // Create highlight spans for text rendering
  const createHighlightedText = () => {
    // Combine all annotations with pending selection for rendering
    const allHighlights = [...annotations]
    if (pendingSelection) {
      allHighlights.push({
        ...pendingSelection,
        category: 'pending',
        isPending: true
      })
    }

    // Sort by start position to handle overlapping correctly
    allHighlights.sort((a, b) => a.startOffset - b.startOffset)

    if (allHighlights.length === 0) {
      return [{ type: 'text', content: articleText }]
    }

    const parts = []
    let currentPos = 0

    allHighlights.forEach((highlight) => {
      // Add text before highlight
      if (highlight.startOffset > currentPos) {
        parts.push({
          type: 'text',
          content: articleText.slice(currentPos, highlight.startOffset)
        })
      }

      // Add highlighted text
      parts.push({
        type: 'highlight',
        content: articleText.slice(highlight.startOffset, highlight.endOffset),
        annotation: highlight
      })

      currentPos = Math.max(currentPos, highlight.endOffset)
    })

    // Add remaining text
    if (currentPos < articleText.length) {
      parts.push({
        type: 'text',
        content: articleText.slice(currentPos)
      })
    }

    return parts
  }

  // Render the text with highlights
  const renderHighlightedText = () => {
    const parts = createHighlightedText()
    
    return parts.map((part, index) => {
      if (part.type === 'text') {
        return <span key={index}>{part.content}</span>
      } else {
        const { annotation } = part
        const backgroundColor = annotation.isPending 
          ? 'rgba(0, 122, 204, 0.3)' 
          : categoryColors[annotation.category] || '#ffeb3b'
        
        return (
          <span
            key={index}
            style={{
              backgroundColor,
              padding: '2px 4px',
              borderRadius: '3px',
              cursor: 'pointer',
              position: 'relative',
              border: annotation.isPending ? '2px dashed #007acc' : 'none'
            }}
            title={annotation.isPending ? 'Pending annotation' : `${annotation.category}: ${annotation.note}`}
            data-annotation-id={annotation.id}
          >
            {part.content}
          </span>
        )
      }
    })
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection)
    return () => {
      document.removeEventListener('mouseup', handleTextSelection)
    }
  }, [])

  return (
    <motion.div
      className="annotation-canvas-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="annotation-canvas-header">
        <h2>Annotation Canvas</h2>
        <div className="annotation-stats">
          {annotations.length} annotation(s)
          {pendingSelection && <span style={{ color: '#007acc', marginLeft: '10px', fontWeight: 700 }}>• Pending selection</span>}
        </div>
      </div>

      <div 
        ref={canvasRef}
        className={`annotation-text-content ${pendingSelection ? 'has-pending-selection' : ''}`}
        style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          lineHeight: '2',
          userSelect: 'text',
          cursor: 'text',
          position: 'relative'
        }}
        onMouseDown={(e) => {
          // Clear any existing pending selections when starting a new selection
          if (!e.target.closest('.annotation-window')) {
            setPendingSelection(null)
            setShowAnnotationWindow(false)
          }
        }}
      >
        <div ref={textContentRef}>
          {renderHighlightedText()}
        </div>
      </div>

      {/* Annotation Window - Fixed on right side */}
      {showAnnotationWindow && pendingSelection && (
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
            <p>"{pendingSelection.text}"</p>
            <small style={{ color: '#666' }}>
              Characters {pendingSelection.startOffset}-{pendingSelection.endOffset}
            </small>
          </div>

          <div className="bias-category-selection">
            <label>Bias Category:</label>
            <div className={`custom-select-wrapper${selectOpen ? ' open' : ''}`}>
              <select
                value={currentAnnotation?.category || ''}
                onChange={(e) => handleCategorySelect(e.target.value)}
                onFocus={() => setSelectOpen(true)}
                onBlur={() => setSelectOpen(false)}
              >
                <option value="">Select a category</option>
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
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Add a note about this annotation..."
              style={{ 
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
              Save
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
    </motion.div>
  )
}

export default AnnotationCanvas