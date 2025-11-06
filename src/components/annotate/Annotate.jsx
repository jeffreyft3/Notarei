"use client"
import CollaborationPane from "@/components/collaborate/CollaborationPane"
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas"
import AnnotateSentences from "@/components/annotate/AnnotateSentences"
import "./annotate.css"
import { useEffect, useMemo, useState } from "react"
import AnnotationList from "./AnnotationList"
import GuidanceToolbar from "./GuidanceToolbar"
const sampleArticleText = "WASHINGTON -- As voters across the U.S. from New York City to New Jersey and Virginia to California prepare to cast ballots Tuesday, election officials are operating with sharply reduced support from a federal government agency that had previously helped states and localities counter bomb threats and cyberattacks.\n\nThe Cybersecurity and Infrastructure Security Agency has abandoned an Election Day situation room it had operated for years to share vital intelligence on physical and cyber threats with state and local authorities, said Paul Lux, chair of the Elections Infrastructure Information Sharing and Analysis Center, a national coalition of election officials.\n\nCISA's decision to end the information-sharing arrangement follows the dismantling of the agency's election security team earlier this year. Remaining election personnel with CISA, a unit of the Department of Homeland Security, have since been prohibited from working with or contacting state election officials, according to a person familiar with the matter.\n\nThe cuts have sent state and local officials responsible for running elections searching for ways to shore up potential gaps in cybersecurity, threat monitoring and physical protection of polling places. Changes at Homeland Security are sinking in as the nation confronts a bitterly divided political climate marked by violent outbursts including the assassination of conservative commentator Charlie Kirk.\n\nAmericans will head to the polls on Tuesday to decide the winners of gubernatorial, mayoral and legislative races, as well as judicial seats and ballot initiatives. Election Day marks the first real test of the political landscape since Donald Trump's return to the White House, offering an early glimpse of how his administration will oversee elections whose integrity he and his allies have repeatedly challenged. The New York City mayoral race, in particular, has drawn national attention as a proxy battle over urban governance, progressive politics and the future of the Democratic party.\n\nHomeland Security officials continue to communicate and provide guidance to state and local personnel on other matters, according to an agency spokesperson.\n\n\"Under the leadership of President Trump and Secretary Noem, CISA has refocused on its core mission and leads the nation's effort to secure critical infrastructure, and that includes election infrastructure from cyber and physical threats,\" said DHS spokesperson Scott McConnell. \"Every day, DHS and CISA are providing our partners the most capable and timely threat intelligence, expertise and resources they need to defend against risks.\"\n\nDHS officials forcibly reassigned or put on leave members of CISA's election security and resilience team in the months after Trump returned to power in January, according to people familiar with the matter. The CISA team was charged with coordinating election security efforts among the more than 10,000 election jurisdictions throughout the U.S.\n\nThe federal government has historically taken a lead in uniting, informing, and enabling state and local election officials to secure elections. In February, CISA froze all election security activities and the department initiated a review of CISA's role in helping state and local officials, Politico reported. Nine months later, the result has not been made public.\n\nThe loss of federal support is a \"nasty shock\" to election officials who have relied on federal support to fend off hackers and potentially violent plots, said Lux, who is also the supervisor of elections for Okaloosa County, Florida.\n\nMeanwhile, Americans are reporting an increase in politically motivated violence, according to an October Pew Research Center poll. In one case, a Texas man was charged in September with making violent terroristic threats against New York City mayoral candidate Zohran Mamdani.\n\nThe reduction in election security services come amid deeper cuts resulting in reduced capacity for CISA's Cybersecurity Division to provide services to critical infrastructure entities. Remaining capabilities, such as vulnerability scans and ransomware notifications, also are degraded in quality, according to former CISA officials.\n\n\"There are things important to the elections community that will be missing on this Election Day,\" Lux said. \"First and foremost, we have lost the ability to communicate on a national scale.\"\n\nDuring the 2024 election cycle, suspicious packages containing white powder were sent to election offices in more than a dozen states. CISA's election security team at the time served as a national intelligence clearinghouse, sharing detailed reports with election officials including photos of the handwriting and envelopes. The crime was not solved.\n\nDozens of malicious and suspicious cyber incidents targeting American election infrastructure occurred in the weeks leading up to Election Day, including phishing attempts, denial of service attacks and more, according to Lux. The 2024 election also saw at least 227 bomb threats, according to the Brennan Center for Justice. CISA's situation room had been where intelligence on the threats was collected and sent to election officials around the country.\n\nThe Trump administration also appointed people who have spread conspiracies about the 2020 election results to prominent positions. Heather Honey, who spread false information about the vote in Pennsylvania that year, has served as the deputy assistant secretary for election integrity in DHS's Office of Strategy, Policy and Plans, according to an organizational chart on the department's website.\n\nLux's Elections Infrastructure Information Sharing and Analysis Center, or EI-ISAC, tried to set up its own national version of the situation room for this year's election. The effort failed because the organization, which lost federal funding this year, couldn't afford the software licensing fees required to collect and share data with so many partners nationally. Lux said he intends to ask DHS Secretary Kristi Noem to confirm whether the CISA situation room will return in time for the midterm elections next year. CISA didn't respond to a request for comment on the matter.\n\nEI-ISAC used to be a free program but, due to federal funding cuts, has been rolled into a larger paid membership with another information-sharing collective, Lux said. Major election jurisdictions can afford to have teams of cybersecurity professionals on staff. However, the demise of CISA's free services and EI-ISAC's new pricing model are expected to have an especially big impact on smaller and poorer jurisdictions.\n\nThat makes election offices with less funding particularly vulnerable to state-backed hackers from China, Russia and Iran, officials said. Attackers from each of those countries have previously sought to interfere in U.S. elections.\n\n\"It's those small, underserved jurisdictions which are the bigger concern because they are the least prepared to deal with it,\" Lux said.\n\n©2025 Bloomberg L.P. Visit bloomberg.com. Distributed by Tribune Content Agency, LLC."
const sampleArticleTextList = [
    {
        id: 'sentence-1',
        text: "WASHINGTON -- As voters across the U.S. from New York City to New Jersey and Virginia to California prepare to cast ballots Tuesday, election officials are operating with sharply reduced support from a federal government agency that had previously helped states and localities counter bomb threats and cyberattacks.",
        startOffset: 0,
        sentenceOrder: 0
    },
    {
        id: 'sentence-2',
        text: "The Cybersecurity and Infrastructure Security Agency has abandoned an Election Day situation room it had operated for years to share vital intelligence on physical and cyber threats with state and local authorities, said Paul Lux, chair of the Elections Infrastructure Information Sharing and Analysis Center, a national coalition of election officials.",
        startOffset: 287,
        sentenceOrder: 1
    },
    {
        id: 'sentence-3',
        text: "CISA's decision to end the information-sharing arrangement follows the dismantling of the agency's election security team earlier this year.",
        startOffset: 634,
        sentenceOrder: 2
    },
    {
        id: 'sentence-4',
        text: "Remaining election personnel with CISA, a unit of the Department of Homeland Security, have since been prohibited from working with or contacting state election officials, according to a person familiar with the matter.",
        startOffset: 734,
        sentenceOrder: 3
    },
    {
        id: 'sentence-5',
        text: "The cuts have sent state and local officials responsible for running elections searching for ways to shore up potential gaps in cybersecurity, threat monitoring and physical protection of polling places.",    
        startOffset: 880,
        sentenceOrder: 4
    },
    {
        id: 'sentence-6',
        text: "Changes at Homeland Security are sinking in as the nation confronts a bitterly divided political climate marked by violent outbursts including the assassination of conservative commentator Charlie Kirk.",
        startOffset: 1023,
        sentenceOrder: 5
    },
    {
        id: 'sentence-7',
        text: "Americans will head to the polls on Tuesday to decide the winners of gubernatorial, mayoral and legislative races, as well as judicial seats and ballot initiatives.",
        startOffset: 1190,
        sentenceOrder: 6
    },
    {
        id: 'sentence-8',
        text: "Election Day marks the first real test of the political landscape since Donald Trump's return to the White House, offering an early glimpse of how his administration will oversee elections whose integrity he and his allies have repeatedly challenged.",
        startOffset: 1285,
        sentenceOrder: 7
    },
    {
        id: 'sentence-9',
        text: "The New York City mayoral race, in particular, has drawn national attention as a proxy battle over urban governance, progressive politics and the future of the Democratic party.",
        startOffset: 1385,
        sentenceOrder: 8
    },
    // ...more sentences
    {
        id: 'sentence-10',
        text: "Homeland Security officials continue to communicate and provide guidance to state and local personnel on other matters, according to an agency spokesperson.",
        startOffset: 1485,
        sentenceOrder: 9
    },
    {
        id: 'sentence-11',
        text: "\"Under the leadership of President Trump and Secretary Noem, CISA has refocused on its core mission and leads the nation's effort to secure critical infrastructure, and that includes election infrastructure from cyber and physical threats,\" said DHS spokesperson Scott McConnell. \"Every day, DHS and CISA are providing our partners the most capable and timely threat intelligence, expertise and resources they need to defend against risks.\"",
        startOffset: 1585,
        sentenceOrder: 10
    },
    {
        id: 'sentence-12',
        text: "DHS officials forcibly reassigned or put on leave members of CISA's election security and resilience team in the months after Trump returned to power in January, according to people familiar with the matter.",
        startOffset: 1685,
        sentenceOrder: 11
    },
    {
        id: 'sentence-13',
        text: "The CISA team was charged with coordinating election security efforts among the more than 10,000 election jurisdictions throughout the U.S.",
        startOffset: 1785,
        sentenceOrder: 12
    },
    {
        id: 'sentence-14',
        text: "The federal government has historically taken a lead in uniting, informing, and enabling state and local election officials to secure elections.",
        startOffset: 1885,
        sentenceOrder: 13
    },
    {
        id: 'sentence-15',
        text: "In February, CISA froze all election security activities and the department initiated a review of CISA's role in helping state and local officials, Politico reported.",
        startOffset: 1985,
        sentenceOrder: 14
    },
    {
        id: 'sentence-16',
        text: "Nine months later, the result has not been made public.",
        startOffset: 2085,
        sentenceOrder: 15
    },
    {
        id: 'sentence-17',
        text: "The loss of federal support is a \"nasty shock\" to election officials who have relied on federal support to fend off hackers and potentially violent plots, said Lux, who is also the supervisor of elections for Okaloosa County, Florida.",
        startOffset: 2185,
        sentenceOrder: 16
    },
    {
        id: 'sentence-18',
        text: "Meanwhile, Americans are reporting an increase in politically motivated violence, according to an October Pew Research Center poll.",
        startOffset: 2285,
        sentenceOrder: 17
    },
    {
        id: 'sentence-19',
        text: "In one case, a Texas man was charged in September with making violent terroristic threats against New York City mayoral candidate Zohran Mamdani.",
        startOffset: 2385,
        sentenceOrder: 18
    },
    {
        id: 'sentence-20',
        text: "The reduction in election security services come amid deeper cuts resulting in reduced capacity for CISA's Cybersecurity Division to provide services to critical infrastructure entities.",
        startOffset: 2485,
        sentenceOrder: 19
    },
    {
        id: 'sentence-21',
        text: "Remaining capabilities, such as vulnerability scans and ransomware notifications, also are degraded in quality, according to former CISA officials.",
        startOffset: 2585,
        sentenceOrder: 20
    },
    {
        id: 'sentence-22',
        text: "\"There are things important to the elections community that will be missing on this Election Day,\" Lux said. \"First and foremost, we have lost the ability to communicate on a national scale.\"",
        startOffset: 2685,
        sentenceOrder: 21
    },
    {
        id: 'sentence-23',
        text: "During the 2024 election cycle, suspicious packages containing white powder were sent to election offices in more than a dozen states.",
        startOffset: 2785,
        sentenceOrder: 22
    },
    {
        id: 'sentence-24',
        text: "CISA's election security team at the time served as a national intelligence clearinghouse, sharing detailed reports with election officials including photos of the handwriting  and envelopes.",
        startOffset: 2885,
        sentenceOrder: 23
    },
    {
        id: 'sentence-25',
        text: "The crime was not solved.",
        startOffset: 2985,
        sentenceOrder: 24
    },
    {
        id: 'sentence-26',
        text: "Dozens of malicious and suspicious cyber incidents targeting American election infrastructure occurred in the weeks leading up to Election Day, including phishing attempts, denial of service attacks and more, according to Lux.",
        startOffset: 3085,
        sentenceOrder: 25
    },
    {
        id: 'sentence-27',
        text: "The 2024 election also saw at least 227 bomb threats, according to the Brennan Center for Justice.",
        startOffset: 3185, 
        sentenceOrder: 26
    },
    {
        id: 'sentence-28',
        text: "CISA's situation room had been where intelligence on the threats was collected and sent to election officials around the country.",
        startOffset: 3285,
        sentenceOrder: 27
    },
    {        
        id: 'sentence-29',
        text: "The Trump administration also appointed people who have spread conspiracies about the 2020 election results to prominent positions.",
        startOffset: 3385,
        sentenceOrder: 28
    },
    {
        id: 'sentence-30',
        text: "Heather Honey, who spread false information about the vote in Pennsylvania that year, has served as the deputy assistant secretary for election integrity in DHS's Office of Strategy, Policy and Plans, according to an organizational chart on the department's website.",
        startOffset: 3485,
        sentenceOrder: 29
    },
    {
        id: 'sentence-31',
        text: "Lux's Elections Infrastructure Information Sharing and Analysis Center, or EI-ISAC, tried to set up its own national version of the situation room for this year's election.",
        startOffset: 3585,
        sentenceOrder: 30 
    },
    {        
        id: 'sentence-32',
        text: "The effort failed because the organization, which lost federal funding this year, couldn't afford the software licensing fees required to collect and share data with so many partners nationally.",
        startOffset: 3685,
        sentenceOrder: 31 
    },
    {
        id: 'sentence-33',
        text: "Lux said he intends to ask DHS Secretary Kristi Noem to confirm whether the CISA situation room will return in time for the midterm elections next year.",
        startOffset: 3785,
        sentenceOrder: 32 
    },
    {
        id: 'sentence-34',
        text: "CISA didn't respond to a request for comment on the matter.",
        startOffset: 3885,
        sentenceOrder: 33 
    },
    {
        id: 'sentence-35',
        text: "EI-ISAC used to be a free program but, due to federal funding cuts, has been rolled into a larger paid membership with another information-sharing collective, Lux said.",
        startOffset: 3985,
        sentenceOrder: 34 
    },
    {        id: 'sentence-36',
        text: "Major election jurisdictions can afford to have teams of cybersecurity professionals on staff.",
        startOffset: 4085,
        sentenceOrder: 35 
    },
    {        id: 'sentence-37',
        text: "However, the demise of CISA's free services and EI-ISAC's new pricing model are expected to have an especially big impact on smaller and poorer jurisdictions.",
        startOffset: 4185,
        sentenceOrder: 36 
    },
    {        id: 'sentence-38',
        text: "That makes election offices with less funding particularly vulnerable to state-backed hackers from China, Russia and Iran, officials said.",
        startOffset: 4285,
        sentenceOrder: 37 
    },
    {        id: 'sentence-39',
        text: "Attackers from each of those countries have previously sought to interfere in U.S. elections.",
        startOffset: 4385,
        sentenceOrder: 38 
    },
    {        id: 'sentence-40',
        text: "\"It's those small, underserved jurisdictions which are the bigger concern because they are the least prepared to deal with it,\" Lux said.",
        startOffset: 4485,
        sentenceOrder: 39 
    },
    {
        id: 'sentence-41',
        text: "©2025 Bloomberg L.P. Visit bloomberg.com. Distributed by Tribune Content Agency, LLC.",
        startOffset: 4585,
        sentenceOrder: 40 
    },


]
const Annotate = () => {
    const [stage, setStage] = useState("annotating") // 'annotating', 'reviewing'
    const [annotations, setAnnotations] = useState([])
    const [hoveredAnnotationId, setHoveredAnnotationId] = useState(null)
    const [selectedReviewAnnotation, setSelectedReviewAnnotation] = useState(null)
    const [showDevClear, setShowDevClear] = useState(false)
    const [canvasMode, setCanvasMode] = useState('sentences') // 'sentences' | 'spans'
    const [newlyCreatedAnnotationId, setNewlyCreatedAnnotationId] = useState(null)

    // Derive sentences with character offsets for the sentences canvas
    const articleSentences = useMemo(() => {
        const text = sampleArticleText || ''
        if (!text) return []
        const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean)
        const out = []
        let cursor = 0
        for (const part of parts) {
            const idx = text.indexOf(part, cursor)
            if (idx === -1) {
                // Fallback: if not found (should be rare), approximate using cursor
                const start = cursor
                const end = start + part.length
                out.push({ text: part, startOffset: start, endOffset: end })
                cursor = end + 1
            } else {
                const start = idx
                const end = idx + part.length
                out.push({ text: part, startOffset: start, endOffset: end })
                cursor = end
            }
        }
        return out
    }, [])

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