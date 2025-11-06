"use client"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence } from 'framer-motion'
import "./annotate.css"
import { asRgba, getAnnotationHexColor } from "./colorUtils"
import AnnotationWindow from './AnnotationWindow'

// Sentence-level canvas: displays each sentence on its own line with numbering, pre-highlighted.
// Hovering emphasizes the sentence; clicking creates a new annotation covering the sentence.
const AnnotateSentences = ({ articleSentences, annotations = [], onAddAnnotation, scrollBuffer = 2 }) => {
        // Start with no active sentence; first arrow key press primes focus
        const [activeIndex, setActiveIndex] = useState(-1)
        const containerRef = useRef(null)
    const [showAnnotationWindow, setShowAnnotationWindow] = useState(false)
    const [pendingSelection, setPendingSelection] = useState(null)
    const [currentAnnotation, setCurrentAnnotation] = useState(null)
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

    const handleClickSentence = useCallback((s, index) => {
        setActiveIndex(index)
        // Open the annotation window with this sentence prefilled (same flow as Enter)
        setPendingSelection({ text: s.text, startOffset: s.startOffset, endOffset: s.endOffset })
        setCurrentAnnotation({ text: s.text, primaryCategory: '', secondaryCategory: '', note: '' })
        setShowAnnotationWindow(true)
    }, [])

    // Keyboard navigation: Up/Down to move selection; Enter to create annotation and advance
        const onKeyDown = useCallback((e) => {
        if (!articleSentences || articleSentences.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => Math.min(articleSentences.length - 1, i + 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => Math.max(0, i - 1))
        } else if (e.key === 'Enter') {
            e.preventDefault()
                if (activeIndex >= 0) {
                    const s = articleSentences[activeIndex]
                    // Open the annotation window with this sentence prefilled
                    setPendingSelection({ text: s.text, startOffset: s.startOffset, endOffset: s.endOffset })
                    setCurrentAnnotation({ text: s.text, primaryCategory: '', secondaryCategory: '', note: '' })
                    setShowAnnotationWindow(true)
                }
        }
    }, [articleSentences, activeIndex])

        // Global key handler: if no active sentence and user presses arrow keys,
        // focus the canvas without moving selection yet. Next keydown will select.
        useEffect(() => {
            const handler = (e) => {
                if (activeIndex !== -1) return
                if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
                const ae = document.activeElement
                const tag = ae?.tagName
                const isEditing = ae?.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
                if (isEditing) return
                // Prime focus to the sentence canvas without scrolling it into view
                e.preventDefault()
                try {
                    containerRef.current?.focus({ preventScroll: true })
                } catch {
                    containerRef.current?.focus()
                }
            }
            window.addEventListener('keydown', handler, { capture: true })
            return () => window.removeEventListener('keydown', handler, { capture: true })
        }, [activeIndex])

        // Close annotation window on Escape
        useEffect(() => {
            const onEsc = (e) => {
                if (e.key !== 'Escape') return
                if (!showAnnotationWindow) return
                e.preventDefault()
                setShowAnnotationWindow(false)
                setPendingSelection(null)
                setCurrentAnnotation(null)
            }
            window.addEventListener('keydown', onEsc, { capture: true })
            return () => window.removeEventListener('keydown', onEsc, { capture: true })
        }, [showAnnotationWindow])

                // Selection window handlers
                const handlePrimarySelect = (primaryCategory) => {
                    setCurrentAnnotation(prev => ({ ...(prev||{}), primaryCategory }))
                }
                const handleSecondarySelect = (secondaryCategory) => {
                    setCurrentAnnotation(prev => ({ ...(prev||{}), secondaryCategory }))
                }
                const handleNoteChange = (note) => {
                    setCurrentAnnotation(prev => ({ ...(prev||{}), note }))
                }
                const saveAnnotation = () => {
                    if (!pendingSelection || !currentAnnotation?.primaryCategory) return
                    const newAnn = {
                        id: Date.now(),
                        text: pendingSelection.text,
                        category: currentAnnotation.primaryCategory,
                        primaryCategory: currentAnnotation.primaryCategory,
                        secondaryCategory: currentAnnotation.secondaryCategory || '',
                        note: currentAnnotation.note || '',
                        startOffset: pendingSelection.startOffset,
                        endOffset: pendingSelection.endOffset,
                        timestamp: new Date().toISOString()
                    }
                    onAddAnnotation && onAddAnnotation(newAnn)
                    setShowAnnotationWindow(false)
                    setPendingSelection(null)
                    setCurrentAnnotation(null)
                    // advance to next sentence but DO NOT force-scroll; reveal logic will handle if needed
                    setActiveIndex((i) => Math.min(articleSentences.length - 1, (i >= 0 ? i + 1 : 0)))
                }
                const cancelAnnotation = () => {
                    setShowAnnotationWindow(false)
                    setPendingSelection(null)
                    setCurrentAnnotation(null)
                }

        // When active sentence changes via keyboard, gently reveal it if it's outside of view
        useEffect(() => {
            if (activeIndex < 0) return
            const container = containerRef.current
            if (!container) return
            const activeEl = container.querySelector('.sentence-row.active')
            if (!activeEl) return
            
            // Use getBoundingClientRect for reliable positioning across viewport sizes
            const containerRect = container.getBoundingClientRect()
            const rowRect = activeEl.getBoundingClientRect()
            
            // Calculate positions relative to container
            const rowTop = rowRect.top - containerRect.top
            const rowBottom = rowRect.bottom - containerRect.top
            const viewHeight = container.clientHeight

            // Use configurable buffer (default 2 sentences)
            const oneRowHeight = activeEl.offsetHeight
            const bufferHeight = oneRowHeight * scrollBuffer

            if (rowBottom > viewHeight) {
                // Row bottom is below visible area - scroll down with buffer
                const scrollAmount = rowBottom - viewHeight + bufferHeight
                container.scrollBy({ top: scrollAmount, behavior: 'smooth' })
            } else if (rowTop < 0) {
                // Row top is above visible area - scroll up with buffer
                const scrollAmount = rowTop - bufferHeight
                container.scrollBy({ top: scrollAmount, behavior: 'smooth' })
            }
        }, [activeIndex, scrollBuffer])

    if (!articleSentences || articleSentences.length === 0) {
        return (
            <div className="sentence-canvas">
                <div className="sentence-empty">No content to display.</div>
            </div>
        )
    }

        return (
            <>
                <div
                className="sentence-canvas"
                role="list"
                aria-label="Sentence canvas"
                tabIndex={0}
                    ref={containerRef}
                onKeyDown={onKeyDown}
            >
            {articleSentences.map((s, i) => (
                <div
                    key={`${s.startOffset}-${s.endOffset}-${i}`}
                        className={`sentence-row ${i === activeIndex ? 'active' : ''}`}
                    role="listitem"
                    onClick={() => handleClickSentence(s, i)}
                    title="Click to create an annotation for this sentence"
                >
                    <div className="sentence-number" aria-hidden>
                        {i + 1}
                    </div>
                    {(() => {
                      // Find an annotation that maps to this sentence — prefer exact span match, otherwise any overlap
                      const exact = annotations.find(a => a.startOffset === s.startOffset && a.endOffset === s.endOffset)
                      const overlapping = exact || annotations.find(a => a.startOffset < s.endOffset && a.endOffset > s.startOffset)
                      const bg = overlapping ? asRgba(getAnnotationHexColor(overlapping), 0.77) : undefined
                      const outline = overlapping ? `${asRgba(getAnnotationHexColor(overlapping), 1.0)}` : undefined
                      return (
                        <div
                          className="sentence-text pre-highlight"
                          style={bg ? { background: bg, boxShadow: `inset 0 0 0 1px ${outline}` } : undefined}
                        >
                          {s.text}
                        </div>
                      )
                    })()}
                </div>
            ))}
    </div>
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
                            onNoteChange={handleNoteChange}
                            onSave={saveAnnotation}
                            onCancel={cancelAnnotation}
                            title="Annotate Sentence"
                        />
                    )}
                </AnimatePresence>
            </>
    )
}

export default AnnotateSentences