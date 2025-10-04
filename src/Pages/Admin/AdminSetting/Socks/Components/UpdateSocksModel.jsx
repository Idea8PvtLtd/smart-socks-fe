import React, { useState, useEffect } from 'react';
import AlertDemo from '../../../../../Components/Alert/AlertDemo';
import content from '../../../../../Jsons/Content/Content.json';
import carersData from '../../../../../Jsons/DbJson/Carers.json';

function UpdateSocksModel({ open, onClose, value, onChange, onSave }) {
  const [alertType, setAlertType] = useState('');
  const [carersNames, setCarersNames] = useState([]);

  const [localForm, setLocalForm] = useState({
    CarerName: '',
    SerialNumber: '',
  });

  useEffect(() => {
    if (!open) return;
    setAlertType('');

    const incomingCarer =
      value?.CarerName ?? value?.CarersName ?? '';
    const incomingSerial =
      value?.SerialNumber ?? value?.SockSerialNumber ?? '';

    setLocalForm({
      CarerName: incomingCarer,
      SerialNumber: incomingSerial,
    });
  }, [open, value]);

  useEffect(() => {
    const carers = carersData?.Carers ?? {};
    const names = Object.values(carers)
      .map((c) => c?.name ?? c?.CarerName ?? c?.CarersName)
      .filter(Boolean);

    setCarersNames((prev) => {
      const curr = (localForm.CarerName || '').trim();
      if (curr && !names.includes(curr)) {
        return [curr, ...names];
      }
      return names;
    });
  }, [localForm.CarerName]);

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
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="from_head">Update socks data</h3>

        <div className="fromBack">
          <form className="addFrom" onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="nurseName" className="fromLable">Select nurse</label>
              <select
                className="fromTextarea"
                id="CarerName"
                name="CarerName"
                required
                value={localForm.CarerName}
                onChange={(e) => updateField('CarerName', e.target.value)}
              >
                <option value="" disabled hidden>
                  Select nurse
                </option>
                {carersNames.map((name, idx) => (
                  <option key={`${name}-${idx}`} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="SerialNumber" className="fromLable">Sock Serial Number</label>
              <input
                className="fromTextarea"
                id="SerialNumber"
                name="SerialNumber"
                placeholder="Enter Sock Serial Number"
                required
                type="text"
                value={localForm.SerialNumber}
                onChange={(e) => updateField('SerialNumber', e.target.value)}
              />
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
            title={content?.Socks?.successEditTitle ?? 'Updated'}
            message={content?.Socks?.successEditMessage ?? 'Socks updated successfully.'}
            onClose={() => setAlertType('')}
          />
        )}
        {alertType === 'invalid' && (
          <AlertDemo
            type="invalid"
            title={content?.Socks?.invalidTitle ?? 'Invalid'}
            message={content?.Socks?.invalidMessage ?? 'Please check the fields and try again.'}
            onClose={() => setAlertType('')}
          />
        )}
      </div>
    </div>
  );
}

export default UpdateSocksModel;
