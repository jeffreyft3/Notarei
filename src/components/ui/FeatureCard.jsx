"use client"
import { motion } from "framer-motion"

const FeatureCard = ({ icon, title, description, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        y: -5,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}
      style={{
        padding: '1.5rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
    >
      <h3 style={{ 
        color: '#374151', 
        marginBottom: '0.5rem',
        fontSize: '1.1rem'
      }}>
        {icon} {title}
      </h3>
      <p style={{ 
        color: '#6b7280', 
        fontSize: '0.9rem',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
    </motion.div>
  )
}

export default FeatureCard