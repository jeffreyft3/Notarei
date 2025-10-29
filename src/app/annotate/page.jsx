import CollaborationPane from "@/components/collaborate/CollaborationPane"
import AnnotationCanvas from "@/components/annotate/AnnotationCanvas"

const page = () => {
  return (
    <div className='pageWrapper'>
        <h1>Annotate</h1>
        <div>
                <h1>
                Document Viewer
                </h1>
            <div>
                Guidance Toolbar
            </div>
            <div>
                <AnnotationCanvas articleText={"Sample article text for annotation."} />
            </div>
            <div>
                <CollaborationPane />
            </div>
        </div>
    </div>
  )
}

export default page