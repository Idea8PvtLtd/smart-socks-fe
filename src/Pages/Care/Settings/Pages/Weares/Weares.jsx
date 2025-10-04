import React, { useState } from 'react'
import '../../setting.css'
import NavBar from '../../../../../Components/NavBar/NavBar';
import SideBar from '../../../../../Components/SideBar/SideBar';
import { MdEdit, MdDelete } from "react-icons/md";
import wearersData from '../../../../../Jsons/DbJson/Wearers.json';
import AddWearesModel from './Components/AddWeares';
import { IoSearchOutline } from "react-icons/io5";
import EditWeares from './Components/EditWeares';
import DeleteWeares from './Components/DeleteWeares';
function Weares() {
  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [observationInput, setObservationInput] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editValue, setEditValue] = useState(null);
  const handleOpenAddObsModal = () => setShowAddObsModal(true);
  const handleCloseAddObsModal = () => setShowAddObsModal(false);
  const handleObsInputChange = (e) => setObservationInput(e.target.value);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const handleSaveObservation = () => {
    setShowAddObsModal(false);
    setObservationInput("");
  };
  const wearersObj = wearersData?.Wearers ?? {};
  const tableRows = Object.values(wearersObj)
    .slice(0, 5)
    .map(w => ({
      id: w.id,
      img: w.ProfileImage,
      name: w.FullName,
      BirthDate: w.BirthDate ?? '-',
      floor: w.floor ?? '-'
    }));

  const handleDeleteConfirm = () => {
    console.log('Deleted wearer with id:', deleteId);
  };
  // 3) open/close/save handlers for EDIT modal
  const openEditModal = (id) => {
    const w = Object.values(wearersObj).find(x => String(x.id) === String(id));
    // seed form fields (fallbacks to avoid undefined)
    setEditValue({
      id: w?.id ?? '',
      FullName: w?.FullName ?? '',
      BirthDay: w?.BirthDate ?? '',
      Area: w?.floor ?? '',
      avatarUrl: w?.ProfileImage ?? '',
      KnownTriggers: w?.KnownTriggers ?? '',
      LevelOfNeed: w?.LevelOfNeed ?? '',
      KnownSuccessfulSupport: w?.KnownSuccessfulSupport ?? '',
    });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditValue(null);
  };

  const saveEditModal = () => {
    // TODO: persist to your store / API if needed
    console.log('edited wearer:', editValue);
    setShowEditModal(false);
  };
  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
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
                  <h2 className='titel'>settings</h2>
                </div>
                <div className='controls_nav'>
                  <div className='controls_nav_con '>
                    <p className='controls_nav_menu' onClick={() => (window.location.href = '/socks')}>Socks</p>
                  </div>
                  <div className='controls_nav_con controls_nav_con_active' >
                    <p className='controls_nav_menu' onClick={() => (window.location.href = '/weares')}>WEARERS</p>
                  </div>
                  <div className='controls_nav_con'>
                    <p className='controls_nav_menu' onClick={() => (window.location.href = '/careSetting')}>Care setting</p>
                  </div>
                </div>
              </div>
              <div className='cardbody'>
                <div className='actionLins'>
                  <div className="search-container">
                    <IoSearchOutline className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search Here..."
                      className="search-input"
                    />
                  </div>
                  <button className='addObservationBtn' onClick={handleOpenAddObsModal}>Add WEARERS</button>
                </div>
                <div className="tblWrap">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>Profile Image</th>
                        <th>Full Name</th>
                        <th>Birth Day</th>
                        <th>Area</th>
                        <th className="actionsCol">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map(r => (
                        <tr key={r.id}>
                          <td>
                            <div className="avatarCell">
                              <img src={r.img} alt={r.name} />
                            </div>
                          </td>
                          <td>{r.name}</td>
                          <td>{r.BirthDate}</td>
                          <td>{r.floor}</td>
                          <td className="actionsCol">
                            <button className="iconBtn edit" onClick={() => openEditModal(r.id)}>
                              <MdEdit size={18} />
                            </button>
                            <button className="iconBtn delete" onClick={() => openDeleteModal(r.id)}>
                              <MdDelete size={18} />
                            </button>

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
        <AddWearesModel
          open={showAddObsModal}
          onClose={handleCloseAddObsModal}
          value={observationInput}
          onChange={handleObsInputChange}
          onSave={handleSaveObservation}
        />
        <EditWeares
          open={showEditModal}
          onClose={closeEditModal}
          value={editValue}
          onChange={setEditValue}
          onSave={saveEditModal}
        />
        <DeleteWeares
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      </div>

    </>
  )
}

export default Weares
