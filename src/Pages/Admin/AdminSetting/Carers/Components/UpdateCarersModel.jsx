import React, { useState, useEffect } from 'react';
import AlertDemo from '../../../../../Components/Alert/AlertDemo';
import content from '../../../../../Jsons/Content/Content.json';
import { IoEye, IoEyeOff } from 'react-icons/io5';

function UpdateCarersModel({ open, onClose, value, onChange, onSave }) {
  const [alertType, setAlertType] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) setAlertType('');
  }, [open]);

  if (!open) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setAlertType('success');
    setTimeout(() => {
      setAlertType('');
      onClose();
      if (typeof onSave === 'function') onSave();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className='from_head'>update nurse details</h3>
        <div className='fromBack'>
          <form className='addFrom' onSubmit={handleSave}>
            <div className='form-group'>
              <label htmlFor="Full Name" className='fromLable'>Full Name</label>
              <input
                className='fromTextarea'
                id="Full Name"
                name="Full Name"
                placeholder="Enter Full Name"
                required
                type='text'
                value={value?.name ?? ''}
                onChange={(e) => onChange?.({ ...value, name: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <label htmlFor="Email" className='fromLable'>Email</label>
              <input
                className='fromTextarea'
                id="Email"
                name="Email"
                placeholder="Enter Email"
                required
                type='email'
                value={value?.email ?? ''}
                onChange={(e) => onChange?.({ ...value, email: e.target.value })}
              />
            </div>
            <div className='form-group' style={{ position: 'relative' }}>
              <label htmlFor="Password" className='fromLable'>Password</label>
              <input
                className='fromTextarea'
                id="Password"
                name="Password"
                placeholder="Enter Password"
                required
                type={showPassword ? 'text' : 'password'}
                value={value?.password ?? ''}
                onChange={(e) => onChange?.({ ...value, password: e.target.value })}
              />
              <span
                className='password-toggle-icon'
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
            <div className='btn_group'>
              <button type="button" className="modal-cls" onClick={onClose}>Close</button>
              <button type="submit" className="modal-save">Add</button>
            </div>
          </form>
        </div>
      </div>

      <div className='Alert'>
        {alertType === 'success' && (
          <AlertDemo
            type='success'
            title={content.CareSetting.successEditTitle}
            message={content.CareSetting.successEditMessage}
            onClose={() => setAlertType('')}
          />
        )}
        {alertType === 'invalid' && (
          <AlertDemo
            type='invalid'
            title={content.CareSetting.invalidTitle}
            message={content.CareSetting.invalidMessage}
            onClose={() => setAlertType('')}
          />
        )}
      </div>
    </div>
  )
}

export default UpdateCarersModel
