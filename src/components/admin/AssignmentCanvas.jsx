"use client"
import React from 'react'
import { motion } from 'framer-motion'

const AssignmentCanvas = ({ 
  articleId, 
  articleTitle, 
  assignedIds, 
  annotators, 
  onDragOver, 
  onDrop, 
  onUnassign,
  onConfirmAssignment,
  isAssigning
}) => {
  const showAssignButton = assignedIds.length >= 2

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div
        onDragOver={onDragOver}
        onDrop={(e) => onDrop(e, articleId)}
        style={{
          marginTop: 8,
          padding: 16,
          background: 'rgba(0, 122, 204, 0.03)',
          border: '2px dashed #007acc',
          borderRadius: 10,
          minHeight: 80,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'flex-start',
        }}
        aria-label={`Drop annotators here for ${articleTitle}`}
      >
        {assignedIds.length === 0 && (
          <div style={{ 
            width: '100%', 
            textAlign: 'center', 
            color: '#007acc', 
            fontSize: 14,
            padding: '20px 0',
            fontWeight: 500
          }}>
            Drag annotator cards here to assign…
          </div>
        )}

        {assignedIds.map(uid => {
          const user = annotators.find(u => (u.user_id) === uid)
          if (!user) return null
          return (
            <div 
              key={uid} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                padding: '16px 20px', 
                fontFamily: 'tt-commons-pro, sans-serif',
                fontSize: "1.25rem",
                background: '#fff', 
                borderRadius: 8,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <span style={{ fontWeight: 600, fontSize: 14, color: '#333' }}>{user.name || user.email || 'Unknown User'}</span>
              <span style={{ color: '#777', fontSize: 12}}>• {user.specialty || 'General'}</span>
              <button 
                onClick={() => onUnassign(articleId, uid)} 
                title="Unassign" 
                style={{ 
                  marginLeft: 6, 
                  border: 'none', 
                  background: 'transparent', 
                  cursor: 'pointer', 
                  color: '#b00020',
                  fontSize: 18,
                  fontWeight: 'bold',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>
          )
        })}
      </div>

      {showAssignButton && (
        <button
          onClick={() => onConfirmAssignment(articleId, assignedIds)}
          disabled={isAssigning}
          style={{
            marginTop: 12,
            padding: '12px 24px',
            background: isAssigning ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: isAssigning ? 'not-allowed' : 'pointer',
            boxShadow: isAssigning ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s ease',
            width: '100%'
          }}
        >
          {isAssigning ? 'Assigning...' : `Assign ${assignedIds.length} Annotators`}
        </button>
      )}
    </motion.div>
  )
}

export default AssignmentCanvas
