import React, { useState, useEffect } from 'react';
import AlertDemo from '../../../../../Components/Alert/AlertDemo';
import content from '../../../../../Jsons/Content/Content.json';
import carersData from '../../../../../Jsons/DbJson/Carers.json';

function AddSocksModel({ open, onClose, value, onChange, onSave }) {
  const [alertType, setAlertType] = useState('');
  const [carersNames, setCarersNames] = useState([]);

  const [localForm, setLocalForm] = useState({
    CarersName: '',
    SockSerialNumber: ''
  });

  useEffect(() => {
    if (open) {
      setAlertType('');
      setLocalForm({
        CarersName: value?.CarersName ?? '',
        SockSerialNumber: value?.SockSerialNumber ?? ''
      });
    }
  }, [open]); 

  useEffect(() => {
    const carers = carersData?.Carers ?? {};
    const names = Object.values(carers)
      .map((c) => c?.name ?? c?.CarersName)
      .filter(Boolean);
    setCarersNames(names);
  }, []);

  if (!open) return null;

  const updateField = (field, val) => {
    setLocalForm((prev) => {
      const next = { ...prev, [field]: val };
      onChange?.(next);
      return next;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setAlertType('success');
    setTimeout(() => {
      setAlertType('');
      onSave?.(localForm);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="from_head">Add new socks</h3>

        <div className="fromBack">
          <form className="addFrom" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="CarersName" className="fromLable">Select nurse Name</label>
              <select
                className="fromTextarea"
                id="CarersName"
                name="CarersName"
                required
                value={localForm.CarersName}
                onChange={(e) => updateField('CarersName', e.target.value)}
              >
                <option value="" disabled hidden>
                  Select nurse Name
                </option>
                {carersNames.map((name, idx) => (
                  <option key={`${name}-${idx}`} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="SockSerialNumber" className="fromLable">Enter Sock Serial Number</label>
              <input
                className="fromTextarea"
                id="SockSerialNumber"
                name="SockSerialNumber"
                placeholder="Enter Sock Serial Number"
                required
                type="text"
                value={localForm.SockSerialNumber}
                onChange={(e) => updateField('SockSerialNumber', e.target.value)}
              />
            </div>

            <div className="btn_group">
              <button type="button" className="modal-cls" onClick={onClose}>Close</button>
              <button type="submit" className="modal-save">Add</button>
            </div>
          </form>
        </div>
      </div>

      <div className="Alert">
        {alertType === 'success' && (
          <AlertDemo
            type="success"
            title={content.Socks.successTitle}
            message={content.Socks.successAddMessage}
            onClose={() => setAlertType('')}
          />
        )}
        {alertType === 'invalid' && (
          <AlertDemo
            type="invalid"
            title={content.Socks.invalidTitle}
            message={content.Socks.invalidMessage}
            onClose={() => setAlertType('')}
          />
        )}
      </div>
    </div>
  );
}

export default AddSocksModel;
