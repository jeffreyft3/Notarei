"use client"
import CollaborationPane from "@/components/collaborate/CollaborationPane"
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas"
import "./annotate.css"
import { useState } from "react"
import AnnotationList from "./AnnotationList"
import GuidanceToolbar from "./GuidanceToolbar"
const sampleArticleText = "The word Fascism has now no meaning except in so far as it signifies 'something not desirable.' The words democracy, socialism, freedom, patriotic, realistic, justice have each of them several different meanings which cannot be reconciled with one another. In the case of a word like democracy, not only is there no agreed definition, but the attempt to make one is resisted from all sides. It is almost universally felt that when we call a country democratic we are praising it: consequently the defenders of every kind of regime claim that it is a democracy, and fear that they might have to stop using that word if it were tied down to any one meaning. "

const Annotate = () => {
    const [stage, setStage] = useState("annotating") // 'annotating', 'reviewing'
    const [annotations, setAnnotations] = useState([])
    const [submittedAnnotations, setSubmittedAnnotations] = useState([])

    // Handle adding new annotations
    const handleAddAnnotation = (newAnnotation) => {
        setAnnotations(prev => [...prev, newAnnotation])
    }

    // Handle removing annotations
    const handleRemoveAnnotation = (id) => {
        setAnnotations(prev => prev.filter(ann => ann.id !== id))
    }

    // Handle submission of annotations
    const handleSubmitAnnotations = () => {
        if (annotations && annotations.length > 0) {
            // Save annotations to submitted state
            setSubmittedAnnotations([...annotations])
            
            // Save to localStorage for Review page as well
            const submissionData = {
                annotations: annotations,
                submittedAt: new Date().toISOString(),
                totalCount: annotations.length
            }
            localStorage.setItem('submittedAnnotations', JSON.stringify(submissionData))
            
            // Switch to reviewing stage
            setStage('reviewing')
            
            return true
        }
        return false
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
                annotations={stage === 'reviewing' ? submittedAnnotations : annotations}
            />
        </div>
        <div className="canvasMainWrapper">
            <AnnotationCanvas 
                articleText={sampleArticleText} 
                annotations={annotations}
                onAddAnnotation={handleAddAnnotation}
                onRemoveAnnotation={handleRemoveAnnotation}
            />
        </div>
        <div className="rightPaneWrapper">
            {
                stage === 'annotating' && (
                    <AnnotationList 
                        annotations={annotations}
                        onRemoveAnnotation={handleRemoveAnnotation}
                        onSubmit={handleSubmitAnnotations}
                    />
                )
            }
            {
                stage === 'reviewing' && (
                    <CollaborationPane />
                )   
            }
        </div>
    </div>
  )
}

export default Annotate