import React, { useMemo, useState } from 'react';
import NavBar from '../../../../Components/NavBar/NavBar';
import SideBar from '../../../../Components/SideBar/AdminSideBar';
import { MdEdit, MdDelete } from 'react-icons/md';
import { useLocationsData } from '../../../../Jsons/DbJson/useDbJson';
import AddModel from './Components/AddLocation';
import { IoSearchOutline } from 'react-icons/io5';
import EditModel from './Components/UpdateLocationModel';
import DeleteModel from './Components/DeleteLocationModel';

function Location() {
  const locationsData = useLocationsData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editValue, setEditValue] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const locationsObj = locationsData?.Locations ?? {};

  const rows = useMemo(
    () =>
      Object.entries(locationsObj).map(([key, loc]) => ({
        id: key,
        name: loc?.name ?? '-',
        address: loc?.address ?? '-',
        areas: Array.isArray(loc?.areas) ? loc.areas.join(', ') : '-',
        lastLogin: loc?.lastLogin ?? '-'
      })),
    [locationsObj]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.areas.toLowerCase().includes(q) ||
        r.lastLogin.toLowerCase().includes(q)
    );
  }, [rows, search]);

  // ---- Handlers ----
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => setShowAddModal(false);

  const openEditModal = (rowId) => {
    const r = rows.find((x) => x.id === rowId);
    setEditValue(
      r
        ? {
          id: r.id,
          name: r.name,
          address: r.address,
          areas: locationsObj[r.id]?.areas ?? [],
          lastLogin: r.lastLogin
        }
        : { id: '', name: '', address: '', areas: [], lastLogin: '' }
    );
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditValue(null);
  };
  const saveEditModal = () => {
    console.log('Edited location:', editValue);
    setShowEditModal(false);
  };

  const openDeleteModal = (rowId) => {
    setDeleteId(rowId);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = () => {
    console.log('Deleted location with id:', deleteId);
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
              {/* Header */}
              <div className="cardheader">
                <div className="hed_leftAro">
                  <h2 className="titel">Settings</h2>
                </div>

                <div className="controls_nav">
                  <div className="controls_nav_con">
                    <p
                      className="controls_nav_menu"
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
                      nurses
                    </p>
                  </div>

                  <div className="controls_nav_con controls_nav_con_active">
                    <p
                      className="controls_nav_menu "
                      onClick={() => (window.location.href = '/admin/location')}
                    >
                      LOCATION
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="cardbody">
                <div className="actionLins">
                  <div className="search-container">
                    <IoSearchOutline className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search locations..."
                      className="search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <button className="addObservationBtn" onClick={openAddModal}>
                    Add Location
                  </button>
                </div>

                <div className="tblWrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Areas</th>
                        <th>Last Login</th>
                        <th className="actionsCol">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>
                            No locations found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>{r.address}</td>
                            <td>{r.areas}</td>
                            <td>{r.lastLogin}</td>
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
              {/* /Body */}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddModel open={showAddModal} onClose={closeAddModal} />
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

export default Location;
