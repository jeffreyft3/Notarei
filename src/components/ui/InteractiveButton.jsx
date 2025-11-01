"use client"
import Link from "next/link";
import { motion } from "framer-motion";

const InteractiveButton = ({ 
  href, 
  children, 
  variant = "primary",
  className = ""
}) => {
  const baseStyles = {
    padding: '1rem 2rem',
    borderRadius: '0.5rem',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    display: 'inline-block'
  }

  const variants = {
    primary: {
      background: '#2563eb',
      color: 'white',
      boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
      border: 'none'
    },
    secondary: {
      background: 'transparent',
      color: '#2563eb',
      border: '2px solid #2563eb',
      boxShadow: 'none'
    }
  }

  const hoverVariants = {
    primary: {
      background: '#1d4ed8',
      boxShadow: '0 8px 12px rgba(37, 99, 235, 0.3)',
      y: -2
    },
    secondary: {
      background: '#2563eb',
      color: 'white',
      y: -2
    }
  }

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.div
        style={{
          ...baseStyles,
          ...variants[variant]
        }}
        whileHover={hoverVariants[variant]}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={className}
      >
        {children}
      </motion.div>
    </Link>
  )
}

export default InteractiveButton