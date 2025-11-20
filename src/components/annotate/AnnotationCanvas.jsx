"use client"
import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './annotate.css'
import { categoryColors, asRgba, getAnnotationHexColor } from './colorUtils'
import AnnotationWindow from './AnnotationWindow'

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

  // Color mapping moved to colorUtils

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
            primaryCategory: '',
            secondaryCategory: '',
            confidenceLevel: '',
            additionalBiases: [],
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
  const addAnnotation = (primaryCategory, secondaryCategory = '', confidenceLevel = '', additionalBiases = [], note = '') => {
    if (pendingSelection && currentAnnotation) {
      const newAnnotation = {
        id: Date.now(),
        text: pendingSelection.text,
        // Keep backward compatibility with existing code by mirroring primary into category
        category: primaryCategory,
        primaryCategory,
        secondaryCategory,
        confidenceLevel,
        additionalBiases,
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
  const handlePrimarySelect = (primaryCategory) => {
    if (currentAnnotation) {
      setCurrentAnnotation(prev => ({ ...prev, primaryCategory }))
    }
  }

  const handleSecondarySelect = (secondaryCategory) => {
    if (currentAnnotation) {
      setCurrentAnnotation(prev => ({ ...prev, secondaryCategory }))
    }
  }

  const handleConfidenceChange = (confidenceLevel) => {
    if (currentAnnotation) {
      setCurrentAnnotation(prev => ({ ...prev, confidenceLevel }))
    }
  }

  const handleAdditionalBiasesChange = (additionalBiases) => {
    if (currentAnnotation) {
      setCurrentAnnotation(prev => ({ ...prev, additionalBiases }))
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
    if (currentAnnotation && currentAnnotation.primaryCategory) {
      addAnnotation(
        currentAnnotation.primaryCategory,
        currentAnnotation.secondaryCategory,
        currentAnnotation.confidenceLevel || '',
        currentAnnotation.additionalBiases || [],
        currentAnnotation.note
      )
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

    const getBaseColor = (ann) => ann?.isPending
      ? '#007acc' // base blue for pending; we'll apply alpha below
      : getAnnotationHexColor(ann)

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
  const color = asRgba(base, alpha)
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
            title={`${(group.outer.primaryCategory || group.outer.category || (group.outer.isPending ? 'Pending' : ''))}${group.outer.secondaryCategory ? ` + ${group.outer.secondaryCategory}` : ''}${group.outer.note ? `: ${group.outer.note}` : ''}`}
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

  // Close annotation window on Escape
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key !== 'Escape') return
      if (!showAnnotationWindow) return
      e.preventDefault()
      cancelAnnotation()
    }
    window.addEventListener('keydown', onEsc, { capture: true })
    return () => window.removeEventListener('keydown', onEsc, { capture: true })
  }, [showAnnotationWindow])

  return (
    <motion.div
      className="annotation-canvas-container"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="annotation-canvas-header">
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
          <AnnotationWindow
            pendingSelection={pendingSelection}
            currentAnnotation={currentAnnotation}
            biasCategories={biasCategories}
            selectOpen={selectOpen}
            setSelectOpen={setSelectOpen}
            onPrimaryChange={handlePrimarySelect}
            onSecondaryChange={handleSecondarySelect}
            onConfidenceChange={handleConfidenceChange}
            onAdditionalBiasesChange={handleAdditionalBiasesChange}
            onNoteChange={handleNoteChange}
            onSave={saveAnnotation}
            onCancel={cancelAnnotation}
            title="Annotate Selection"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AnnotationCanvas