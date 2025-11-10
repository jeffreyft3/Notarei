"use client"

import { useEffect, useState } from 'react'
import Review from "@/components/review/Review"

const sampleOpponentJson = {
  "annotations": [
    {
      "id": 1762788862766,
      "text": "WASHINGTON -- As voters across the U.S. from New York City to New Jersey and Virginia to California prepare to cast ballots Tuesday, election officials are operating with sharply reduced support from a federal government agency that had previously helped states and localities counter bomb threats and cyberattacks.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm).",
      "startOffset": 0,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 0
    },
    {
      "id": 1762788862767,
      "text": "The Cybersecurity and Infrastructure Security Agency has abandoned an Election Day situation room it had operated for years to share vital intelligence on physical and cyber threats with state and local authorities, said Paul Lux, chair of the Elections Infrastructure Information Sharing and Analysis Center, a national coalition of election officials.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Source Imbalance",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 316,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 1
    },
    {
      "id": 1762788862768,
      "text": "CISA's decision to end the information-sharing arrangement follows the dismantling of the agency's election security team earlier this year.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 670,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 2
    },
    {
      "id": 1762788862769,
      "text": "Remaining election personnel with CISA, a unit of the Department of Homeland Security, have since been prohibited from working with or contacting state election officials, according to a person familiar with the matter.",
      "category": "Unverified",
      "primaryCategory": "Unverified",
      "secondaryCategory": "",
      "note": "Presents a claim via anonymous/indirect sourcing or extraordinary assertion without substantiating evidence.",
      "startOffset": 811,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 3
    },
    {
      "id": 1762788862770,
      "text": "The cuts have sent state and local officials responsible for running elections searching for ways to shore up potential gaps in cybersecurity, threat monitoring and physical protection of polling places.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm).",
      "startOffset": 1031,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 4
    },
    {
      "id": 1762788862771,
      "text": "Changes at Homeland Security are sinking in as the nation confronts a bitterly divided political climate marked by violent outbursts including the assassination of conservative commentator Charlie Kirk.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Framing",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Frames events to set a narrative (e.g., 'first real test', 'proxy battle', or emphasis shaping interpretation). Presents a claim via anonymous/indirect sourcing or extraordinary assertion without substantiating evidence.",
      "startOffset": 1235,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 5
    },
    {
      "id": 1762788862772,
      "text": "Americans will head to the polls on Tuesday to decide the winners of gubernatorial, mayoral and legislative races, as well as judicial seats and ballot initiatives.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 1438,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 6
    },
    {
      "id": 1762788862773,
      "text": "Election Day marks the first real test of the political landscape since Donald Trump's return to the White House, offering an early glimpse of how his administration will oversee elections whose integrity he and his allies have repeatedly challenged.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Framing",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Frames events to set a narrative (e.g., 'first real test', 'proxy battle', or emphasis shaping interpretation). Uses predictive or uncertain language (e.g., 'may', 'might', 'could', or 'offering an early glimpse').",
      "startOffset": 1603,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 7
    },
    {
      "id": 1762788862774,
      "text": "The New York City mayoral race, in particular, has drawn national attention as a proxy battle over urban governance, progressive politics and the future of the Democratic party.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Framing",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Frames events to set a narrative (e.g., 'first real test', 'proxy battle', or emphasis shaping interpretation).",
      "startOffset": 1854,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 8
    },
    {
      "id": 1762788862775,
      "text": "Homeland Security officials continue to communicate and provide guidance to state and local personnel on other matters, according to an agency spokesperson.",
      "category": "Unverified",
      "primaryCategory": "Unverified",
      "secondaryCategory": "",
      "note": "Presents a claim via anonymous/indirect sourcing or extraordinary assertion without substantiating evidence.",
      "startOffset": 2032,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 9
    },
    {
      "id": 1762788862776,
      "text": "\\\"Under the leadership of President Trump and Secretary Noem, CISA has refocused on its core mission and leads the nation's effort to secure critical infrastructure, and that includes election infrastructure from cyber and physical threats,\\\" said DHS spokesperson Scott McConnell. \\\"Every day, DHS and CISA are providing our partners the most capable and timely threat intelligence, expertise and resources they need to defend against risks.\\\"",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Source Imbalance",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 2189,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 10
    },
    {
      "id": 1762788862777,
      "text": "DHS officials forcibly reassigned or put on leave members of CISA's election security and resilience team in the months after Trump returned to power in January, according to people familiar with the matter.",
      "category": "Source Imbalance",
      "primaryCategory": "Source Imbalance",
      "secondaryCategory": "Unverified",
      "note": "Relies on a single named or anonymous source without countervailing perspectives in the same sentence. Presents a claim via anonymous/indirect sourcing or extraordinary assertion without substantiating evidence.",
      "startOffset": 2634,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 11
    },
    {
      "id": 1762788862778,
      "text": "The CISA team was charged with coordinating election security efforts among the more than 10,000 election jurisdictions throughout the U.S.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 2842,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 12
    },
    {
      "id": 1762788862779,
      "text": "The federal government has historically taken a lead in uniting, informing, and enabling state and local election officials to secure elections.",
      "category": "Omission",
      "primaryCategory": "Omission",
      "secondaryCategory": "",
      "note": "Makes broad or generalized claims without concrete context, examples, or data in this sentence.",
      "startOffset": 2982,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 13
    },
    {
      "id": 1762788862780,
      "text": "In February, CISA froze all election security activities and the department initiated a review of CISA's role in helping state and local officials, Politico reported.",
      "category": "Unverified",
      "primaryCategory": "Unverified",
      "secondaryCategory": "",
      "note": "Presents a claim via anonymous/indirect sourcing or extraordinary assertion without substantiating evidence.",
      "startOffset": 3127,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 14
    },
    {
      "id": 1762788862781,
      "text": "Nine months later, the result has not been made public.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 3294,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 15
    },
    {
      "id": 1762788862782,
      "text": "The loss of federal support is a \\\"nasty shock\\\" to election officials who have relied on federal support to fend off hackers and potentially violent plots, said Lux, who is also the supervisor of elections for Okaloosa County, Florida.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Source Imbalance",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 3350,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 16
    },
    {
      "id": 1762788862783,
      "text": "Meanwhile, Americans are reporting an increase in politically motivated violence, according to an October Pew Research Center poll.",
      "category": "Omission",
      "primaryCategory": "Omission",
      "secondaryCategory": "",
      "note": "Makes broad or generalized claims without concrete context, examples, or data in this sentence.",
      "startOffset": 3587,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 17
    },
    {
      "id": 1762788862784,
      "text": "In one case, a Texas man was charged in September with making violent terroristic threats against New York City mayoral candidate Zohran Mamdani.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm).",
      "startOffset": 3719,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 18
    },
    {
      "id": 1762788862785,
      "text": "The reduction in election security services come amid deeper cuts resulting in reduced capacity for CISA's Cybersecurity Division to provide services to critical infrastructure entities.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 3865,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 19
    },
    {
      "id": 1762788862786,
      "text": "Remaining capabilities, such as vulnerability scans and ransomware notifications, also are degraded in quality, according to former CISA officials.",
      "category": "Source Imbalance",
      "primaryCategory": "Source Imbalance",
      "secondaryCategory": "Unverified",
      "note": "Relies on a single named or anonymous source without countervailing perspectives in the same sentence. Presents a claim via anonymous/indirect sourcing or extraordinary assertion without substantiating evidence.",
      "startOffset": 4052,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 20
    },
    {
      "id": 1762788862787,
      "text": "\\\"There are things important to the elections community that will be missing on this Election Day,\\\" Lux said. \\\"First and foremost, we have lost the ability to communicate on a national scale.\\\"",
      "category": "Source Imbalance",
      "primaryCategory": "Source Imbalance",
      "secondaryCategory": "",
      "note": "Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 4200,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 21
    },
    {
      "id": 1762788862788,
      "text": "During the 2024 election cycle, suspicious packages containing white powder were sent to election offices in more than a dozen states.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 4396,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 22
    },
    {
      "id": 1762788862789,
      "text": "CISA's election security team at the time served as a national intelligence clearinghouse, sharing detailed reports with election officials including photos of the handwriting  and envelopes.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 4531,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 23
    },
    {
      "id": 1762788862790,
      "text": "The crime was not solved.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 4723,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 24
    },
    {
      "id": 1762788862791,
      "text": "Dozens of malicious and suspicious cyber incidents targeting American election infrastructure occurred in the weeks leading up to Election Day, including phishing attempts, denial of service attacks and more, according to Lux.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 4749,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 25
    },
    {
      "id": 1762788862792,
      "text": "The 2024 election also saw at least 227 bomb threats, according to the Brennan Center for Justice.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm).",
      "startOffset": 4976,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 26
    },
    {
      "id": 1762788862793,
      "text": "CISA's situation room had been where intelligence on the threats was collected and sent to election officials around the country.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm).",
      "startOffset": 5075,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 27
    },
    {
      "id": 1762788862794,
      "text": "The Trump administration also appointed people who have spread conspiracies about the 2020 election results to prominent positions.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 5205,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 28
    },
    {
      "id": 1762788862795,
      "text": "Heather Honey, who spread false information about the vote in Pennsylvania that year, has served as the deputy assistant secretary for election integrity in DHS's Office of Strategy, Policy and Plans, according to an organizational chart on the department's website.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 5337,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 29
    },
    {
      "id": 1762788862796,
      "text": "Lux's Elections Infrastructure Information Sharing and Analysis Center, or EI-ISAC, tried to set up its own national version of the situation room for this year's election.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 5604,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 30
    },
    {
      "id": 1762788862797,
      "text": "The effort failed because the organization, which lost federal funding this year, couldn't afford the software licensing fees required to collect and share data with so many partners nationally.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 5777,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 31
    },
    {
      "id": 1762788862798,
      "text": "Lux said he intends to ask DHS Secretary Kristi Noem to confirm whether the CISA situation room will return in time for the midterm elections next year.",
      "category": "Source Imbalance",
      "primaryCategory": "Source Imbalance",
      "secondaryCategory": "Speculation",
      "note": "Relies on a single named or anonymous source without countervailing perspectives in the same sentence. Uses predictive or uncertain language (e.g., 'may', 'might', 'could', or 'offering an early glimpse').",
      "startOffset": 5972,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 32
    },
    {
      "id": 1762788862799,
      "text": "CISA didn't respond to a request for comment on the matter.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 6125,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 33
    },
    {
      "id": 1762788862800,
      "text": "EI-ISAC used to be a free program but, due to federal funding cuts, has been rolled into a larger paid membership with another information-sharing collective, Lux said.",
      "category": "Source Imbalance",
      "primaryCategory": "Source Imbalance",
      "secondaryCategory": "",
      "note": "Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 6185,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 34
    },
    {
      "id": 1762788862801,
      "text": "Major election jurisdictions can afford to have teams of cybersecurity professionals on staff.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 6354,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 35
    },
    {
      "id": 1762788862802,
      "text": "However, the demise of CISA's free services and EI-ISAC's new pricing model are expected to have an especially big impact on smaller and poorer jurisdictions.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Speculation",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Uses predictive or uncertain language (e.g., 'may', 'might', 'could', or 'offering an early glimpse').",
      "startOffset": 6449,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 36
    },
    {
      "id": 1762788862803,
      "text": "That makes election offices with less funding particularly vulnerable to state-backed hackers from China, Russia and Iran, officials said.",
      "category": "Loaded Language",
      "primaryCategory": "Loaded Language",
      "secondaryCategory": "Source Imbalance",
      "note": "Uses emotionally charged or evaluative phrasing (e.g., terms/phrases that intensify sentiment or alarm). Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 6608,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 37
    },
    {
      "id": 1762788862804,
      "text": "Attackers from each of those countries have previously sought to interfere in U.S. elections.",
      "category": "Omission",
      "primaryCategory": "Omission",
      "secondaryCategory": "",
      "note": "Makes broad or generalized claims without concrete context, examples, or data in this sentence.",
      "startOffset": 6747,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 38
    },
    {
      "id": 1762788862805,
      "text": "\\\"It's those small, underserved jurisdictions which are the bigger concern because they are the least prepared to deal with it,\\\" Lux said.",
      "category": "Source Imbalance",
      "primaryCategory": "Source Imbalance",
      "secondaryCategory": "",
      "note": "Relies on a single named or anonymous source without countervailing perspectives in the same sentence.",
      "startOffset": 6841,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 39
    },
    {
      "id": 1762788862806,
      "text": "©2025 Bloomberg L.P. Visit bloomberg.com. Distributed by Tribune Content Agency, LLC.",
      "category": "Neutral",
      "primaryCategory": "Neutral",
      "secondaryCategory": "",
      "note": "Factual or descriptive without evident subjective tone, speculation, or sourcing concerns in this sentence.",
      "startOffset": 6981,
      "timestamp": "2025-11-10T15:34:22.766Z",
      "sentence_order": 40
    }
  ],
  "submittedAt": "2025-11-10T15:34:22.766Z",
  "totalCount": 41
}



const Page = () => {
  const [annotations, setAnnotations] = useState([])
  const [articleText, setArticleText] = useState('')
  const [articleSentences, setArticleSentences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      setLoading(true)
      const stored = localStorage.getItem('submittedAnnotations')
      
      if (!stored) {
        setError('No annotations found. Start annotating to see your review.')
        setAnnotations([])
        setLoading(false)
        return
      }
      
      const parsed = JSON.parse(stored)
      const annotationsList = Array.isArray(parsed?.annotations) 
      ? parsed.annotations 
      : Array.isArray(parsed) 
      ? parsed 
      : []
      
      if (annotationsList.length === 0) {
        setError('No annotations found. Start annotating to see your review.')
      }
      
      console.log(annotationsList)
      setAnnotations(annotationsList)
      setArticleText(parsed?.articleText || '')
      setArticleSentences(parsed?.articleSentences || [])
    } catch (err) {
      console.error('Failed to load annotations from localStorage:', err)
      setError('Failed to load your annotations.')
      setAnnotations([])
    } finally {
      setLoading(false)
    }
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading your annotations…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>{error}</p>
      </div>
    )
  }
  return (
    <div>
      <Review 
        userAnnotations={annotations}
        opponentAnnotations={sampleOpponentJson}
        // opponentAnnotations={Object.entries(sampleOpponentJson).slice(0, 5)}
        articleText={articleText}
        articleSentences={articleSentences}
      />
    </div>
  )
}

export default Page