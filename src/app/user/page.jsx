"use client"
import React, { useEffect, useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useUserStore } from '@/store/useUserStore'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const UserPage = () => {
  const { user: auth0User, isLoading } = useUser()
  const appUser = useUserStore(s => s.user)
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !auth0Usear) {
      router.push('/auth/login')
    }
  }, [auth0User, isLoading, router])

  if (isLoading) {
    return (
      <div style={{ 
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Loading...</p>
      </div>
    )
  }

  if (!auth0User) {
    return null
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'master': return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      case 'admin': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      case 'moderator': return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
      case 'annotator': return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
      default: return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    }
  }

  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: '80vh'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ 
          fontSize: '2.5rem',
          marginBottom: '2rem',
          color: '#1f2937',
          fontWeight: '700'
        }}>
          User Profile
        </h1>

        {/* Profile Card */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            marginBottom: '2rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Avatar */}
            {(auth0User.picture || appUser?.picture) ? (
              <img 
                src={auth0User.picture || appUser?.picture} 
                alt="Profile" 
                referrerPolicy="no-referrer"
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  border: '3px solid #e5e7eb',
                  objectFit: 'cover'
                }} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: (auth0User.picture || appUser?.picture) ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '2rem',
              fontWeight: '700'
            }}>
              {auth0User.name?.charAt(0)?.toUpperCase() || auth0User.email?.charAt(0)?.toUpperCase() || '?'}
            </div>
            
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                fontSize: '1.8rem',
                color: '#1f2937',
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                {auth0User.name || 'User'}
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1rem' }}>
                {auth0User.email}
              </p>
            </div>

            {/* Role Badge */}
            {appUser?.role && (
              <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: getRoleBadgeColor(appUser.role),
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.9rem',
                textTransform: 'capitalize',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                {appUser.role}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: '#e5e7eb', margin: '1.5rem 0' }} />

          {/* User Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Email Verified</p>
              <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '1rem' }}>
                {auth0User.email_verified ? '✅ Yes' : '❌ No'}
              </p>
            </div>

            {appUser?.created_at && (
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Member Since</p>
                <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '1rem' }}>
                  {new Date(appUser.created_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {appUser?.last_active_at && (
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Last Active</p>
                <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '1rem' }}>
                  {new Date(appUser.last_active_at).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            )}

            {appUser?.is_active !== undefined && (
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Account Status</p>
                <p style={{ color: '#1f2937', fontWeight: '600', fontSize: '1rem' }}>
                  {appUser.is_active ? '🟢 Active' : '🔴 Inactive'}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        {appUser && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Annotations</p>
              <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                {appUser.annotations_count || 0}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)'
              }}
            >
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Completed Pairings</p>
              <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                {appUser.completed_pairings?.length || 0}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
              }}
            >
              <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Current Pairings</p>
              <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                {appUser.current_pairings?.length || 0}
              </p>
            </motion.div>

            {appUser.average_session_length !== undefined && (
              <motion.div
                whileHover={{ scale: 1.03 }}
                style={{
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(67, 233, 123, 0.3)'
                }}
              >
                <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem' }}>Avg Session (min)</p>
                <p style={{ fontSize: '2rem', fontWeight: '700' }}>
                  {Math.round(appUser.average_session_length) || 0}
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Auth0 Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e5e7eb'
          }}
        >
          <h3 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '1rem', fontWeight: '600' }}>
            Account Information
          </h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
              <span style={{ color: '#6b7280' }}>User ID:</span>
              <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {auth0User.sub?.substring(0, 20)}...
              </span>
            </div>
            {auth0User.nickname && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: '#6b7280' }}>Nickname:</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>{auth0User.nickname}</span>
              </div>
            )}
            {auth0User.updated_at && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ color: '#6b7280' }}>Profile Updated:</span>
                <span style={{ color: '#1f2937', fontWeight: '500' }}>
                  {new Date(auth0User.updated_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default UserPage