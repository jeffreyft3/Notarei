"use client"
import '@/components/annotate/annotate.css'
import GuidanceToolbar from '../annotate/GuidanceToolbar'
import { useState, useMemo } from 'react'
import CollaborationPane from '../collaborate/CollaborationPane'
import ReviewSentences from './ReviewSentences'

// Review component compares user vs opponent annotations sentence-by-sentence
const Review = ({ opponentAnnotations, userAnnotations, articleSentences, articleText}) => {
    const [hoveredAnnotationId, setHoveredAnnotationId] = useState(null)
    const [selectedReviewAnnotation, setSelectedReviewAnnotation] = useState(null)
    const [revisedAnnotations, setRevisedAnnotations] = useState([])
    const [editedAnnotations, setEditedAnnotations] = useState(userAnnotations || [])

    // Normalize opponent annotations to an array
    const oppAnnotations = useMemo(() => {
        if (!opponentAnnotations) return []
        // Support both { annotations: [...] } and array forms
        const base = Array.isArray(opponentAnnotations) ? opponentAnnotations : opponentAnnotations.annotations || []
        // Normalize structure to ensure required fields exist
        return base.map(a => ({
            id: a.id ?? a.startOffset ?? Math.random(),
            text: a.text || '',
            startOffset: typeof a.startOffset === 'number' ? a.startOffset : 0,
            primaryCategory: a.primaryCategory || a.category || 'Neutral',
            category: a.category || a.primaryCategory || 'Neutral',
            secondaryCategory: a.secondaryCategory || '',
            note: a.note || '',
            timestamp: a.timestamp || null,
            sentenceOrder: typeof a.sentenceOrder === 'number' ? a.sentenceOrder : (typeof a.sentence_order === 'number' ? a.sentence_order : undefined),
        }))
    }, [opponentAnnotations])

    // Enhanced selectedReviewAnnotation with opponent data for comparison
    const enhancedSelectedAnnotation = useMemo(() => {
        if (!selectedReviewAnnotation) return null
        
        // Handle synthetic annotations (no actual annotations on either side)
        if (selectedReviewAnnotation.synthetic) {
            return {
                ...selectedReviewAnnotation,
                opponentPrimaryCategory: 'No category',
                opponentSecondaryCategory: '',
                opponentNote: '',
                synthetic: true
            }
        }
        
        // Prefer matching by sentenceOrder when available, else by text overlap/proximity
        let matchingOpponent = null
        if (typeof selectedReviewAnnotation.sentenceOrder === 'number') {
            matchingOpponent = oppAnnotations.find(opp => typeof opp.sentenceOrder === 'number' && opp.sentenceOrder === selectedReviewAnnotation.sentenceOrder)
            // Adjust for potential 1-based vs 0-based mismatch
            if (!matchingOpponent) {
                matchingOpponent = oppAnnotations.find(opp => typeof opp.sentenceOrder === 'number' && opp.sentenceOrder === selectedReviewAnnotation.sentenceOrder - 1)
                    || oppAnnotations.find(opp => typeof opp.sentenceOrder === 'number' && opp.sentenceOrder === selectedReviewAnnotation.sentenceOrder + 1)
            }
        }
        if (!matchingOpponent) {
            matchingOpponent = oppAnnotations.find(opp => 
                opp.startOffset <= selectedReviewAnnotation.startOffset && 
                selectedReviewAnnotation.startOffset < opp.startOffset + (opp.text?.length || 0)
            ) || oppAnnotations.find(opp => opp.startOffset === selectedReviewAnnotation.startOffset)
        }

        return {
            ...selectedReviewAnnotation,
            opponentPrimaryCategory: matchingOpponent?.primaryCategory || 'No category',
            opponentSecondaryCategory: matchingOpponent?.secondaryCategory || '',
            opponentNote: matchingOpponent?.note || '',
        }
    }, [selectedReviewAnnotation, oppAnnotations])

    // Calculate threshold progress
    const thresholdProgress = useMemo(() => {
        const totalAnnotations = Math.max(editedAnnotations.length, oppAnnotations.length, articleSentences.length)
        if (totalAnnotations === 0) return { met: false, percentage: 0 }
        
        // Count sentences where both sides agree (either both have matching categories or both have no annotations)
        let matchingCount = 0
        
        articleSentences.forEach((sentence, idx) => {
            const sentenceStart = sentence.startOffset || 0
            const sentenceEnd = sentenceStart + (sentence.text?.length || 0)
            
            // Find annotations for this sentence
            const userAnns = editedAnnotations.filter(ann => 
                ann.startOffset >= sentenceStart && ann.startOffset < sentenceEnd
            )
            const oppAnns = oppAnnotations.filter(ann => 
                ann.startOffset >= sentenceStart && ann.startOffset < sentenceEnd
            )
            
            const hasUser = userAnns.length > 0
            const hasOpp = oppAnns.length > 0
            
            if (!hasUser && !hasOpp) {
                // Both have no annotations - count as match
                matchingCount++
            } else if (hasUser && hasOpp) {
                // Both have annotations - check if categories match
                const userCats = new Set(userAnns.map(a => a.primaryCategory || a.category))
                const oppCats = new Set(oppAnns.map(a => a.primaryCategory || a.category))
                for (const c of userCats) {
                    if (oppCats.has(c)) {
                        matchingCount++
                        break
                    }
                }
            }
            // If one has annotation and one doesn't, it's not a match (don't increment)
        })
        
        const percentage = articleSentences.length > 0 ? (matchingCount / articleSentences.length) * 100 : 0
        return { 
            met: percentage >= 85, // 85% threshold
            percentage: Math.round(percentage),
            matchingCount,
            totalAnnotations: articleSentences.length
        }
    }, [editedAnnotations, oppAnnotations, articleSentences])

    // Handle editing/accepting annotations
    const handleEditAnnotation = (updatedAnnotation) => {
        setEditedAnnotations(prev => {
            const existingIndex = prev.findIndex(ann => ann.id === updatedAnnotation.id)
            let newAnnotations
            
            if (existingIndex !== -1) {
                // Update existing annotation
                newAnnotations = [...prev]
                newAnnotations[existingIndex] = updatedAnnotation
            } else {
                // Add new annotation
                newAnnotations = [...prev, updatedAnnotation]
            }
            
            // Track revised annotations
            if (updatedAnnotation.revised) {
                setRevisedAnnotations(prevRevised => {
                    const revisedIndex = prevRevised.findIndex(ann => ann.id === updatedAnnotation.id)
                    if (revisedIndex !== -1) {
                        const newRevised = [...prevRevised]
                        newRevised[revisedIndex] = updatedAnnotation
                        return newRevised
                    } else {
                        return [...prevRevised, updatedAnnotation]
                    }
                })
            }
            
            return newAnnotations
        })
    }

    // Handle submission to backend
    const handleSubmitRevisedAnnotations = async (annotations) => {
        try {
            // Simulate API call
            console.log('Submitting to backend:', {
                articleText,
                originalAnnotations: userAnnotations,
                revisedAnnotations: annotations,
                submittedAt: new Date().toISOString()
            })
            
            // In real implementation, make actual API call:
            // const response = await fetch('/api/submit-revised-annotations', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ articleText, originalAnnotations: userAnnotations, revisedAnnotations: annotations })
            // })
            
            alert('Revised annotations submitted successfully!')
            
        } catch (error) {
            console.error('Failed to submit:', error)
            throw error
        }
    }
    return (
        <div className="canvas">
            <div className="guidancePaneWrapper">
                <GuidanceToolbar 
                    stage={"reviewing"}
                    annotations={editedAnnotations}
                    onHoverAnnotation={setHoveredAnnotationId}
                    onSelectAnnotation={setSelectedReviewAnnotation}
                />
            </div>
            <div className="canvasMainWrapper">
                <div className="canvasHeaderWrapper">
                    <h2>Annotation Review</h2>
                    <div className="review-progress">
                        <span className={`progress-indicator ${thresholdProgress.met ? 'threshold-met' : ''}`}>
                            {thresholdProgress.percentage}% match ({thresholdProgress.matchingCount}/{thresholdProgress.totalAnnotations})
                            {thresholdProgress.met && ' ✓ Ready to submit'}
                        </span>
                    </div>
                </div>
                <ReviewSentences
                    articleSentences={articleSentences}
                    userAnnotations={editedAnnotations}
                    opponentAnnotations={oppAnnotations}
                    threshold={0.85}
                    onSelectAnnotation={setSelectedReviewAnnotation}
                />
            </div>
            <div className="rightPaneWrapper">
                <CollaborationPane 
                    selectedAnnotation={enhancedSelectedAnnotation}
                    onEditAnnotation={handleEditAnnotation}
                    onSubmitRevisedAnnotations={handleSubmitRevisedAnnotations}
                    revisedAnnotations={revisedAnnotations}
                    totalAnnotationsCount={Math.max(editedAnnotations.length, oppAnnotations.length)}
                    thresholdMet={thresholdProgress.met}
                />
            </div>
        </div>
    )
}

export default Review