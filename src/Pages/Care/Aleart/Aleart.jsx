import React, { useState, useRef, useEffect } from 'react';
import { MdDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { IoCheckmark } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import './Aleart.css';
import NavBar from '../../../Components/NavBar/NavBar';
import SideBar from '../../../Components/SideBar/SideBar';
import { useWearersData } from '../../../Jsons/DbJson/useDbJson';
import { useAlertsData } from '../../../Jsons/DbJson/useDbJson';
import NotesSection from './Components/NotesSection'
import { LuNotebookPen } from "react-icons/lu";
// Alert Modal Component
const AlertModal = ({ alert, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !alert) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <p className="modal-headerTit">Alert Details</p>
            <IoClose onClick={onClose} className="modal-headerCls" />
          </div>
          <div className={alert.status === "High" ? "alert_card_High" : "alert_card"} key={alert.id}>
            <div className='alert_card_head'>
              <div className={
                `alert_card_status alert_card_status_${alert.status.toLowerCase()}`
              }>
                <p className='alert_card_status_text'>{alert.status.toUpperCase()}</p>
              </div>
              <div className='alert_date_timecard'>
                <div className='alert_date_time'>
                  <MdDateRange className='alert_date_time_icon' />
                  <p className='alert_date_time_txt'>{alert.date}</p>
                </div>
                <div className='alert_date_time'>
                  <IoTimeOutline className='alert_date_time_icon' />
                  <p className='alert_date_time_txt'>{alert.time}</p>
                </div>
              </div>
            </div>
            <div className='alert_card_body'>
              <p className='wearer_name'>WEARER : {alert.FullName?.toUpperCase()}</p>
              <p className='dataTextCard'>
                <span className='dataTextCardTg'>Location : </span> {alert.location}
              </p>
              <p className='dataTextCard'>
                <span className='dataTextCardTg'>nurse : </span> {alert.carer}
              </p>
              <p className='dataTextCard'>
                <span className='dataTextCardTg'>Trigger : </span> {alert.trigger}
              </p>
              <p className='dataTextCard'>
                <span className='dataTextCardTg'>Behavior : </span> {alert.Behavior}
              </p>
              <p className='dataTextCard'>
                <span className='dataTextCardTg'>Support : </span> {alert.Support}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// See More Modal Component
const SeeMoreModal = ({ title, content, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="see-more-modal-overlay" onClick={onClose}>
      <div className="see-more-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="see-more-modal-content">
          <div className="see-more-modal-header">
            <h3 className="see-more-modal-title">{title}</h3>
            <IoClose onClick={onClose} className="see-more-modal-close" />
          </div>
          <div className="see-more-modal-body">
            <p className="see-more-modal-text">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom Multi-Select Dropdown Component
const MultiSelectDropdown = ({ wearers, selectedWearers, setSelectedWearers }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter wearers based on search term
  const filteredWearers = wearers.filter(wearer =>
    wearer.FullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle wearer selection
  const toggleWearer = (wearer) => {
    setSelectedWearers(prev => {
      const isSelected = prev.some(w => w.id === wearer.id);
      if (isSelected) {
        return prev.filter(w => w.id !== wearer.id);
      } else {
        return [...prev, wearer];
      }
    });
  };

  // Remove selected wearer
  const removeWearer = (wearerId) => {
    setSelectedWearers(prev => prev.filter(w => w.id !== wearerId));
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedWearers([]);
  };

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
        <div className="selected-items">
          {selectedWearers.length === 0 ? (
            <span className="placeholder">Select Wearers</span>
          ) : (
            <div className="selected-tags">
              {selectedWearers.slice(0, 2).map(wearer => (
                <span key={wearer.id} className="selected-tag">
                  {wearer.FullName}
                  <IoClose
                    className="tag-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeWearer(wearer.id);
                    }}
                  />
                </span>
              ))}
              {selectedWearers.length > 2 && (
                <span className="more-count">+{selectedWearers.length - 2} more</span>
              )}
            </div>
          )}
        </div>
        <IoChevronDown className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <div className="search-container">
            <IoSearchOutline className="search-icon" />
            <input
              type="text"
              placeholder="Search Here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {selectedWearers.length > 0 && (
            <div className="dropdown-actions">
              <button className="clear-all-btn" onClick={clearAll}>
                Clear All ({selectedWearers.length})
              </button>
            </div>
          )}

          <div className="options-list">
            {filteredWearers.length === 0 ? (
              <div className="no-results">No wearers found</div>
            ) : (
              filteredWearers.map(wearer => {
                const isSelected = selectedWearers.some(w => w.id === wearer.id);
                return (
                  <div
                    key={wearer.id}
                    className={`option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleWearer(wearer)}
                  >
                    <div className="option-content">
                      <span className="option-text">{wearer.FullName}</span>
                      {isSelected && <IoCheckmark className="check-icon" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function Aleart() {
  const wearersData = useWearersData();
  const alertsData = useAlertsData();
  // Get selected wearer id from localStorage
  const selectedWearerId = localStorage.getItem('selectedWearerId');

  // Get all wearers as array
  const wearers = Array.isArray(wearersData)
    ? wearersData
    : Object.values(wearersData.Wearers || {});

  // State for selected wearers in dropdown
  const [selectedWearers, setSelectedWearers] = useState([]);

  // State for alert modal
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for see more modal
  const [seeMoreData, setSeeMoreData] = useState({ title: '', content: '', isOpen: false });

  // Add filter state
  const [selectedFilter, setSelectedFilter] = useState('');

  // Find the wearer matching the id
  const selectedWearer = wearers.find(w => String(w.id) === String(selectedWearerId));

  // Get alerts as array
  const alerts = Array.isArray(alertsData)
    ? alertsData
    : Object.values(alertsData.Alert || {});

  // Filter alerts based on selected wearers
  let filteredAlerts = selectedWearers.length > 0
    ? alerts.filter(alert =>
      selectedWearers.some(wearer => wearer.FullName === alert.FullName)
    )
    : alerts;

  // Apply filter from select dropdown
  if (selectedFilter === "Status High") {
    filteredAlerts = filteredAlerts.filter(alert => alert.status === "High");
  } else if (selectedFilter === "Status Low") {
    filteredAlerts = filteredAlerts.filter(alert => alert.status === "Low");
  } else if (selectedFilter === "Most recent") {
    filteredAlerts = [...filteredAlerts].sort((a, b) => {
      // Combine date and time for comparison (assumes format is consistent)
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB - dateA;
    });
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAlert(null);
  };

  // Handle see more click
  const handleSeeMoreClick = (e, title, content) => {
    e.stopPropagation(); // Prevent row click
    setSeeMoreData({ title, content, isOpen: true });
  };

  // Handle see more modal close
  const handleSeeMoreClose = () => {
    setSeeMoreData({ title: '', content: '', isOpen: false });
  };

  // Drill Down navigation handler
  const handleDrillDown = (wearerId) => {
    localStorage.setItem('selectedWearerId', wearerId);
    window.location.href = '/drillDown';
  };

  // Function to truncate text to 3 words
  const truncateText = (text, wordLimit = 2) => {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') : text;
  };

  return (
    <>
      <NavBar />
      <SideBar />
      <div className='dashone'>
        <div className='dashcon'>
          <div className='continercard'>
            <div className='subContinerCard'>
              <div className='cardheader'>
                <div className='hed_leftAro'>
                  <h2 className='titel'>WEARER ALERTS</h2>
                </div>
                <div className='controls'>
                  {/* Update select to control filter */}
                  <select
                    className='select_drop'
                    value={selectedFilter}
                    onChange={e => setSelectedFilter(e.target.value)}
                  >
                    <option value="">Select Filter</option>
                    <option value="Status High">Status High</option>
                    <option value="Status Low">Status Low</option>
                    <option value="Most recent">Most recent</option>
                  </select>
                  <MultiSelectDropdown
                    wearers={wearers}
                    selectedWearers={selectedWearers}
                    setSelectedWearers={setSelectedWearers}
                  />
                </div>
              </div>
            </div>
            <div className='subContinerCard'>
              <div className='alerts-table-container'>
                <table className='alerts-table'>
                  <thead className='alerts-table-header'>
                    <tr>
                      <th className='table-header-cell'>Wearer Name</th>
                      <th className='table-header-cell'>Status</th>
                      <th className='table-header-cell'>Date & Time</th>
                      <th className='table-header-cell'>Event</th>
                      <th className='table-header-cell'>Location</th>
                      <th className='table-header-cell'>nurse</th>
                      <th className='table-header-cell'>Trigger</th>
                      <th className='table-header-cell'>Support</th>
                      <th className='table-header-cell'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => (
                      <tr
                        key={alert.id}
                        className={`table-row ${alert.status === "High" ? "table-row-high" : "table-row-normal"}`}

                      >
                        <td className='table-cell table-wearer-name'>{alert.FullName}</td>
                        <td className='table-cell'>
                          <div className={`table-status-badge table-status-${alert.status.toLowerCase()}`}>
                            {alert.status.toUpperCase()}
                          </div>
                        </td>
                        <td className='table-cell'>
                          <div className='table-datetime'>
                            <div className='table-date'>
                              <span>{alert.date}</span>
                            </div>
                            <div className='table-time'>
                              <span>{alert.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className='table-cell'>
                          <div className='table-text-with-more'>
                            <span className='table-truncated-text'>{truncateText(alert.event)}..</span>
                            {alert.event && alert.event.split(' ').length > 2 && (
                              <button
                                className='see-more-btn'
                                onClick={(e) => handleSeeMoreClick(e, 'Event', alert.event)}
                              >
                                See more
                              </button>
                            )}
                          </div>
                        </td>
                        <td className='table-cell'>{alert.location}</td>
                        <td className='table-cell'>{alert.carer}</td>
                        <td className='table-cell'>
                          <div className='table-text-with-more'>
                            <span className='table-truncated-text'>{truncateText(alert.trigger)}..</span>
                            {alert.trigger && alert.trigger.split(' ').length > 2 && (
                              <button
                                className='see-more-btn'
                                onClick={(e) => handleSeeMoreClick(e, 'Trigger', alert.trigger)}
                              >
                                See more
                              </button>
                            )}
                          </div>
                        </td>
                        <td className='table-cell'>
                          <div className='table-text-with-more'>
                            <span className='table-truncated-text'>{truncateText(alert.Support)}..</span>
                            {alert.Support && alert.Support.split(' ').length > 2 && (
                              <button
                                className='see-more-btn'
                                onClick={(e) => handleSeeMoreClick(e, 'Support', alert.Support)}
                              >
                                See more
                              </button>
                            )}
                          </div>
                        </td>
                        <td className='table-cell'>
                          <div className='table-action-buttons'>
                            <button
                              className='drilldown-btn'
                              onClick={() => handleDrillDown(alert.id)}
                            >
                              Drill
                            </button>
                            <button
                              className='drilldown-btn'
                            >
                              <NotesSection wearerId={selectedWearerId} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      <AlertModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* See More Modal */}
      <SeeMoreModal
        title={seeMoreData.title}
        content={seeMoreData.content}
        isOpen={seeMoreData.isOpen}
        onClose={handleSeeMoreClose}
      />
    </>
  )
}

export default Aleart;