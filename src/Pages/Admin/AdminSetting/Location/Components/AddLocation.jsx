import React, { useState, useEffect } from 'react';
import AlertDemo from '../../../../../Components/Alert/AlertDemo';
import content from '../../../../../Jsons/Content/Content.json';
import { RiAddBoxFill } from "react-icons/ri";
import { RiDeleteBinLine } from "react-icons/ri";

function AddLocation({ open, onClose, value, onChange, onSave }) {
  const [alertType, setAlertType] = useState('');
  const [areas, setAreas] = useState([]);
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


  // Add new empty area
  const handleAddArea = () => {
    setAreas([...areas, ""]);
  };

  // Delete area by index
  const handleDeleteArea = (idx) => {
    setAreas(areas.filter((_, i) => i !== idx));
  };

  // Update area value
  const handleAreaChange = (idx, value) => {
    const newAreas = [...areas];
    newAreas[idx] = value;
    setAreas(newAreas);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className='from_head'>Add new location</h3>
        <div className='fromBack'>
          <form className='addFrom' onSubmit={handleSave}>
            <div className='form-group'>
              <label htmlFor="Location Name" className='fromLable'>Location Name</label>
              <input
                className='fromTextarea'
                id="Location Name"
                name="Location Name"
                placeholder="Enter Location Name"
                required
                type='text'
                onChange={(e) => onChange?.({ ...value, locationName: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <label htmlFor="Address" className='fromLable'>Address</label>
              <textarea
                className='fromTextarea'
                id="Address"
                name="Address"
                placeholder="Enter Address"
                required
                type='text'
                rows={4}
                onChange={(e) => onChange?.({ ...value, address: e.target.value })}
              />
            </div>
            <div className='form-group'>
              <div className='labelFlex'>
                <label htmlFor='Areas' className='fromLable'>Areas</label>
                <RiAddBoxFill
                  className='plusIcon'
                  style={{ cursor: 'pointer' }}
                  onClick={handleAddArea}
                />
              </div>
              {areas.map((area, idx) => (
                <div className='careAreaflex' key={idx}>
                  <input
                    type='text'
                    className='fromTextarea'
                    id={`area-${idx}`}
                    name={`area-${idx}`}
                    placeholder='Enter Area'
                    value={area}
                    onChange={e => handleAreaChange(idx, e.target.value)}
                  />
                  <RiDeleteBinLine
                    className='dltIcon'
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleDeleteArea(idx)}
                  />
                </div>
              ))}
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
            title={content.LocationSetting.successTitle}
            message={content.LocationSetting.successAddMessage}
            onClose={() => setAlertType('')}
          />
        )}
        {alertType === 'invalid' && (
          <AlertDemo
            type='invalid'
            title={content.LocationSetting.invalidTitle}
            message={content.LocationSetting.invalidMessage}
            onClose={() => setAlertType('')}
          />
        )}
      </div>
    </div>
  )
}

export default AddLocation
