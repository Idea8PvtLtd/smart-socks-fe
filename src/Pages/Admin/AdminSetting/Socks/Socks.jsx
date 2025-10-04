import React, { useMemo, useState } from 'react';
import NavBar from '../../../../Components/NavBar/NavBar';
import SideBar from '../../../../Components/SideBar/AdminSideBar';
import { MdEdit, MdDelete } from 'react-icons/md';
import socksData from '../../../../Jsons/DbJson/Socks.json';
import AddModel from './Components/AddSocksModel';
import { IoSearchOutline } from 'react-icons/io5';
import EditModel from './Components/UpdateSocksModel';
import DeleteModel from './Components/DeleteSocksModel';

function Socks() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editValue, setEditValue] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const socksObj = socksData?.Socks ?? {};

  const rows = useMemo(() => {
    return Object.entries(socksObj).map(([key, sock]) => {
      const s = sock || {};
      return {
        rawKey: key,
        id: s.id ?? key,
        SerialNumber: s.SerialNumber ?? '-',
        CarerName: s.CarerName ?? '-',
        ConnectionStrength: s.ConnectionStrength ?? '-',
        BatteryLevel: s.BatteryLevel ?? '-',
        BatteryStatus: s.BatteryStatus ?? '-',
      };
    });
  }, [socksObj]);

  const filteredRows = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    if (!q) return rows;
    const safe = (v) => (v ?? '').toString().toLowerCase();
    return rows.filter(
      (r) =>
        safe(r.SerialNumber).includes(q) ||
        safe(r.CarerName).includes(q) ||
        safe(r.ConnectionStrength).includes(q) ||
        safe(r.BatteryLevel).includes(q) ||
        safe(r.BatteryStatus).includes(q)
    );
  }, [rows, search]);

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const openEditModal = (rowId) => {
    const r = rows.find((x) => String(x.id) === String(rowId));
    const value = r
      ? {
        id: r.id,
        SerialNumber: r.SerialNumber,
        CarerName: r.CarerName,
        ConnectionStrength: r.ConnectionStrength,
        BatteryLevel: r.BatteryLevel,
        BatteryStatus: r.BatteryStatus,
      }
      : {
        id: '',
        SerialNumber: '',
        CarerName: '',
        ConnectionStrength: '',
        BatteryLevel: '',
        BatteryStatus: '',
      };

    setEditValue(value);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditValue(null);
  };

  const saveEditModal = () => {
    console.log('Edited sock:', editValue);
    setShowEditModal(false);
  };

  const openDeleteModal = (rowId) => {
    setDeleteId(rowId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Deleted sock with id:', deleteId);
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <>
      <NavBar />
      <SideBar />
      <div className="dashone">
        <div className="dashcon">
          <div className="continercard">
            <div className="subContinerCard">
              <div className="cardheader">
                <div className="hed_leftAro">
                  <h2 className="titel">Settings</h2>
                </div>

                <div className="controls_nav">
                  <div className="controls_nav_con controls_nav_con_active">
                    <p
                      className="controls_nav_menu "
                      onClick={() => (window.location.href = '/admin/socks')}
                    >
                      Socks
                    </p>
                  </div>

                  <div className="controls_nav_con ">
                    <p
                      className="controls_nav_menu"
                      onClick={() => (window.location.href = '/admin/carers')}
                    >
                      nurse
                    </p>
                  </div>

                  <div className="controls_nav_con ">
                    <p
                      className="controls_nav_menu "
                      onClick={() => (window.location.href = '/admin/location')}
                    >
                      LOCATION
                    </p>
                  </div>
                </div>
              </div>

              <div className="cardbody">
                <div className="actionLins">
                  <div className="search-container">
                    <IoSearchOutline className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search socks..."
                      className="search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button className="addObservationBtn" onClick={openAddModal}>
                    Add Sock
                  </button>
                </div>

                <div className="tblWrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Serial Number</th>
                        <th>nurse</th>
                        <th>Connection</th>
                        <th>Battery</th>
                        <th>Status</th>
                        <th className="actionsCol">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>
                            No socks found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.SerialNumber}</td>
                            <td>{r.CarerName}</td>
                            <td>{r.ConnectionStrength}</td>
                            <td>{r.BatteryLevel}</td>
                            <td>{r.BatteryStatus}</td>
                            <td className="actionsCol">
                              <button className="iconBtn edit" onClick={() => openEditModal(r.id)}>
                                <MdEdit size={18} />
                              </button>
                              <button
                                className="iconBtn delete"
                                onClick={() => openDeleteModal(r.id)}
                              >
                                <MdDelete size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AddModel
          open={showAddModal}
          onClose={closeAddModal}
        />
        <EditModel
          open={showEditModal}
          onClose={closeEditModal}
          value={editValue}
          onChange={setEditValue}
          onSave={saveEditModal}
        />
        <DeleteModel
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </>
  );
}

export default Socks;
