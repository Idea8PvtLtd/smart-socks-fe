import React, { useMemo, useState } from 'react';
import NavBar from '../../../../Components/NavBar/NavBar';
import SideBar from '../../../../Components/SideBar/AdminSideBar';
import { MdEdit, MdDelete } from 'react-icons/md';
import carersData from '../../../../Jsons/DbJson/Carers.json';
import AddModel from './Components/AddCarersModel';
import { IoSearchOutline } from 'react-icons/io5';
import EditModel from './Components/UpdateCarersModel';
import DeleteModel from './Components/DeleteCarersModel';

function Carers() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editValue, setEditValue] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const carersObj = carersData?.Carers ?? {};

  const rows = useMemo(
    () =>
      Object.entries(carersObj).map(([key, c]) => ({
        id: key,
        name: c?.name ?? '-',
        email: c?.email ?? '-',
        lastLogin: c?.lastLogin ?? '-',
        password: c?.password ?? ''
      })),
    [carersObj]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
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
          email: r.email,
          password: r.password,
          lastLogin: r.lastLogin
        }
        : { id: '', name: '', email: '', password: '', lastLogin: '' }
    );
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditValue(null);
  };
  const saveEditModal = () => {
    console.log('Edited carer:', editValue);
    setShowEditModal(false);
  };

  const openDeleteModal = (rowId) => {
    setDeleteId(rowId);
    setShowDeleteModal(true);
  };
  const handleDeleteConfirm = () => {
    console.log('Deleted carer with id:', deleteId);
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
                  <div className="controls_nav_con">
                    <p
                      className="controls_nav_menu"
                      onClick={() => (window.location.href = '/admin/socks')}
                    >
                      Socks
                    </p>
                  </div>

                  <div className="controls_nav_con controls_nav_con_active">
                    <p
                      className="controls_nav_menu"
                      onClick={() => (window.location.href = '/admin/carers')}
                    >
                      nurses
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
                      placeholder="Search nurse..."
                      className="search-input"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <button className="addObservationBtn" onClick={openAddModal}>
                    Add nurse
                  </button>
                </div>

                <div className="tblWrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Last Login</th>
                        <th className="actionsCol">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>
                            No nurse found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.name}</td>
                            <td>{r.email}</td>
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
            </div>
          </div>
        </div>

        {/* Modals */}
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

export default Carers;
