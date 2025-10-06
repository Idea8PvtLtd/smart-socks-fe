import React, { useState, useEffect } from 'react';
import './Observations.css';
import AlertDemo from '../../../Components/Alert/AlertDemo';
import content from '../../../Jsons/Content/Content.json';

function AddObservationsModel({ open, onClose, value, onChange, onSave }) {
    const [alertType, setAlertType] = useState('');

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
            if (typeof onSave === 'function') onSave();
        }, 1000);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3 className='from_head'>Add new Notes</h3>
                <div className='fromBack'>
                    <form className='addFrom' onSubmit={handleSave}>
                        
                        {/* ======= NEW TIME INPUT ======= */}
                        <div className='form-group'>
                            <label htmlFor="Time" className='fromLable'>Time</label>
                            <input
                                type="time"
                                className='fromTextarea'
                                id="Time"
                                name="Time"
                                required
                                onChange={(e) => onChange?.({ ...value, Time: e.target.value })}
                            />
                        </div>
                        {/* =============================== */}

                        <div className='form-group'>
                            <label htmlFor="Behavior" className='fromLable'>Behavior</label>
                            <textarea
                                className='fromTextarea'
                                id="Behavior"
                                name="Behavior"
                                placeholder="Enter Behavior"
                                required
                                rows={5}
                                onChange={(e) => onChange?.({ ...value, Behavior: e.target.value })}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor="Support" className='fromLable'>Support</label>
                            <textarea
                                className='fromTextarea'
                                id="Support"
                                name="Support"
                                placeholder="Enter Support"
                                required
                                rows={5}
                                onChange={(e) => onChange?.({ ...value, Support: e.target.value })}
                            />
                        </div>

                        <div className='form-group'>
                            <label htmlFor="Trigger" className='fromLable'>Trigger</label>
                            <textarea
                                className='fromTextarea'
                                id="Trigger"
                                name="Trigger"
                                placeholder="Enter Trigger"
                                required
                                rows={5}
                                onChange={(e) => onChange?.({ ...value, Trigger: e.target.value })}
                            />
                        </div> 

                        <div className='form-group'>
                            <label htmlFor="Note" className='fromLable'>Note</label>
                            <textarea
                                className='fromTextarea'
                                id="Note"
                                name="Note"
                                placeholder="Enter Note"
                                required
                                rows={5}
                                onChange={(e) => onChange?.({ ...value, Note: e.target.value })}
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
                        title={content.observations.successTitle}
                        message={content.observations.successAddMessage}
                        onClose={() => setAlertType('')}
                    />
                )}
                {alertType === 'invalid' && (
                    <AlertDemo
                        type='invalid'
                        title={content.careLogin.invalidTitle}
                        message={content.careLogin.invalidMessage}
                        onClose={() => setAlertType('')}
                    />
                )}
            </div>
        </div>
    );
}

export default AddObservationsModel;
