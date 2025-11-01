"use client"
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import './navigation.css'

const Navigation = () => {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const desktopNavRef = useRef(null)
  const itemRefs = useRef([])
  const [indicatorState, setIndicatorState] = useState({ width: 0, left: 0, visible: false })

  const navItems = [
    { name: 'Annotate', href: '/annotate' },
    { name: 'Review', href: '/review' },
    { name: 'User', href: '/user' }
  ]

  const isActive = (href) => {
    return pathname === href
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  useEffect(() => {
    const updateIndicator = () => {
      const activeIndex = navItems.findIndex((item) => isActive(item.href))
      const navEl = desktopNavRef.current
      const activeEl = itemRefs.current[activeIndex]

      if (activeIndex >= 0 && navEl && activeEl) {
        const navRect = navEl.getBoundingClientRect()
        const activeRect = activeEl.getBoundingClientRect()

        setIndicatorState({
          width: activeRect.width,
          left: activeRect.left - navRect.left,
          visible: true,
        })
      } else {
        setIndicatorState((prev) => ({ ...prev, visible: false }))
      }
    }

    updateIndicator()

    const handleResize = () => updateIndicator()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [pathname])

  return (
    <motion.nav 
      className="navigation"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="nav-container">
        {/* Logo */}
        <Link href="/" className="nav-logo" onClick={closeMobileMenu}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Notarei
          </motion.div>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop" ref={desktopNavRef}>
          {navItems.map((item, index) => (
            <Link 
              key={item.name}
              href={item.href}
              className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <motion.div
                className="nav-link-content"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                ref={(el) => {
                  itemRefs.current[index] = el
                }}
              >
                {item.name}
              </motion.div>
            </Link>
          ))}
          {indicatorState.visible && (
            <motion.div
              className="active-indicator"
              initial={false}
              animate={{
                width: indicatorState.width,
                x: indicatorState.left,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              style={{
                opacity: indicatorState.visible ? 1 : 0,
              }}
            />
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-container">
          <motion.button
            className={`mobile-menu-button ${isMobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle mobile menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="nav-links mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  href={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <motion.div
                    className="nav-link-content"
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {item.name}
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navigation
