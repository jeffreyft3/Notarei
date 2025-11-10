"use client"
import React, { useMemo, useCallback } from 'react'
import '@/components/annotate/annotate.css'

/**
 * ReviewSentences
 * Renders sentences with pass/fail overlay based on user vs opponent primaryCategory match rate.
 * For now, simple heuristic: if any user annotation for a sentence matches any opponent annotation's primaryCategory
 * we treat it as a 100% match; else 0%. Extendable later for partial spans / fuzzy scoring.
 */
const ReviewSentences = ({
	articleSentences = [],
	userAnnotations = [],
	opponentAnnotations = [],
	threshold = 0.85,
	onSelectAnnotation,
}) => {

		// Bucket annotations by sentence using sentenceOrder when available, else range containment
		const sentenceStates = useMemo(() => {
			// Prepare sentence ranges
			const sentences = (articleSentences || []).map((s, index) => {
				const start = typeof s.startOffset === 'number' ? s.startOffset : 0
				const end = start + (s.text?.length || 0)
				const order = typeof s.sentenceOrder === 'number' ? s.sentenceOrder : index
				return { ...s, __start: start, __end: end, __order: order }
			})

			const orderToIndex = new Map()
			sentences.forEach((s, idx) => {
				if (typeof s.__order === 'number') orderToIndex.set(s.__order, idx)
			})

			// Initialize buckets
			const buckets = sentences.map(() => ({ user: [], opp: [] }))

			const assignToBucket = (ann, key) => {
				if (!ann) return
				let idx = -1
				const candidateOrder = typeof ann?.sentenceOrder === 'number'
					? ann.sentenceOrder
					: (typeof ann?.sentence_order === 'number' ? ann.sentence_order : null)
				if (typeof candidateOrder === 'number' && orderToIndex.has(candidateOrder)) {
					idx = orderToIndex.get(candidateOrder)
				}
				if (idx === -1 && typeof ann?.startOffset === 'number') {
					idx = sentences.findIndex(s => ann.startOffset >= s.__start && ann.startOffset < s.__end)
				}
				if (idx !== -1) {
					buckets[idx][key].push(ann)
				}
			}

			userAnnotations.forEach(a => assignToBucket(a, 'user'))
			opponentAnnotations.forEach(a => assignToBucket(a, 'opp'))

			// Build state per sentence
			return sentences.map((s, idx) => {
				const bucket = buckets[idx]
				const userCats = new Set(bucket.user.map(a => a.primaryCategory || a.category))
				const oppCats = new Set(bucket.opp.map(a => a.primaryCategory || a.category))
				
				// Handle different matching scenarios
				let matched = false
				let score = 0
				
				const hasUser = bucket.user.length > 0
				const hasOpp = bucket.opp.length > 0
				
				if (!hasUser && !hasOpp) {
					// Both have no annotations - this is considered a match
					matched = true
					score = 1
				} else if (hasUser && hasOpp) {
					// Both have annotations - check if categories match
					for (const c of userCats) {
						if (oppCats.has(c)) { 
							matched = true
							score = 1
							break 
						}
					}
				} else {
					// One has annotation, one doesn't - this is a mismatch that needs resolution
					matched = false
					score = 0
				}
				
				return {
					sentence: s,
					user: bucket.user,
					opp: bucket.opp,
					score,
					passed: score >= threshold,
					hasUser,
					hasOpp,
				}
			})
		}, [articleSentences, userAnnotations, opponentAnnotations, threshold])

	const handleSentenceClick = useCallback((state) => {
		// Create a synthetic annotation object that represents the sentence context
		const { sentence, user, opp } = state
		
		// If we have user or opponent annotations, prioritize them
		let selectedAnnotation = user[0] || opp[0]
		
		// If no annotations exist, create a synthetic one for the sentence
		if (!selectedAnnotation) {
			selectedAnnotation = {
				id: `synthetic-${sentence.id || sentence.startOffset}`,
				text: sentence.text || '',
				startOffset: sentence.startOffset || 0,
				endOffset: (sentence.startOffset || 0) + (sentence.text?.length || 0),
				category: 'No category',
				primaryCategory: 'No category',
				note: '',
				synthetic: true, // Mark as synthetic for UI handling
				sentenceOrder: typeof sentence?.__order === 'number' ? sentence.__order : null,
				sentence_order: typeof sentence?.__order === 'number' ? sentence.__order : null
			}
		}
		
		// Always allow selection, even for "No annotations" scenarios
		if (onSelectAnnotation) {
			onSelectAnnotation(selectedAnnotation)
		}
	}, [onSelectAnnotation])

	return (
		<div className="sentence-canvas" style={{ position: 'relative' }}>
			<div className="sentence-canvas-meta">
				<span className="sentence-canvas-meta-left">Review Mode • Threshold {Math.round(threshold * 100)}%</span>
				<span className="sentence-canvas-meta-right">{sentenceStates.filter(s => s.passed).length}/{sentenceStates.length} passed</span>
			</div>
					{sentenceStates.map((state, idx) => {
						const { sentence, passed, user, opp, score, hasUser, hasOpp } = state
						const displayNumber = (typeof sentence.sentenceOrder === 'number') ? (sentence.sentenceOrder + 1) : (idx + 1)
				
						// Determine visual state - if both have no annotations and it's a match, show as neutral
						const isNoAnnotationMatch = !hasUser && !hasOpp && passed
						const displayClass = isNoAnnotationMatch ? 'review-neutral' : (passed ? 'review-passed' : 'review-failed')
				
				return (
					<div
						key={sentence.id || sentence.startOffset}
						className={`sentence-row review-row ${displayClass}`}
						onClick={() => handleSentenceClick(state)}
						role="button"
						tabIndex={0}
						aria-label={`Sentence review ${passed ? 'passed' : 'requires attention'}`}
					>
								<div className="sentence-number">{displayNumber}</div>
						<div className="sentence-text-wrapper" style={{ position: 'relative' }}>
							{!passed && (
								<div
									className="review-mismatch-overlay"
									aria-hidden="true"
								/>
							)}
							<div className="sentence-text">
								{sentence.text}
							</div>
							<div className="sentence-review-tags">
								{hasUser && <span className="review-tag user-tag">You: {user.map(a => a.primaryCategory || a.category).join(', ')}</span>}
								{hasOpp && <span className="review-tag opp-tag">Opponent: {opp.map(a => a.primaryCategory || a.category).join(', ')}</span>}
								{!hasUser && !hasOpp && <span className="review-tag empty-tag">No annotations</span>}
								{passed ? <span className="review-tag pass-tag">✓ Match</span> : <span className="review-tag fail-tag">✕ Needs Match</span>}
							</div>
						</div>
					</div>
				)
			})}
			{sentenceStates.length === 0 && (
				<div className="sentence-empty">No sentences available.</div>
			)}
		</div>
	)
}

export default ReviewSentences
