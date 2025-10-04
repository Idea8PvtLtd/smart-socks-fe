import React, { useState, useEffect } from 'react';
import { MdDeleteForever } from "react-icons/md";
import AlertDemo from '../../../../../Components/Alert/AlertDemo';
import content from '../../../../../Jsons/Content/Content.json';

function DeleteCarersModel({ open, onClose, onConfirm }) {
  const [alertType, setAlertType] = useState('');

  useEffect(() => {
    if (open) setAlertType('');
  }, [open]);

  if (!open) return null;

  const handleDelete = () => {
    setAlertType('success');
    setTimeout(() => {
      setAlertType('');
      onConfirm?.(); // bubble up
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="delete-header">
          <MdDeleteForever className="delete-icon" size={40} />
          <h3 className="delete-title">Delete nurse account</h3>
        </div>
        <p className="delete-text">
          Are you sure you want to delete this account? This action cannot be undone.
        </p>

        <div className="btn_group">
          <button type="button" className="modal-cncl" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="modal-del" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="Alert">
        {alertType === 'success' && (
          <AlertDemo
            type="success"
            title={content.Socks.successDeleteTitle}
            message={content.Socks.successDeleteMessage}
            onClose={() => setAlertType('')}
          />
        )}
      </div>
    </div>
  )
}

export default DeleteCarersModel
