"use client"
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './annotate.css'

const AnnotationCanvas = ({ articleText, annotations, onAddAnnotation, onRemoveAnnotation, hoveredAnnotationId }) => {
  const [pendingSelection, setPendingSelection] = useState(null) // Current selection being annotated
  const [showAnnotationWindow, setShowAnnotationWindow] = useState(false)
  const [currentAnnotation, setCurrentAnnotation] = useState(null)
  const [selectOpen, setSelectOpen] = useState(false)
  const canvasRef = useRef(null)
  const textContentRef = useRef(null)

  const biasCategories = [
    'Loaded Language',
    'Framing',
    'Source Imbalance',
    'Speculation',
    'Unverified',
    'Omission',
    'Neutral'
  ]

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

  // Build non-duplicating segments with active annotation stack for nested rendering
  const buildSegments = () => {
    // Normalize and include pending selection as an annotation layer
    const all = [
      ...annotations.filter(a => a && a.startOffset < a.endOffset),
      ...(pendingSelection ? [{ ...pendingSelection, category: 'pending', isPending: true }] : [])
    ]

    if (all.length === 0) return [{ start: 0, end: articleText.length, active: [] }]

    const events = []
    for (const ann of all) {
      events.push({ pos: ann.startOffset, type: 'start', ann })
      events.push({ pos: ann.endOffset, type: 'end', ann })
    }
    // Sort events; for same position, process 'end' before 'start' to avoid zero-length layers
    events.sort((a, b) => a.pos - b.pos || (a.type === 'end' ? -1 : 1))

    const segments = []
    let lastPos = 0
    let active = []
    let i = 0
    while (i < events.length) {
      const currentPos = events[i].pos
      if (currentPos > lastPos) {
        segments.push({ start: lastPos, end: currentPos, active: [...active] })
        lastPos = currentPos
      }
      // consume all events at this position
      let j = i
      while (j < events.length && events[j].pos === currentPos) j++
      // first remove ended
      for (let k = i; k < j; k++) {
        if (events[k].type === 'end') {
          const id = events[k].ann.id
          active = active.filter(a => a.id !== id)
        }
      }
      // then add started
      for (let k = i; k < j; k++) {
        if (events[k].type === 'start') {
          active.push(events[k].ann)
        }
      }
      i = j
    }
    if (lastPos < articleText.length) {
      segments.push({ start: lastPos, end: articleText.length, active: [...active] })
    }
    return segments
  }

  // Render segments as nested spans from outer (longest) to inner (shortest)
  const renderHighlightedText = () => {
    const segments = buildSegments()

    const hexToRgba = (hex, alpha = 1) => {
      const m = hex.replace('#','')
      const bigint = parseInt(m.length === 3 ? m.split('').map(c=>c+c).join('') : m, 16)
      const r = (bigint >> 16) & 255
      const g = (bigint >> 8) & 255
      const b = bigint & 255
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
    const getBaseColor = (ann) => ann?.isPending
      ? '#007acc' // base blue for pending; we'll apply alpha below
      : (categoryColors[ann.category] || '#ffeb3b')

    const annLen = (a) => (a.endOffset - a.startOffset)
    const getOuter = (active) => {
      if (!active || active.length === 0) return null
      let best = active[0]
      for (let i = 1; i < active.length; i++) {
        if (annLen(active[i]) > annLen(best)) best = active[i]
      }
      return best
    }
    const sameActive = (a1, a2) => {
      if (a1.length !== a2.length) return false
      const ids1 = a1.map(a => a.id).sort()
      const ids2 = a2.map(a => a.id).sort()
      for (let i = 0; i < ids1.length; i++) if (ids1[i] !== ids2[i]) return false
      return true
    }

    // Merge adjacent segments with identical active sets to reduce visual seams
    const merged = []
    for (const seg of segments) {
      if (merged.length && sameActive(merged[merged.length - 1].active, seg.active)) {
        merged[merged.length - 1].end = seg.end
      } else {
        merged.push({ ...seg })
      }
    }

    // Recursively render continuous wrappers for each nesting level (supports >1 nested)
    const groupByOuter = (segs, outerToSkip) => {
      const groups = []
      let current = null
      for (const seg of segs) {
        const filteredActive = seg.active.filter(a => !outerToSkip || a.id !== outerToSkip.id)
        const outer = getOuter(filteredActive)
        const outerId = outer ? outer.id : null
        if (!current || current.outerId !== outerId) {
          current = { outerId, outer, segs: [] }
          groups.push(current)
        }
        // Store filtered active in segment clone to avoid recomputing
        current.segs.push({ ...seg, active: filteredActive })
      }
      return groups
    }

    const renderGroups = (segs, outerToSkip = null, depth = 0) => {
      const groups = groupByOuter(segs, outerToSkip)
      return groups.map((group, gIdx) => {
        // If no active annotations at this level, render plain text for all segs
        if (!group.outer) {
          // Combine adjacent text spans for performance
          const pieces = group.segs.map((seg, sIdx) => (
            <span key={`txt-${depth}-${gIdx}-${sIdx}`}>{articleText.slice(seg.start, seg.end)}</span>
          ))
          return <span key={`grp-${depth}-${gIdx}`}>{pieces}</span>
        }

        // Render inner content recursively removing the current outer
        const inner = renderGroups(group.segs, group.outer, depth + 1)

        // Style this level
        const base = getBaseColor(group.outer)
        let alpha
        const isHovered = group.outer.id === hoveredAnnotationId
        
        if (group.outer.isPending) {
          alpha = 0.45
        } else if (isHovered) {
          alpha = 0.9  // High opacity for hovered annotation
        } else {
          alpha = depth === 0 ? 0.5 : depth === 1 ? 0.65 : 0.75
        }
        const color = hexToRgba(base, alpha)
        const padY = depth === 0 ? 6 : 2
        const padX = 0
        
        // Add border and scale effect for hovered annotation
        const hoverStyles = isHovered ? {
          // boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.3)',
          // outline: '2px solid rgba(0, 0, 0, 0.2)',
          outlineOffset: '1px'
        } : {}
        
        return (
          <span
            key={`grp-${depth}-${gIdx}`}
            className={`annotation-layer ${isHovered ? 'annotation-layer-hovered' : ''}`}
            data-annotation-id={group.outer.id}
            title={`${group.outer.category || (group.outer.isPending ? 'Pending' : '')}${group.outer.note ? `: ${group.outer.note}` : ''}`}
            style={{ 
              backgroundColor: color, 
              padding: `${padY}px ${padX}px`, 
              borderRadius: 0,
              ...hoverStyles
            }}
          >
            {inner}
          </span>
        )
      })
    }

    return renderGroups(merged)
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
      <AnimatePresence mode="wait">
        {showAnnotationWindow && pendingSelection && (
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AnnotationCanvas