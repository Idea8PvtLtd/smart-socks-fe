import React, { useEffect, useRef } from 'react';
import './alert.css'

const alertConfig = {
    success: {
        className: 'success-alert',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 12 2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
            </svg>
        ),
        defaultTitle: 'Success!',
        defaultMessage: 'Your operation completed successfully.'
    },
    error: {
        className: 'error-alert',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
        ),
        defaultTitle: 'Error Alert',
        defaultMessage: 'Something went wrong! Please try again.'
    },
    invalid: {
        className: 'invalid-alert',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
        ),
        defaultTitle: 'Invalid Credential',
        defaultMessage: 'The credentials you provided are incorrect.'
    }
};

const AlertDemo = ({ type, title, message, onClose, duration = 2000 }) => {
    const timerRef = useRef();
    useEffect(() => {
        if (!type) return;
        timerRef.current = setTimeout(() => {
            onClose && onClose();
        }, duration);
        return () => clearTimeout(timerRef.current);
    }, [type, onClose, duration]);
    if (!type || !alertConfig[type]) return null;
    const { className, icon, defaultTitle, defaultMessage } = alertConfig[type];
    return (
        <div className={`alert ${className}`} style={{ position: 'relative' }}>
            <div className="alert-icon">{icon}</div>
            <div className="alert-content">
                <h3 className="alert-title">{title || defaultTitle}</h3>
                {message && <p className="alert-message">{message}</p>}
            </div>
            <button className="close-btn" onClick={onClose}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div className={`alert-progress${type === 'success' ? ' success-progress' : type === 'invalid' ? ' invalid-progress' : ''}`}
                style={{
                    animation: `alert-progress-bar ${duration}ms linear forwards`,
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    height: '4px',
                    width: '100%'
                }}
            ></div>
        </div>
    );
};

export default AlertDemo;