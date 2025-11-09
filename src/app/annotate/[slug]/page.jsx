import Annotate from "@/components/annotate/Annotate"
import './annotate.css'
const page = () => {
  return (
    <div className='pageWrapper'>
        <Annotate articleText={sampleArticleText} articleSentences={sampleArticleSentences} />
    </div>
  )
}

export default page