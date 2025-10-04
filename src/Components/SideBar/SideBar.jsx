import React, { useState } from 'react';
import './sidebar.css';
import { LuComponent } from "react-icons/lu";
import { AiOutlineBulb } from "react-icons/ai";
import { MdCompare } from "react-icons/md";
import { LuTriangleAlert } from "react-icons/lu";
import { HiOutlineChartBar } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import LogOut from '../LogOut/LogOut'; // Import the LogOut modal
import { GiHamburgerMenu } from "react-icons/gi";
import { IoMdClose } from "react-icons/io";

function SideBar({ mobile, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false); // State to control modal

  const drillCompareAllowed = [
    "/overviewProfile",
    "/wearerAlearts",
    "/wearerObservations",
    "/compare",
    "/drillDown",
    "/calmnessOverview",
    "/mobilityOverview",
    "/activityOverview",
    "/overviewProfile/",
    "/wearerAlearts/",
    "/wearerObservations/",
    "/compare/",
    "/drillDown/",
    "/calmnessOverview/",
    "/mobilityOverview/",
    "/activityOverview/",
  ];

  // helper to check if current path is allowed
  const showDrillCompare = drillCompareAllowed.includes(location.pathname);

  const menuItems = [
    { path: "/alert", icon: <LuTriangleAlert className="side_bar_icon" />, label: "Alert" },
    { path: "/reportPreview", icon: <HiOutlineChartBar className="side_bar_icon" />, label: "Reports" },
    {
      path: "/socks",
      icon: <IoSettingsOutline className="side_bar_icon" />,
      label: "Settings",
      activePaths: ["/socks", "/careSetting", "/weares", "/socks/", "/careSetting/", "/weares/"]
    },
  ];

  // Handle navigation for mobile - close sidebar after navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (mobile && onClose) {
      onClose();
    }
  };

  // Don't render sidebar for desktop when screen is <= 1500px unless it's mobile version
  if (!mobile && window.innerWidth <= 1500) {
    return null;
  }

  return (
    <div className={`sideBar_container${mobile ? ' sideBar_mobile' : ''}`}>
      {/* Close button for mobile */}


      <div className='sideBar_cont'>
        {!mobile && <img src="/milbotix.png" alt="sidelogo" className='sidebarLogo' />}
        {mobile && (
          <div className="sidebar_mobile_header">
            <img src="/milbotix.png" alt="sidelogo" className='sidebarLogo' />
            <IoMdClose
              className="sidebar_close_btn"
              onClick={onClose}
              size={24}
            />
          </div>
        )}
        <div className='sideBar_menu_Items'>
          <div
            className={`sideBar_menu_item_box ${[
              "/overviewProfile",
              "/wearerAlearts",
              "/wearerObservations",
              "/overview",
              "/overviewProfile/",
              "/wearerAlearts/",
              "/wearerObservations/",
              "/overview/"
            ].includes(location.pathname)
              ? "active"
              : ""
              }`}
            onClick={() => handleNavigation("/overview")}
          >
            <LuComponent className="side_bar_icon" />
            <p className='sideBar_menu_item'>Overview</p>
          </div>

          {showDrillCompare && (
            <div className='sideBar_menu_item_divider' >
              <div
                className={`sideBar_menu_item_box ${[
                  "/drillDown",
                  "/calmnessOverview",
                  "/mobilityOverview",
                  "/activityOverview",
                  "/drillDown/",
                  "/calmnessOverview/",
                  "/mobilityOverview/",
                  "/activityOverview/",
                ].includes(location.pathname)
                  ? "active"
                  : ""
                  }`}
                onClick={() => handleNavigation("/drillDown")}
              >
                <AiOutlineBulb className="side_bar_icon" />
                <p className='sideBar_menu_item'>Drill down</p>
              </div>

              <div
                className={`sideBar_menu_item_box ${location.pathname === "/compare" ? "active" : ""}`}
                onClick={() => handleNavigation("/compare")}
              >
                <MdCompare className="side_bar_icon" />
                <p className='sideBar_menu_item'>Compare</p>
              </div>
            </div>
          )}

          {menuItems.map((item) => (
            <div
              key={item.path}
              className={`sideBar_menu_item_box ${item.activePaths
                ? item.activePaths.includes(location.pathname) ? "active" : ""
                : location.pathname === item.path ? "active" : ""
                }`}
              onClick={() => handleNavigation(item.path)}
            >
              {item.icon}
              <p className='sideBar_menu_item'>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='sideBar_cont'>
        <div
          className='sideBar_menu_item_box'
          onClick={() => setLogoutOpen(true)} // Open modal on click
        >
          <TbLogout2 className="side_bar_icon" />
          <p className='sideBar_menu_item'>Log out</p>
        </div>
      </div>
      {logoutOpen && (
        <LogOut onClose={() => setLogoutOpen(false)} />
      )}
    </div>
  );
}

export default SideBar;