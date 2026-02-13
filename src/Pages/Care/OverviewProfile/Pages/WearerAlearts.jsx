import React, { useState, useEffect } from 'react'
import NavBar from '../../../../Components/NavBar/NavBar'
import SideBar from '../../../../Components/SideBar/SideBar'
import { useWearersData } from '../../../../Jsons/DbJson/useDbJson';
import { useAlertsData } from '../../../../Jsons/DbJson/useDbJson';
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";
import { GiBattery100 } from "react-icons/gi";
import { MdDateRange } from "react-icons/md";
import { IoTimeOutline } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";
import BarChart from '../Components/BarChart'
import NotesSection from '../../Aleart/Components/NotesSection'
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

function WearerAlearts() {
  const wearersData = useWearersData();
  const alertsData = useAlertsData();
    // Get selected wearer id from localStorage
    const selectedWearerId = localStorage.getItem('selectedWearerId');

    // Get all wearers as array (assuming wearersData.Wearers is an object)
    const wearers = Array.isArray(wearersData)
        ? wearersData
        : Object.values(wearersData.Wearers || {});

    // Find the wearer matching the id
    const selectedWearer = wearers.find(w => String(w.id) === String(selectedWearerId));

    // Get alerts as array
    const alerts = Array.isArray(alertsData)
        ? alertsData
        : Object.values(alertsData.Alert || {});

    // Add filter state
    const [selectedFilter, setSelectedFilter] = useState('');

    // Filter alerts for selected wearer only
    let filteredAlerts = alerts.filter(
        alert => String(alert.wearerID) === String(selectedWearerId)
    );

    // Apply filter from select dropdown
    if (selectedFilter === "Status High") {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === "High");
    } else if (selectedFilter === "Status Low") {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === "Low");
    } else if (selectedFilter === "Most recent") {
        filteredAlerts = [...filteredAlerts].sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time}`);
            const dateB = new Date(`${b.date} ${b.time}`);
            return dateB - dateA;
        });
    }

    // State for alert modal
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State for see more modal
    const [seeMoreData, setSeeMoreData] = useState({ title: '', content: '', isOpen: false });


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

    // Function to truncate text to 3 words
    const truncateText = (text, wordLimit = 3) => {
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
                                    <FaArrowLeftLong className='arrow_line' onClick={() => (window.location.href = '/overview')} />
                                    <h2 className='titel'>WEARER ALERTS</h2>
                                </div>
                                <div className='controls_nav'>
                                    <div className='controls_nav_con'>
                                        <p className='controls_nav_menu' onClick={() => (window.location.href = '/overviewProfile')}>Wearer profile</p>
                                    </div>
                                    <div className='controls_nav_con'>
                                        <p className='controls_nav_menu' onClick={() => (window.location.href = '/wearerObservations')}>Notes</p>
                                    </div>
                                </div>
                            </div>
                            <div className='cardbodyProfile'>
                                <div className='dataCardSetNew'>
                                    {selectedWearer ? (
                                        <div className={`dataCard ${selectedWearer.WearerStatus === "High" ? "dataCardBorder" : ""}`}
                                            key={selectedWearer.id}
                                        >
                                            <img src={`${selectedWearer.ProfileImage}`} alt={selectedWearer.FullName} className='wearerImage' />
                                            <div className='card_data'>
                                                <div className='flx_row_card'>
                                                    <div className='namedatarwo'>
                                                        <p className={`wearerName ${selectedWearer.WearerStatus === "High" ? "wearerNameHigh" : ""}`}
                                                        >
                                                            {selectedWearer.FullName}</p>
                                                        <p className='wearerAreaa'>{selectedWearer.floor}</p>
                                                    </div>
                                                    <p className='wearerAge'>{selectedWearer.WearerRoom}</p>
                                                </div>
                                                <BarChart
                                                    activity={selectedWearer.Activity}
                                                    calmness={selectedWearer.Calmness}
                                                    mobility={selectedWearer.Mobility}
                                                />
                                                <div className='device_data'>
                                                    <p className='wearerWifi'>
                                                        {selectedWearer.Wifi === "Connected" ? (
                                                            <RiWifiLine className="card_iconRow" />
                                                        ) : (
                                                            <RiWifiOffLine className="card_iconRow_dis" />
                                                        )}
                                                        {selectedWearer.Wifi}
                                                    </p>
                                                    <p className='wearerBattery'>
                                                        <GiBattery100
                                                            className={
                                                                selectedWearer.Battery === "0%"
                                                                    ? "card_iconRow_dis"
                                                                    : "card_iconRow"
                                                            }
                                                        /> {selectedWearer.Battery}</p>
                                                    <p className='wearerDeviceStatus'>
                                                        <div className={
                                                            selectedWearer?.DeviceStatus === "Online"
                                                                ? "statusDotOnline"
                                                                : "statusDotOffline"
                                                        }></div>
                                                        {selectedWearer?.DeviceStatus}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>No wearer found.</div>
                                    )}
                                    <div className='successCard'>
                                        <h3 className='successCard_titel'>connected items details</h3>
                                        <div className='successCardData'>
                                            <p className='socksId'>
                                                Sock ID : {selectedWearer?.socksDataSet?.MainSockID || 'N/A'}
                                                <p className='wearerDeviceStatus'>
                                                    <div className={
                                                        selectedWearer?.DeviceStatus === "Online"
                                                            ? "statusDotOnline"
                                                            : "statusDotOffline"
                                                    }></div>
                                                    {selectedWearer?.DeviceStatus}
                                                </p>
                                            </p>
                                            <p className='socksNames'>Available Socks</p>
                                            <div className='socksIdData'>
                                                {(selectedWearer?.socksDataSet?.SubSocks
                                                    ? selectedWearer.socksDataSet.SubSocks.split(',').map((sockId) => (
                                                        <p className='socksId' key={sockId.trim()}>
                                                            Sock ID : {sockId.trim()}
                                                            <p className='wearerDeviceStatus'>
                                                                <div className={
                                                                    selectedWearer?.DeviceStatus === "Online"
                                                                        ? "statusDotOffline"
                                                                        : "statusDotOnline"
                                                                }></div>
                                                                Offline
                                                            </p>
                                                        </p>
                                                    ))
                                                    : <p>No additional socks</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='subContinerCard'>
                            <div className='cardheader'>
                                <h2 className='titel'>alerts</h2>
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
                            </div>
                            <div className='alerts-table-container'>
                                <table className='alerts-table'>
                                    <thead className='alerts-table-header'>
                                        <tr>
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
                                                        <span className='table-truncated-text'>{truncateText(alert.Behavior)}</span>
                                                        {alert.Behavior && alert.Behavior.split(' ').length > 3 && (
                                                            <button
                                                                className='see-more-btn'
                                                                onClick={(e) => handleSeeMoreClick(e, 'Behavior', alert.Behavior)}
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
                                                        <span className='table-truncated-text'>{truncateText(alert.trigger)}</span>
                                                        {alert.trigger && alert.trigger.split(' ').length > 3 && (
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
                                                        <span className='table-truncated-text'>{truncateText(alert.Support)}</span>
                                                        {alert.Support && alert.Support.split(' ').length > 3 && (
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

export default WearerAlearts