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
    const [matchPercentage, setMatchPercentage] = useState(0)
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState(null)

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
        if (articleSentences.length === 0) {
            const result = { met: false, percentage: 0 }
            setMatchPercentage(0)
            return result
        }
        
        // Count sentences where both sides agree (either both have matching categories or both have no annotations)
        let matchingCount = 0
        
        articleSentences.forEach((sentence, idx) => {
            // Use sentenceOrder when available for more accurate matching
            let userAnns, oppAnns
            
            if (typeof sentence.sentenceOrder === 'number') {
                userAnns = editedAnnotations.filter(ann => 
                    typeof ann.sentenceOrder === 'number' && ann.sentenceOrder === sentence.sentenceOrder
                )
                oppAnns = oppAnnotations.filter(ann => 
                    typeof ann.sentenceOrder === 'number' && ann.sentenceOrder === sentence.sentenceOrder
                )
            } else {
                // Fallback to range-based matching
                const sentenceStart = sentence.startOffset || 0
                const sentenceEnd = sentenceStart + (sentence.text?.length || 0)
                
                userAnns = editedAnnotations.filter(ann => 
                    ann.startOffset >= sentenceStart && ann.startOffset < sentenceEnd
                )
                oppAnns = oppAnnotations.filter(ann => 
                    ann.startOffset >= sentenceStart && ann.startOffset < sentenceEnd
                )
            }
            
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
        
        const percentage = (matchingCount / articleSentences.length) * 100
        const roundedPercentage = Math.round(percentage)
        
        // Update the match percentage state
        setMatchPercentage(roundedPercentage)
        
        return { 
            met: percentage >= 85, // 85% threshold
            percentage: roundedPercentage,
            matchingCount,
            totalAnnotations: articleSentences.length
        }
    }, [editedAnnotations, oppAnnotations, articleSentences])

    // Calculate unmatched annotations for the GuidanceToolbar
    const unmatchedAnnotations = useMemo(() => {
        const unmatched = []
        
        // Find user annotations that don't match any opponent annotations (conflicts)
        editedAnnotations.forEach(userAnn => {
            let matchingOpponent = null
            
            // Look for opponent annotations in the same sentence
            oppAnnotations.forEach(oppAnn => {
                // Check if they're for the same sentence (prefer sentenceOrder, fallback to range)
                let sameSentence = false
                if (typeof userAnn.sentenceOrder === 'number' && typeof oppAnn.sentenceOrder === 'number') {
                    sameSentence = userAnn.sentenceOrder === oppAnn.sentenceOrder
                } else {
                    // Fallback to range overlap
                    const userStart = userAnn.startOffset || 0
                    const userEnd = userStart + (userAnn.text?.length || 0)
                    const oppStart = oppAnn.startOffset || 0
                    const oppEnd = oppStart + (oppAnn.text?.length || 0)
                    sameSentence = userStart < oppEnd && oppStart < userEnd
                }
                
                if (sameSentence) {
                    matchingOpponent = oppAnn
                }
            })
            
            // If there's an opponent annotation but different categories, it's a conflict
            if (matchingOpponent && (userAnn.primaryCategory || userAnn.category) !== (matchingOpponent.primaryCategory || matchingOpponent.category)) {
                unmatched.push({
                    ...userAnn,
                    type: 'user-disagreement',
                    displayText: `Them: ${matchingOpponent.primaryCategory || matchingOpponent.category}`,
                    opponentCategory: matchingOpponent.primaryCategory || matchingOpponent.category,
                    isUserAnnotation: true
                })
            }
        })
        
        // Find opponent annotations that don't have any user annotation for the same sentence (non-conflicts)
        oppAnnotations.forEach(oppAnn => {
            let hasUserForSentence = false
            
            // Check if user has ANY annotation for this sentence
            editedAnnotations.forEach(userAnn => {
                let sameSentence = false
                if (typeof userAnn.sentenceOrder === 'number' && typeof oppAnn.sentenceOrder === 'number') {
                    sameSentence = userAnn.sentenceOrder === oppAnn.sentenceOrder
                } else {
                    // Fallback to range overlap
                    const userStart = userAnn.startOffset || 0
                    const userEnd = userStart + (userAnn.text?.length || 0)
                    const oppStart = oppAnn.startOffset || 0
                    const oppEnd = oppStart + (oppAnn.text?.length || 0)
                    sameSentence = userStart < oppEnd && oppStart < userEnd
                }
                
                if (sameSentence) {
                    hasUserForSentence = true
                }
            })
            
            if (!hasUserForSentence) {
                unmatched.push({
                    ...oppAnn,
                    type: 'opponent-only',
                    displayText: `Co-annotator: ${oppAnn.primaryCategory || oppAnn.category}`,
                    isUserAnnotation: false
                })
            }
        })
        
        // Sort by sentence order or start offset
        return unmatched.sort((a, b) => {
            const aOrder = typeof a.sentenceOrder === 'number' ? a.sentenceOrder : (a.startOffset || 0)
            const bOrder = typeof b.sentenceOrder === 'number' ? b.sentenceOrder : (b.startOffset || 0)
            return aOrder - bOrder
        })
    }, [editedAnnotations, oppAnnotations])

    // Handle selecting an annotation and finding its corresponding sentence
    const handleSelectReviewAnnotation = (annotation) => {
        setSelectedReviewAnnotation(annotation)
        
        if (annotation && articleSentences && articleSentences.length > 0) {
            // Find the sentence that contains this annotation
            let sentenceIndex = -1
            
            // First try to find by sentenceOrder if available
            if (typeof annotation.sentenceOrder === 'number') {
                sentenceIndex = annotation.sentenceOrder
                // Adjust if sentenceOrder appears 1-based
                if (sentenceIndex >= articleSentences.length && sentenceIndex - 1 >= 0) {
                    sentenceIndex = sentenceIndex - 1
                }
            }
            
            // Fallback to finding by text range
            if (sentenceIndex === -1 || sentenceIndex >= articleSentences.length) {
                sentenceIndex = articleSentences.findIndex(sentence => {
                    const sentenceStart = sentence.startOffset || 0
                    const sentenceEnd = sentenceStart + (sentence.text?.length || 0)
                    return annotation.startOffset >= sentenceStart && annotation.startOffset < sentenceEnd
                })
            }
            
            // Set the selected sentence index
            setSelectedSentenceIndex(sentenceIndex >= 0 ? sentenceIndex : null)
        } else {
            // Clear selection when annotation is null
            setSelectedSentenceIndex(null)
        }
    }

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
                    unmatchedAnnotations={unmatchedAnnotations}
                    onHoverAnnotation={setHoveredAnnotationId}
                    onSelectAnnotation={handleSelectReviewAnnotation}
                    matchPercentage={matchPercentage}
                    thresholdMet={thresholdProgress.met}
                    totalSentences={articleSentences.length}
                    matchingCount={thresholdProgress.matchingCount}
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
                    selectedSentenceIndex={selectedSentenceIndex}
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