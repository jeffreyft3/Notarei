
import ArticleList from '@/components/articles/ArticleList'
import './annotate.css'

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
  // Add remaining sentences as needed
]

const randomTitle = () => {
  const adjectives = [
    'Breaking', 'Inside', 'Deep Dive', 'Exclusive', 'Spotlight',
    'Analysis', 'Report', 'Brief', 'Update', 'Perspective'
  ]
  const topics = [
    'Election Security', 'Cyber Threats', 'Policy Shifts', 'Federal Support',
    'Infrastructure', 'Polling Places', 'Voter Safety', 'Intelligence Sharing',
    'Public Trust', 'State Readiness'
  ]
  const suffix = [
    '2025', 'Now', 'Today', 'Explained', 'Overview', '#'+Math.floor(Math.random()*1000)
  ]
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const t = topics[Math.floor(Math.random() * topics.length)]
  const s = suffix[Math.floor(Math.random() * suffix.length)]
  return `${a}: ${t} ${s}`
}

const generateArticles = (count = 10) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `sample-${i + 1}`,
    title: randomTitle(),
    body: sampleArticleText,
    sentences: sampleArticleTextList,
    excerpt: sampleArticleText.slice(0, 200) + (sampleArticleText.length > 200 ? '…' : ''),
    publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    source: 'Sample',
    annotationCount: 0,
    reviewCount: 0,
  }))
}

async function fetchArticles() {
  try {
    const apiUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL
    const response = await fetch(`${apiUrl}/articles`, {
      cache: 'no-store' // Ensure fresh data on each request
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch articles')
    }
    
    const data = await response.json()
    
    // console.log(data)
    
    return data.articles || data
  } catch (error) {
    console.error('Error fetching articles:', error)
    // Fallback to sample data
    // return generateArticles(12)
  }
}

export default async function Page() {
  const articles = await fetchArticles()
  
  return (
    <div className='pageWrapper'>
      <ArticleList articles={articles} />
    </div>
  )
}