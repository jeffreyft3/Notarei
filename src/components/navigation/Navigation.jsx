"use client"
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import './navigation.css'
import { useUser } from '@auth0/nextjs-auth0/client'
// import { getAccessToken } from '@auth0/nextjs-auth0/client'
import { useUserStore } from '@/store/useUserStore'

const Navigation = () => {
  const { user, isLoading } = useUser()
  const { user: appUser, setUser: setAppUser } = useUserStore()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const desktopNavRef = useRef(null)
  const itemRefs = useRef([])
  const [indicatorState, setIndicatorState] = useState({ width: 0, left: 0, visible: false })
  const [accessToken, setAccessToken] = useState(null);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch('/api/auth/token');
        const data = await response.json();
        setAccessToken(data.accessToken);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    if (user) {
      fetchToken();
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/get`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            auth0_id: user.sub,
            email: user.email,
          }),
        });
        console.log('Made request to fetch user data with access token:', accessToken);
        if (response.ok) {
          const data = await response.json();
          setUserData(data.user);
          // Save user data to Zustand store
          setAppUser(data.user);
        } else {
          setUserData(null);
          setAppUser(null);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(null);
        setAppUser(null);
      }
    };

    if (accessToken && user) {
      fetchUserData();
    } else {
      setUserData(null);
    }
  }, [accessToken, user, setAppUser]);


  const navItems = [
    { name: 'Annotate', href: '/annotate' },
    { name: 'Review', href: '/review' }
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
          {/* Auth Section Desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            {!isLoading && (
              user ? (
                <>
                  {/* Admin Panel Button */}
                  {appUser && (appUser.role === 'admin' || appUser.role === 'master') && (
                    <motion.div
                      whileHover={{ scale: 1.05, boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)' }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Link
                        href="/admin"
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'inline-block',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        }}
                      >
                        Admin Panel
                      </Link>
                    </motion.div>
                  )}
                  {/* User Profile Link */}
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    // transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <Link
                      href="/user"
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: '#f5f5f5',
                        color: '#333',
                        fontWeight: 600,
                        fontSize: '14px',
                        textDecoration: 'none',
                        display: 'inline-block',
                        border: '1px solid #e0e0e0',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {user.name || user.email}
                    </Link>
                  </motion.div>
                  {/* Logout Button */}
                  <motion.div
                    whileHover={{ scale: 1.03, backgroundColor: '#d32f2f', boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#f44336',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                    }}
                  >
                    <Link href="/auth/logout" style={{ color: 'inherit', textDecoration: 'none' }}>
                      Logout
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05, backgroundColor: '#005a9c', boxShadow: '0 6px 16px rgba(0, 122, 204, 0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    background: '#007acc',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 122, 204, 0.3)',
                  }}
                >
                  <Link href="/auth/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                    Login
                  </Link>
                </motion.div>
              )
            )}
          </div>
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
            {/* Auth Section Mobile */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {!isLoading && (
                user ? (
                  <>
                    {/* Admin Panel Button (Mobile) */}
                    {appUser && (appUser.role === 'admin' || appUser.role === 'master') && (
                      <motion.div
                        whileHover={{ scale: 1.02, boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      >
                        <Link
                          href="/admin"
                          onClick={closeMobileMenu}
                          style={{
                            padding: '12px 18px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '14px',
                            textDecoration: 'none',
                            display: 'block',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          }}
                        >
                          Admin Panel
                        </Link>
                      </motion.div>
                    )}
                    {/* User Profile Link (Mobile) */}
                    <motion.div
                      whileHover={{ scale: 1.02, backgroundColor: '#e8e8e8' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <Link
                        href="/user"
                        onClick={closeMobileMenu}
                        style={{
                          padding: '12px 18px',
                          borderRadius: '8px',
                          background: '#f5f5f5',
                          color: '#333',
                          fontWeight: 600,
                          fontSize: '14px',
                          textDecoration: 'none',
                          display: 'block',
                          textAlign: 'center',
                          border: '1px solid #e0e0e0',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {user.name || user.email}
                      </Link>
                    </motion.div>
                    {/* Logout Button (Mobile) */}
                    <motion.div
                      whileHover={{ scale: 1.02, backgroundColor: '#d32f2f', boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)' }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '8px',
                        background: '#f44336',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '14px',
                        textAlign: 'center',
                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)',
                      }}
                    >
                      <Link href="/auth/logout" onClick={closeMobileMenu} style={{ color: 'inherit', textDecoration: 'none' }}>
                        Logout
                      </Link>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.02, backgroundColor: '#005a9c', boxShadow: '0 6px 16px rgba(0, 122, 204, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      background: '#007acc',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '14px',
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(0, 122, 204, 0.3)',
                    }}
                  >
                    <Link href="/auth/login" onClick={closeMobileMenu} style={{ color: 'inherit', textDecoration: 'none' }}>
                      Login
                    </Link>
                  </motion.div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navigation
