import React, { useState } from 'react'
import './notification.css'
import NavBar from '../../../Components/NavBar/NavBar'
import SideBar from '../../../Components/SideBar/SideBar'
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdOutlineDateRange } from "react-icons/md";
import { LuClock } from "react-icons/lu";
import { IoClose } from "react-icons/io5";
import { LuNotebookPen } from "react-icons/lu";
import notificationData from '../../../Jsons/DbJson/Notification.json';
import NotesSection from './Components/AddNoteNotificationsModel';

function Notification({ onClose }) {
    // Get notifications as array
    const notifications = Object.values(notificationData.notification);

    // Split notifications into unread and read
    const unreadNotifications = notifications.filter(noty => noty.isRead === "false");
    const readNotifications = notifications.filter(noty => noty.isRead === "true");

    // Combine: unread first, then read
    const sortedNotifications = [...unreadNotifications, ...readNotifications];

    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedWearerId, setSelectedWearerId] = useState(null);

    return (
        <>
            <NavBar />
            <SideBar />
            <div className='notificationContainer'>
                <div className='notificationCard'>
                    <div className='notificationCardHead'>
                        <p className='notificationCardHeadTit'>Notifications</p>
                        <IoClose className='notificationCardHeadIcon' onClick={onClose} />
                    </div>
                    <div className='notybody'>
                        {sortedNotifications.map((noty) => {
                            const isUnread = noty.isRead === "false";
                            return (
                                <div
                                    key={noty.id}
                                    className={`notificationCardItem${isUnread ? ' notificationCardItemNoRead' : ''}`}
                                >
                                    <p className='notificationCardTitle'>{noty.title}</p>
                                    <p className='wnamee'>{noty.wearerName}</p>
                                    <div className='notyActionCard'>
                                        <div className='notyTimeCard'>
                                            <p className='notyTime'><LuClock /> {noty.time}</p>
                                            <p className='notyDate'><MdOutlineDateRange /> {noty.date}</p>
                                        </div>
                                        <div className='notyactionCardBtn'>
                                            <IoCheckmarkDoneOutline className={`markReadTick${isUnread ? ' NotReadTick' : ''}`} />
                                            <RiDeleteBinLine className='notyDlt' />
                                            <LuNotebookPen
                                                className='addnoteicon'
                                                onClick={() => {
                                                    setSelectedWearerId(noty.wearerID);
                                                    setShowNotesModal(true);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className='notificationCardFoot'>
                        <p className='notificationCardfootTit'>Mark As all read</p>
                        <p className='notificationCardfootTit'>Delete All Notifications</p>
                    </div>
                </div>
                {showNotesModal && (
                    <NotesSection
                        wearerId={selectedWearerId}
                        onClose={() => setShowNotesModal(false)}
                    />
                )}
            </div>
        </>
    )
}

export default Notification