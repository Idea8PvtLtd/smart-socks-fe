import React, { useEffect, useState } from 'react';
import './nav.css';
import { FaRegUserCircle } from "react-icons/fa";
import { FaBell } from "react-icons/fa6";
import wearersData from '../../Jsons/DbJson/Wearers.json';
import Notification from '../../Pages/Care/Notification/Notification';
import { FaRegBell } from "react-icons/fa6";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";
import SideBar from '../SideBar/SideBar'; // Import sidebar

function NavBar() {
  const [wearerName, setWearerName] = useState('');
  const [wearerFloor, setWearerFloor] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1500);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const selectedId = localStorage.getItem('selectedWearerId');
    if (!selectedId) return;

    try {
      const wearers = wearersData?.Wearers ?? {};
      const wearer = Object.values(wearers).find(
        (w) => String(w?.id) === String(selectedId)
      );
      if (wearer) {
        if (wearer.FullName) setWearerName(wearer.FullName);
        if (wearer.floor !== undefined) setWearerFloor(wearer.floor);
      } else {
        setWearerName('Unknown wearer');
        setWearerFloor('Unknown floor');
      }
    } catch (err) {
      console.error('Failed to read wearers JSON', err);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1500);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='navBar_container'>
      <div className='navBar_logo'>

        {!["/overview", "/alert", "/reportPreview", "/settings", "/socks", "/weares", "/careSetting", "/admin/carers", "/admin/location", "/admin/socks", "/overview/", "/alert/", "/reportPreview/", "/settings/", "/socks/", "/weares/", "/careSetting/", "/admin/carers/", "/admin/location/", "/admin/socks/"].includes(window.location.pathname) && (
          <div className='nav_wearerInfo'>
            <p className='nav_bar_wearerData'>
              {wearerName}
            </p>
            <p className='areaa'>
              {wearerFloor}
            </p>
          </div>
        )}
        {showNotifications ? (
          <FaBell className='nav_icon' onClick={() => setShowNotifications(false)} />
        ) : (
          <FaRegBell className='nav_icon' onClick={() => setShowNotifications(true)} />
        )}
        {/* <FaRegUserCircle className='nav_icon' /> */}
        {isMobile && (
          <span
            className='nav_burger_icon'
            onClick={() => setSidebarOpen((prev) => !prev)}
            style={{ cursor: 'pointer', marginRight: 16 }}
          >
            {sidebarOpen ? (
              <GiHamburgerMenu size={28} />
            ) : (
              <GiHamburgerMenu size={28} />
            )}
          </span>
        )}
      </div>

      {/* Notification Modal */}
      {showNotifications && (
        <div className="modalOverlay">
          <div className="modalContent">
            <Notification onClose={() => setShowNotifications(false)} />
          </div>
        </div>
      )}

      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div className="sidebarOverlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebarDrawer" onClick={e => e.stopPropagation()}>
            <SideBar onClose={() => setSidebarOpen(false)} mobile />
          </div>
        </div>
      )}
    </div>
  );
}

export default NavBar;
