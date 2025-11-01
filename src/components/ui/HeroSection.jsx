"use client"
import { motion } from "framer-motion"

const HeroSection = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      {children}
    </motion.div>
  )
}

const AnimatedTitle = ({ children }) => {
  return (
    <motion.h1
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={{ 
        fontSize: '4rem',
        marginBottom: '1rem',
        color: '#2563eb',
        fontWeight: '700',
        letterSpacing: '-0.02em'
      }}
    >
      {children}
    </motion.h1>
  )
}

const AnimatedDescription = ({ children }) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ 
        fontSize: '1.4rem',
        color: '#6b7280',
        maxWidth: '800px',
        lineHeight: '1.6',
        marginBottom: '3rem'
      }}
    >
      {children}
    </motion.p>
  )
}

const ButtonContainer = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      style={{ 
        display: 'flex', 
        gap: '1rem', 
        flexWrap: 'wrap', 
        justifyContent: 'center',
        marginBottom: '4rem'
      }}
    >
      {children}
    </motion.div>
  )
}

export { HeroSection, AnimatedTitle, AnimatedDescription, ButtonContainer }