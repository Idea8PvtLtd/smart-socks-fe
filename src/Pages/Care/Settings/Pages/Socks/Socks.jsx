import React, { useMemo, useState } from 'react';
import '../../setting.css';
import NavBar from '../../../../../Components/NavBar/NavBar';
import SideBar from '../../../../../Components/SideBar/SideBar';
import { MdEdit, MdDelete } from 'react-icons/md';
import socksFile from '../../../../../Jsons/DbJson/SocksAssign.json';
import AddSocksModel from './Components/AddSocks';
import EditSocks from './Components/EditSocks';
import DeleteSocks from './Components/DeleteSocks';
import { IoSearchOutline } from 'react-icons/io5';

function Socks() {
  // ------- Source data (from JSON) -> local state so we can add/edit/delete in UI -------
  const initialSocksObj = socksFile?.SocksAssign ?? {};
  // Normalize to array of rows we can mutate locally
  const normalize = (obj) =>
    Object.entries(obj).map(([key, s]) => ({
      id: key, // keep the JSON key as stable id (e.g., "socks7")
      wearerName: s?.wearerName ?? '-',
      SerialNumber: s?.SerialNumber ?? '-',
      ConnectionStrength: s?.ConnectionStrength ?? '-',
      BatteryLevel: s?.BatteryLevel ?? '-',
      batteryStatus: s?.batteryStatus ?? '-',
    }));

  const [rows, setRows] = useState(() => normalize(initialSocksObj));

  // ------- Search -------
  const [query, setQuery] = useState('');
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.wearerName.toLowerCase().includes(q) ||
        r.SerialNumber.toLowerCase().includes(q) ||
        r.batteryStatus.toLowerCase().includes(q)
    );
  }, [rows, query]);

  // ------- Add Modal -------
  const [showAddModal, setShowAddModal] = useState(false);
  const openAdd = () => setShowAddModal(true);
  const closeAdd = () => setShowAddModal(false);
  const handleAddSave = () => {
    closeAdd();
  };

  // ------- Edit Modal -------
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState(null);

  const openEdit = (id) => {
    const r = rows.find((x) => String(x.id) === String(id));
    if (!r) return;
    setEditValue({
      ...r,
      FullName: r.wearerName, // for modal compatibility
      SockSerialNumber: r.SerialNumber, // for modal compatibility
    });
    setShowEditModal(true);
  };
  const closeEdit = () => {
    setShowEditModal(false);
    setEditValue(null);
  };
  const handleEditSave = () => {
    closeEdit();
  };

  // ------- Delete Modal -------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const openDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const closeDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };
  const handleDeleteConfirm = () => {
    setRows((prev) => prev.filter((r) => String(r.id) !== String(deleteId)));
    closeDelete();
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
                      className="controls_nav_menu"
                      onClick={() => (window.location.href = '/socks')}
                    >
                      Socks
                    </p>
                  </div>
                  <div className="controls_nav_con">
                    <p
                      className="controls_nav_menu"
                      onClick={() => (window.location.href = '/weares')}
                    >
                      WEARERS
                    </p>
                  </div>
                  <div className="controls_nav_con">
                    <p
                      className="controls_nav_menu"
                      onClick={() => (window.location.href = '/careSetting')}
                    >
                      Care setting
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
                      placeholder="Search Here..."
                      className="search-input"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>

                  <button className="addObservationBtn" onClick={openAdd}>
                    Assign socks
                  </button>
                </div>

                <div className="tblWrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Wearer&apos;s Name</th>
                        <th>Serial Number</th>
                        <th>Connection</th>
                        <th>Battery</th>
                        <th>Status</th>
                        <th className="actionsCol">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', opacity: 0.7 }}>
                            No socks found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map((r) => (
                          <tr key={r.id}>
                            <td>{r.wearerName}</td>
                            <td>{r.SerialNumber}</td>
                            <td>{r.ConnectionStrength}</td>
                            <td>{r.BatteryLevel}</td>
                            <td>{r.batteryStatus}</td>
                            <td className="actionsCol">
                              <button className="iconBtn edit" onClick={() => openEdit(r.id)}>
                                <MdEdit size={18} />
                              </button>
                              <button className="iconBtn delete" onClick={() => openDelete(r.id)}>
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

        {/* Add */}
        <AddSocksModel
          open={showAddModal}
          onClose={closeAdd}
          onSave={handleAddSave}
        />

        {/* Edit */}
        <EditSocks
          open={showEditModal}
          onClose={closeEdit}
          value={editValue}
          onChange={setEditValue}
          onSave={handleEditSave}
        />

        {/* Delete */}
        <DeleteSocks open={showDeleteModal} onClose={closeDelete} onConfirm={handleDeleteConfirm} />
      </div>
    </>
  );
}

export default Socks;
