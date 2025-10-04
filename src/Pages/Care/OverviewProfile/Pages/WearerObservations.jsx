import React, { useState } from 'react'
import AddObservationsModel from '../../../Care/Observations/AddObservationsModel';
import NavBar from '../../../../Components/NavBar/NavBar'
import SideBar from '../../../../Components/SideBar/SideBar'
import wearersData from '../../../../Jsons/DbJson/Wearers.json';
import alertsData from '../../../../Jsons/DbJson/Alerts.json';
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";
import { GiBattery100 } from "react-icons/gi";
import { MdDateRange } from "react-icons/md";
import { IoTimeOutline, IoClose } from "react-icons/io5";
import { FaArrowLeftLong } from "react-icons/fa6";
import BarChart from '../Components/BarChart'

function WearerObservations() {
    const [showAddObsModal, setShowAddObsModal] = useState(false);
    const [observationInput, setObservationInput] = useState("");
    const [seeMoreData, setSeeMoreData] = useState({ title: '', content: '', isOpen: false });

    const handleOpenAddObsModal = () => setShowAddObsModal(true);
    const handleCloseAddObsModal = () => setShowAddObsModal(false);
    const handleObsInputChange = (e) => setObservationInput(e.target.value);
    const handleSaveObservation = () => {
        // TODO: Save logic here
        setShowAddObsModal(false);
        setObservationInput("");
    };

    // See More Modal logic
    const handleSeeMoreClick = (e, title, content) => {
        e.stopPropagation();
        setSeeMoreData({ title, content, isOpen: true });
    };
    const handleSeeMoreClose = () => {
        setSeeMoreData({ title: '', content: '', isOpen: false });
    };

    // Truncate text helper
    const truncateText = (text, wordLimit = 2) => {
        if (!text) return '';
        const words = text.split(' ');
        return words.length > wordLimit ? words.slice(0, wordLimit).join(' ') : text;
    };

    // See More Modal component
    const SeeMoreModal = ({ title, content, isOpen, onClose }) => {
        if (!isOpen) return null;
        return (
            <div className="see-more-modal-overlay" onClick={onClose}>
                <div className="see-more-modal-container" onClick={e => e.stopPropagation()}>
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

    // Filter alerts for selected wearer only
    const filteredAlerts = alerts.filter(
        alert => String(alert.wearerID) === String(selectedWearerId)
    );
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
                                    <h2 className='titel'>WEARER Notes</h2>
                                </div>
                                <div className='controls_nav'>
                                    <div className='controls_nav_con '>
                                        <p className='controls_nav_menu' onClick={() => (window.location.href = '/overviewProfile')}>Wearer profile</p>
                                    </div>
                                    <div className='controls_nav_con controls_nav_con_active'>
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
                                                            selectedWearer.DeviceStatus === "Online"
                                                                ? "statusDotOnline"
                                                                : "statusDotOffline"
                                                        }></div>
                                                        {selectedWearer.DeviceStatus}</p>
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
                                                        selectedWearer.DeviceStatus === "Online"
                                                            ? "statusDotOnline"
                                                            : "statusDotOffline"
                                                    }></div>
                                                    {selectedWearer.DeviceStatus}
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
                                                                    selectedWearer.DeviceStatus === "Online"
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
                                <h2 className='titel'>Notes</h2>
                                <button className='addObservationBtn' onClick={handleOpenAddObsModal}>Add Notes</button>
                            </div>
                            {/* Replace .obs_card mapping with table */}
                            <div className='alerts-table-container'>
                                <table className='alerts-table'>
                                    <thead className='alerts-table-header'>
                                        <tr>
                                            <th className='table-header-cell'>Date & Time</th>
                                            <th className='table-header-cell'>Wearer Name</th>
                                            <th className='table-header-cell'>Trigger</th>
                                            <th className='table-header-cell'>Behavior</th>
                                            <th className='table-header-cell'>Support</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAlerts.map((alert) => (
                                            <tr key={alert.id} className="table-row">
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
                                                <td className='table-cell table-wearer-name'>{alert.FullName}</td>
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
                                                        <span className='table-truncated-text'>{truncateText(alert.Behavior)}..</span>
                                                        {alert.Behavior && alert.Behavior.split(' ').length > 2 && (
                                                            <button
                                                                className='see-more-btn'
                                                                onClick={(e) => handleSeeMoreClick(e, 'Behavior', alert.Behavior)}
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <AddObservationsModel
                open={showAddObsModal}
                onClose={handleCloseAddObsModal}
                value={observationInput}
                onChange={handleObsInputChange}
                onSave={handleSaveObservation}
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

export default WearerObservations
