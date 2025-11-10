import Review from "@/components/review/Review";

const sampleOppononetJson = {

}

const page = async () => {
          const res = await fetch('https://api.example.com/data');
      const data = await res.json();
  return (
    <div>
        <h1>
            <Review opponentAnnotations={sampleOppononetJson} userAnnotations={userData}/>
        </h1>

    </div>
  )
}

export default page