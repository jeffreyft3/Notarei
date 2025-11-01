import React from 'react'

const ReviewPage = () => {
  return (
    <div style={{ 
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '80vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '3rem',
        marginBottom: '1rem',
        color: '#2563eb',
        fontWeight: '700'
      }}>
        Review
      </h1>
      <p style={{ 
        fontSize: '1.2rem',
        color: '#6b7280',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        Review and analyze annotated documents. This feature will allow you to examine bias patterns, 
        collaborate with others, and generate comprehensive reports on document analysis.
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          🚧 Coming Soon - Review functionality is under development
        </p>
      </div>
    </div>
  )
}

export default ReviewPage