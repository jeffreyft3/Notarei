import InteractiveButton from "@/components/ui/InteractiveButton";
import FeatureCard from "@/components/ui/FeatureCard";
import { HeroSection, AnimatedTitle, AnimatedDescription, ButtonContainer } from "@/components/ui/HeroSection";

export default function Home() {
  const features = [
    {
      icon: "🎯",
      title: "Precise Detection",
      description: "Identify subtle bias patterns with AI-powered analysis"
    },
    {
      icon: "👥",
      title: "Collaborative",
      description: "Work together with teams for comprehensive analysis"
    },
    {
      icon: "📊",
      title: "Insightful",
      description: "Generate detailed reports and bias pattern insights"
    }
  ];

  return (
    <HeroSection>
      <AnimatedTitle>Notarei</AnimatedTitle>
      
      <AnimatedDescription>
        AI-powered bias detection and annotation tool. Identify, analyze, and understand 
        bias patterns in documents with collaborative features and comprehensive reporting.
      </AnimatedDescription>
      
      <ButtonContainer>
        <InteractiveButton href="/annotate" variant="primary">
          Start Annotating
        </InteractiveButton>
        
        <InteractiveButton href="/review" variant="secondary">
          Learn More
        </InteractiveButton>
      </ButtonContainer>

      {/* <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        maxWidth: '800px',
        width: '100%'
      }}>
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            delay={0.8 + index * 0.1}
          />
        ))}
      </div> */}
    </HeroSection>
  );
}
