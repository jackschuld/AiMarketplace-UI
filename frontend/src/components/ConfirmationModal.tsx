import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '28rem',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.25rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          fontFamily: "'Righteous', 'Poppins', sans-serif"
        }}>{title}</h2>
        <p style={{ 
          marginBottom: '1.5rem',
          fontFamily: "'Poppins', sans-serif"
        }}>{message}</p>
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              color: '#4B5563',
              borderRadius: '0.375rem',
              border: '1px solid #D1D5DB',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: '500'
            }}
          >
            No
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#EF4444',
              color: 'white',
              borderRadius: '0.375rem',
              border: 'none',
              fontFamily: "'Poppins', sans-serif",
              fontWeight: '500'
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}; 