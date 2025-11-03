"use client"
import CollaborationPane from "@/components/collaborate/CollaborationPane"
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas"
import "./annotate.css"
import { useState } from "react"
import AnnotationList from "./AnnotationList"
import GuidanceToolbar from "./GuidanceToolbar"
const sampleArticleText = "Two federal judges ruled nearly simultaneously on Friday that President Donald Trump’s administration must continue to fund SNAP, the nation’s biggest food aid program, using contingency funds during the government shutdown. The rulings came a day before the U.S. Department of Agriculture planned to freeze payments to the Supplemental Nutrition Assistance Program because it said it could no longer keep funding it due to the shutdown.The program serves about 1 in 8 Americans and is a major piece of the nation’s social safety net. Word in October that it would be a Nov. 1 casualty of the shutdown sent states, food banks and SNAP recipients scrambling to figure out how to secure food. Some states said they would spend their own funds to keep versions of the program going.It wasn’t immediately clear how quickly the debit cards that beneficiaries use to buy groceries could be reloaded after the ruling. That process often takes one to two weeks.Here’s the latest:New York Attorney General Letitia James seeks to block Trump administration’s subpoenasThe challenge comes as James pushes back against the administration’s investigation of cases she brought against the president and the National Rifle Association, according to court documents unsealed Friday.James filed a motion in August to block subpoenas issued by acting U.S. Attorney John Sarcone for records related to the legal actions, claiming the Justice Department’s probe of the cases was retaliatory.She also argued that Sarcone was improperly appointed and therefore lacked legitimate authority to authorize the subpoenas.Dozens of court documents in the case have been filed under seal since August. Late Friday a federal judge in Manhattan granted James’ motion to unseal most of them, over the objection of the Justice Department.Judge Lorna Schofield, however, has not yet ruled on the motion to quash the subpoenas.An email seeking comment was sent to Sarcone’s office. A phone message was not immediately returned late Friday.SNAP has provided grocery help for 60-plus years. Here’s how it worksThe Supplemental Nutrition Assistance Program is a major piece of the social safety net used by nearly 42 million, or about 1 in 8 Americans, to help buy groceries.Originally known as the food stamp program, it has existed since 1964, serving low-income people, many of whom have jobs but don’t make enough to cover all basic costs.There are income limits based on family size, expenses and whether households include someone who is elderly or has a disability.Most participants are families with children, and more than 1 in 3 include older adults or someone with a disability.Nearly 2 in 5 recipients are households where someone is employed.Most participants have incomes below the poverty line, about $32,000 for a family of four, according to the Center on Budget and Policy Priorities.The Agriculture Department, which administers SNAP, says nearly 16 million children received benefits in 2023.▶ Read more about how SNAP works"

const Annotate = () => {
    const [stage, setStage] = useState("annotating") // 'annotating', 'reviewing'
    const [annotations, setAnnotations] = useState([])

    // Handle adding new annotations
    const handleAddAnnotation = (newAnnotation) => {
        setAnnotations(prev => [...prev, newAnnotation])
    }

    // Handle removing annotations
    const handleRemoveAnnotation = (id) => {
        setAnnotations(prev => prev.filter(ann => ann.id !== id))
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