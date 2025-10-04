import React from 'react'
import './Overview.css'
import NavBar from '../../../Components/NavBar/NavBar'
import { IoSearch } from "react-icons/io5";
import SideBar from '../../../Components/SideBar/SideBar'
import wearersData from '../../../Jsons/DbJson/Wearers.json';
import { RiWifiOffLine, RiWifiLine } from "react-icons/ri";
import { GiBattery100 } from "react-icons/gi";
import AlertDemo from '../../../Components/Alert/AlertDemo'
import BarChart from '../OverviewProfile/Components/BarChart';

function Overview() {
    const wearers = Object.values(wearersData.Wearers);
    const [selectedFloor, setSelectedFloor] = React.useState(''); // changed from 'All Floor' to ''
    const [searchTerm, setSearchTerm] = React.useState('');
    const [showAlert, setShowAlert] = React.useState(false);

    const handleCardClick = (wearerId) => {
        const wearer = wearers.find(w => w.id === wearerId);
        // if (wearer && wearer.Wifi !== "Connected") {
        //     setShowAlert(true);
        //     return;
        // }
        localStorage.setItem('selectedWearerId', wearerId);
        window.location.href = '/overviewProfile';
    };

    const filterWearers = (wearers, floor, search) => {
        let filtered = floor === '' ? wearers : wearers.filter(w => w.floor === floor); // changed from 'All Floor' to ''
        if (search.trim() !== '') {
            filtered = filtered.filter(w => w.FullName.toLowerCase().includes(search.toLowerCase()));
        }
        return filtered;
    };
    const filteredWearers = filterWearers(wearers, selectedFloor, searchTerm);
    return (
        <div >
            <NavBar />
            <SideBar />

            <div className='Alert'>
                {showAlert && (
                    <AlertDemo
                        type="error"
                        title="This wearer is not connected"
                        message="Cannot get data. This wearer is not connected."
                        onClose={() => setShowAlert(false)}
                    />
                )}
            </div>
            <div className='dashone'>
                <div className='dashcon'>
                    <div className='continercard'>
                        <div className='cardheader'>
                            <h2 className='titel'>Overview</h2>
                            <div className='controls'>
                                <select className='select_drop' value={selectedFloor} onChange={e => setSelectedFloor(e.target.value)}>
                                    <option value="">All Areas</option>
                                    <option>Ground Floor</option>
                                    <option>First Floor</option>
                                    <option>Dementia Wing</option>
                                </select>
                                <div className='searchBox'>
                                    <input
                                        type='text'
                                        className='searchInput'
                                        placeholder='Search Here..'
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <IoSearch className='searchIcon' />
                                </div>
                            </div>
                        </div>
                        <div className='statusSet'>
                            <div className='statusCard'>
                                <div className='high'></div>
                                <p className='statusCardText'>High</p>
                            </div>
                            <div className='statusCard'>
                                <div className='Medium'></div>
                                <p className='statusCardText'>Medium</p>
                            </div>
                            <div className='statusCard'>
                                <div className='Low'></div>
                                <p className='statusCardText'>Low</p>
                            </div>
                        </div>
                        <div className='dataCardSet'>
                            {filteredWearers.length === 0 ? (
                                <div className='noDataFound'>No wearers found</div>
                            ) : (
                                filteredWearers.map((wearer) => (
                                    <div className={`dataCard ${wearer.WearerStatus === "High" ? "dataCardBorder" : ""
                                        }`}
                                        key={wearer.id}
                                        onClick={() => handleCardClick(wearer.id)}>
                                        <img src={`${wearer.ProfileImage}`} alt={wearer.FullName} className='wearerImage' />
                                        <div className='card_data'>
                                            <div className='flx_row_card'>
                                                <div className='namedatarwo'>
                                                    <p className={`wearerName ${wearer.WearerStatus === "High" ? "wearerNameHigh" : ""}`}
                                                    >
                                                        {wearer.FullName}</p>
                                                    <p className='wearerAreaa'>{wearer.floor}</p>
                                                </div>
                                                <p className='wearerAge'>{wearer.WearerRoom}</p>
                                            </div>
                                            <BarChart
                                                activity={wearer.Activity}
                                                calmness={wearer.Calmness}
                                                mobility={wearer.Mobility}
                                            />

                                            <div className='device_data'>
                                                <p className='wearerWifi'>
                                                    {wearer.Wifi === "Connected" ? (
                                                        <RiWifiLine className="card_iconRow" />
                                                    ) : (
                                                        <RiWifiOffLine className="card_iconRow_dis" />
                                                    )}
                                                    {wearer.Wifi}
                                                </p>

                                                <p className='wearerBattery'>
                                                    <GiBattery100
                                                        className={
                                                            wearer.Battery === "0%"
                                                                ? "card_iconRow_dis"
                                                                : "card_iconRow"
                                                        }
                                                    /> {wearer.Battery}</p>
                                                <p className='wearerDeviceStatus'>
                                                    <div className={
                                                        wearer.DeviceStatus === "Online"
                                                            ? "statusDotOnline"
                                                            : "statusDotOffline"
                                                    }></div>
                                                    {wearer.DeviceStatus}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Overview
