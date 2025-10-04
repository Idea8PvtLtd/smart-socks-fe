import React, { useState, useEffect } from 'react';
import AlertDemo from '../../../../../../Components/Alert/AlertDemo';
import content from '../../../../../../Jsons/Content/Content.json';

function AddWeares({ open, onClose, value, onChange, onSave }) {
  const [alertType, setAlertType] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [imgName, setImgName] = useState('No File Chosen');
  const [imgError, setImgError] = useState('');
  // Clear any previous alert each time the modal is opened
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
      // If you still want to notify parent that a save occurred:
      if (typeof onSave === 'function') onSave();
    }, 1000);
  };
  // --- Image upload state/logic ---


  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImgError('');

    if (file.size > 5 * 1024 * 1024) {
      setImgError('File must be under 5MB');
      return;
    }


    const url = URL.createObjectURL(file);
    const probe = new Image();
    probe.onload = () => {

      setImgPreview(url);
      setImgName(file.name);
      // bubble up to parent if needed
      onChange?.({ ...value, avatarFile: file });
    };
    probe.onerror = () => {
      setImgError('Invalid image file');
      URL.revokeObjectURL(url);
    };
    probe.src = url;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className='from_head'>Add new WEARERS</h3>
        <div className='fromBack'>
          <form className='addFrom' onSubmit={handleSave}>
            <div className="form-group">
              <label className="fromLable">Profile Image</label>

              <div className="uploadRow">
                <div className="uploadPreview">
                  {imgPreview ? (
                    <img src={imgPreview} alt="Preview" />
                  ) : (
                    <span className="imgIcon" />
                  )}
                </div>

                <div className="uploadControls">
                  <p className="uploadHint">size less than 5MB</p>

                  <label className="uploadBtn">
                    Choose File
                    <input type="file" accept="image/*" onChange={handleImage} />
                  </label>

                  <span className="fileName">{imgName}</span>

                  {imgError && <div className="errorText">{imgError}</div>}
                </div>
              </div>
            </div>

            <div className='form-group'>
              <label htmlFor="Full Name" className='fromLable'>Full Name</label>
              <input
                className='fromTextarea'
                id="Full Name"
                name="Full Name"
                placeholder="Enter Full Name"
                required
                type='text'
                onChange={(e) => onChange?.({ ...value, FullName: e.target.value })}
              />
            </div>
            <div className='form-row'>
              <div className='form-group'>
                <label htmlFor="BirthDay" className='fromLable'>Birth Day</label>
                <input
                  className='fromTextarea'
                  id="BirthDay"
                  name="BirthDay"
                  required
                  type='date'
                  onChange={(e) => onChange?.({ ...value, BirthDay: e.target.value })}
                />
              </div>

              <div className='form-group'>
                <label htmlFor="Area" className='fromLable'>Area</label>
                <input
                  className='fromTextarea'
                  id="Area"
                  name="Area"
                  placeholder="Enter Area"
                  required
                  type='text'
                  onChange={(e) => onChange?.({ ...value, Area: e.target.value })}
                />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor="KnownTriggers" className='fromLable'>Known Triggers</label>
              <textarea
                className='fromTextarea'
                id="KnownTriggers"
                name="KnownTriggers"
                placeholder="Enter Known Triggers"
                required
                rows={5}
                type='text'
                onChange={(e) => onChange?.({ ...value, KnownTriggers: e.target.value })}
              />
            </div>

            <div className='form-group'>
              <label htmlFor="LevelOfNeed" className='fromLable'>Level Of Need</label>
              <input
                className='fromTextarea'
                id="LevelOfNeed"
                name="LevelOfNeed"
                placeholder="Enter Level Of Need"
                required
                type='text'
                onChange={(e) => onChange?.({ ...value, LevelOfNeed: e.target.value })}
              />
            </div>

            <div className='form-group'>
              <label htmlFor="Known Successful Support" className='fromLable'>Known Successful Support</label>
              <textarea
                className='fromTextarea'
                id="KnownSuccessfulSupport"
                name="KnownSuccessfulSupport"
                placeholder="Enter Known Successful Support"
                required
                type='text'
                rows={5}
                onChange={(e) => onChange?.({ ...value, KnownSuccessfulSupport: e.target.value })}
              />
            </div>

            <div className='btn_group'>
              <button type="button" className="modal-cls" onClick={onClose}>Close</button>
              <button type="submit" className="modal-save">Save</button>
            </div>
          </form>
        </div>
      </div>

      <div className='Alert'>
        {alertType === 'success' && (
          <AlertDemo
            type='success'
            title={content.Wearers.successTitle}
            message={content.Wearers.successAddMessage}
            onClose={() => setAlertType('')}
          />
        )}
        {alertType === 'invalid' && (
          <AlertDemo
            type='invalid'
            title={content.Wearers.invalidTitle}
            message={content.Wearers.invalidMessage}
            onClose={() => setAlertType('')}
          />
        )}
      </div>
    </div>
  );
}
export default AddWeares
