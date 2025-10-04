import React, { useState } from 'react';
import { IoAdd, IoClose, IoCreateOutline } from "react-icons/io5";
import { MdDateRange, MdPerson } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import notesData from '../../../../Jsons/DbJson/Notes.json';
import './NotesSection.css';
import { LuNotebook } from "react-icons/lu";

const NotesSection = ({ wearerId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('view'); // 'view' or 'add'
    const [newNote, setNewNote] = useState({
        title: '',
        message: '',
        createdBy: ''
    });

    // Filter notes for current wearer
    const wearerNotes = notesData.Notes.filter(
        note => String(note.wearerID) === String(wearerId)
    );

    const handleModalOpen = () => {
        setIsModalOpen(true);
        setActiveTab('view');
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setNewNote({ title: '', message: '', createdBy: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewNote(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddNote = () => {
        // In a real app, this would save to backend
        console.log('New note added:', newNote);
        alert('Note added successfully! ');
        setNewNote({ title: '', message: '', createdBy: '' });
        setActiveTab('view');
    };
    return (
        <>
            <div className='notes-section' onClick={handleModalOpen}>
                <LuNotebook className='notes-create-icon' />
            </div>

            {/* Notes Modal */}
            {isModalOpen && (
                <div className="notes-modal-overlay" onClick={handleModalClose}>
                    <div className="notes-modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="notes-modal-content">
                            <div className="notes-modal-header">
                                <h3 className="notes-modal-title">Background Notes</h3>
                                <IoClose onClick={handleModalClose} className="notes-modal-close" />
                            </div>

                            <div className="notes-modal-tabs">
                                <button
                                    className={`notes-tab ${activeTab === 'view' ? 'notes-tab-active' : ''}`}
                                    onClick={() => setActiveTab('view')}
                                >
                                    View Notes
                                </button>
                                <button
                                    className={`notes-tab ${activeTab === 'add' ? 'notes-tab-active' : ''}`}
                                    onClick={() => setActiveTab('add')}
                                >
                                    <IoAdd className='notes-tab-icon' />
                                    Add New
                                </button>
                            </div>

                            <div className="notes-modal-body">
                                {activeTab === 'view' ? (
                                    <div className="notes-view-section">
                                        {wearerNotes.length > 0 ? (
                                            <div className="notes-list">
                                                {wearerNotes.map((note) => (
                                                    <div key={note.id} className="note-item">
                                                        <div className="note-header">
                                                            <h4 className="note-title">{note.title}</h4>
                                                            <div className="note-meta">
                                                                <span className="note-date">
                                                                    <MdDateRange className="note-meta-icon" />
                                                                    {note.dateCreated}
                                                                </span>
                                                                <span className="note-time">
                                                                    <IoTimeOutline className="note-meta-icon" />
                                                                    {note.timeCreated}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="note-message">{note.message}</p>
                                                        <div className="note-footer">
                                                            <span className="note-author">
                                                                <MdPerson className="note-meta-icon" />
                                                                {note.createdBy}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="notes-empty-state">
                                                <p>No background notes found for this wearer.</p>
                                                <button
                                                    className="notes-add-first-btn"
                                                    onClick={() => setActiveTab('add')}
                                                >
                                                    Add First Note
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="notes-add-section">
                                        <form className="notes-form" onSubmit={(e) => e.preventDefault()}>
                                            <div className="form-group">
                                                <label className="form-label">Note Title *</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    value={newNote.title}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter a brief title for this note..."
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Your Name *</label>
                                                <input
                                                    type="text"
                                                    name="createdBy"
                                                    value={newNote.createdBy}
                                                    onChange={handleInputChange}
                                                    className="form-input"
                                                    placeholder="Enter your name..."
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Message *</label>
                                                <textarea
                                                    name="message"
                                                    value={newNote.message}
                                                    onChange={handleInputChange}
                                                    className="form-textarea"
                                                    placeholder="Enter background information, preferences, or Notes..."
                                                    rows="4"
                                                    required
                                                />
                                            </div>

                                            <div className="form-actions">
                                                <button
                                                    type="button"
                                                    className="btn-cancel"
                                                    onClick={() => setActiveTab('view')}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-save"
                                                    onClick={handleAddNote}
                                                    disabled={!newNote.title || !newNote.message || !newNote.createdBy}
                                                >
                                                    Save Note
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotesSection;