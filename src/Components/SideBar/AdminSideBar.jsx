import React, { useState } from 'react';
import { IoSettingsOutline } from "react-icons/io5";
import { TbLogout2 } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router-dom";
import LogOut from '../LogOut/LogOutAdmin';

function AdminSideBar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const menuItems = [
        {
            path: "/admin/socks",
            icon: <IoSettingsOutline className="side_bar_icon" />,
            label: "Settings",
            activePaths: ["/admin/socks", "/admin/location", "/admin/carers","/admin/socks/", "/admin/location/", "/admin/carers/"]
        },
    ];

    return (
        <div className='sideBar_container'>
            <div className='sideBar_cont'>
                <img src="/milbotix.png" alt="sidelogo" className='sidebarLogo' />

                <div className='sideBar_menu_Items'>
                    {menuItems.map((item) => (
                        <div
                            key={item.path}
                            className={`sideBar_menu_item_box ${item.activePaths
                                ? item.activePaths.includes(location.pathname) ? "active" : ""
                                : location.pathname === item.path ? "active" : ""
                                }`}
                            onClick={() => navigate(item.path)}
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
                    onClick={() => setLogoutOpen(true)}
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

export default AdminSideBar;
