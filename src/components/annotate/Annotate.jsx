"use client"
import CollaborationPane from "@/components/collaborate/CollaborationPane"
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas"
import AnnotateSentences from "@/components/annotate/AnnotateSentences"
import "./annotate.css"
import { useEffect, useMemo, useState } from "react"
import AnnotationList from "./AnnotationList"
import GuidanceToolbar from "./GuidanceToolbar"

const Annotate = ({    articleText, articleSentences}) => {
    const [stage, setStage] = useState("annotating") // 'annotating', 'reviewing'
    const [annotations, setAnnotations] = useState([])
    const [hoveredAnnotationId, setHoveredAnnotationId] = useState(null)
    const [selectedReviewAnnotation, setSelectedReviewAnnotation] = useState(null)
    const [showDevClear, setShowDevClear] = useState(false)
    const [canvasMode, setCanvasMode] = useState('sentences') // 'sentences' | 'spans'
    const [newlyCreatedAnnotationId, setNewlyCreatedAnnotationId] = useState(null)

    // Helper: load submitted annotations from localStorage
    const loadSubmittedFromStorage = () => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem('submittedAnnotations') : null
            if (!raw) return
            const parsed = JSON.parse(raw)
            const saved = Array.isArray(parsed?.annotations) ? parsed.annotations : null
            if (saved && saved.length) {
                setAnnotations(saved)
            }
        } catch (e) {
            // Ignore malformed storage
            console.warn('Failed to load submittedAnnotations from storage:', e)
        }
    }

    // On initial load in annotating stage, try to hydrate from storage
    useEffect(() => {
        // show dev clear button only on localhost:3000
        if (typeof window !== 'undefined') {
            const isLocalhost = window.location.hostname === 'localhost'
            const isPort3000 = (window.location.port || '3000') === '3000'
            setShowDevClear(isLocalhost && isPort3000)
        }
        loadSubmittedFromStorage()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // When switching to reviewing, refresh from storage (source of truth after submission)
    useEffect(() => {
        if (stage === 'reviewing') {
            loadSubmittedFromStorage()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stage])

    const handleClearLocal = () => {
        if (typeof window === 'undefined') return
        const ok = window.confirm('Clear ALL localStorage for this origin? This cannot be undone.')
        if (!ok) return
        try {
            localStorage.clear()
        } catch (e) {
            console.warn('Failed to clear localStorage:', e)
        }
        setAnnotations([])
        setHoveredAnnotationId(null)
    }

    // Handle adding new annotations
    const handleAddAnnotation = (newAnnotation) => {
        setAnnotations(prev => [...prev, newAnnotation])
        if (newAnnotation?.id) setNewlyCreatedAnnotationId(newAnnotation.id)
    }

    // Handle removing annotations
    const handleRemoveAnnotation = (id) => {
        setAnnotations(prev => prev.filter(ann => ann.id !== id))
    }

    // Handle updating annotations
    const handleUpdateAnnotation = (id, updatedAnnotation) => {
        setAnnotations(prev => prev.map(ann => 
            ann.id === id ? { ...ann, ...updatedAnnotation } : ann
        ))
    }

    // useEffect(() => {
    //     const handleResize = () => {
    //         setWindowWidth(window.innerWidth);
    //     };
    //     window.addEventListener('resize', handleResize);
    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     };
    // }
    // , []);

    


  return (
    <div className="canvas">
        <div className="guidancePaneWrapper">
            <GuidanceToolbar 
                stage={stage}
                setStage={setStage}
                annotations={annotations}
                onHoverAnnotation={setHoveredAnnotationId}
                onSelectAnnotation={setSelectedReviewAnnotation}
            />
        </div>
        <div className="canvasMainWrapper">
            <div className="canvasHeaderWrapper">
                <h2>{canvasMode === 'sentences' ? 'Annotate Sentences' : 'Annotation Canvas'}</h2>
                <div className="guidance-stage-toggle" role="tablist" aria-label="Canvas mode">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={canvasMode === 'sentences'}
                        className={`stage-button ${canvasMode === 'sentences' ? 'active' : ''}`}
                        onClick={() => setCanvasMode('sentences')}
                        title="Switch to sentence-level annotation"
                    >
                        Sentences
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={canvasMode === 'spans'}
                        className={`stage-button ${canvasMode === 'spans' ? 'active' : ''}`}
                        onClick={() => setCanvasMode('spans')}
                        title="Switch to span-level annotation"
                    >
                        Select
                    </button>
                </div>    
            </div>
            {canvasMode === 'sentences' ? (
                <AnnotateSentences
                    articleSentences={sampleArticleTextList}
                    annotations={annotations}
                    onAddAnnotation={handleAddAnnotation}
                    scrollBuffer={3}
                />
            ) : (
                <AnnotationCanvas 
                    articleText={sampleArticleText} 
                    annotations={annotations}
                    onAddAnnotation={handleAddAnnotation}
                    onRemoveAnnotation={handleRemoveAnnotation}
                    hoveredAnnotationId={hoveredAnnotationId}
                />
            )}
        </div>
        <div className="rightPaneWrapper">
            {
                stage === 'annotating' && (
                    <AnnotationList 
                        annotations={annotations}
                        newlyCreatedAnnotationId={newlyCreatedAnnotationId}
                        onRemoveAnnotation={handleRemoveAnnotation}
                        onUpdateAnnotation={handleUpdateAnnotation}
                        onHoverAnnotation={setHoveredAnnotationId}
                    />
                )
            }
            {stage === 'reviewing' && (
                <CollaborationPane selectedAnnotation={selectedReviewAnnotation} />
            )}
        </div>
        {showDevClear && (
            <button
                type="button"
                className="dev-clear-storage-btn"
                onClick={handleClearLocal}
                title="Developer: Clear localStorage"
            >
                Clear Local Storage
            </button>
        )}
    </div>
  )
}

export default Annotate