import React, { useState, useEffect } from 'react';
import AlertDemo from '../../../../../../Components/Alert/AlertDemo';
import content from '../../../../../../Jsons/Content/Content.json';
import wearersData from '../../../../../../Jsons/DbJson/Wearers.json';
import socksData from '../../../../../../Jsons/DbJson/Socks.json';

function AddSocks({ open, onClose, value = {}, onChange, onSave }) {
  const [alertType, setAlertType] = useState('');
  const [localForm, setLocalForm] = useState({ FullName: '', SockSerialNumber: '' });

  // arrays from JSON
  const wearers = wearersData?.Wearers ? Object.values(wearersData.Wearers) : [];
  const socks = socksData?.Socks ? Object.values(socksData.Socks) : [];

  useEffect(() => {
    if (open) {
      setAlertType('');
      setLocalForm({
        FullName: value?.FullName ?? '',
        SockSerialNumber: value?.SockSerialNumber ?? '',
      });
    }
  }, [open]); // re-sync when opened

  if (!open) return null;

  const eff = {
    FullName: value?.FullName ?? localForm.FullName,
    SockSerialNumber: value?.SockSerialNumber ?? localForm.SockSerialNumber,
  };

  const setField = (key, val) => {
    setLocalForm((p) => ({ ...p, [key]: val }));
    onChange?.({ ...(value ?? {}), [key]: val }); // safe even if parent doesn't lift state
  };

  const handleSave = (e) => {
    e.preventDefault();
    setAlertType('success');
    setTimeout(() => {
      setAlertType('');
      onClose?.();
      onSave?.({ ...eff });
    }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="from_head">Assign new sock</h3>

        <div className="fromBack">
          <form className="addFrom" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="FullName" className="fromLable">Select Wearers Name</label>
              <select
                className="fromTextarea"
                id="FullName"
                name="FullName"
                required
                value={eff.FullName}
                onChange={(e) => setField('FullName', e.target.value)}
              >
                <option value="" disabled hidden>Select wearers Name</option>
                {wearers.map((c, i) => (
                  <option key={c?.email ?? i} value={c?.FullName ?? ''}>
                    {c?.FullName ?? 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="SockSerialNumber" className="fromLable">Select Sock Serial Number</label>
              <select
                className="fromTextarea"
                id="SockSerialNumber"
                name="SockSerialNumber"
                required
                value={eff.SockSerialNumber}
                onChange={(e) => setField('SockSerialNumber', e.target.value)}
              >
                <option value="" disabled hidden>Select Sock Serial Number</option>
                {socks.map((s, i) => (
                  <option key={s?.SerialNumber ?? i} value={s?.SerialNumber ?? ''}>
                    {s?.SerialNumber ?? 'Unknown'}
                  </option>
                ))}
              </select>
            </div>

            <div className="btn_group">
              <button type="button" className="modal-cls" onClick={onClose}>Close</button>
              <button type="submit" className="modal-save">Save</button>
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
      </div>
    </div>
  );
}

export default AddSocks;
