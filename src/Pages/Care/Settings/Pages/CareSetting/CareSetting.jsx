import React, { useState } from 'react'
import '../../setting.css'
import NavBar from '../../../../../Components/NavBar/NavBar';
import SideBar from '../../../../../Components/SideBar/SideBar';
import { RiAddBoxFill } from "react-icons/ri";
import { RiDeleteBinLine } from "react-icons/ri";
import './care.css'
function CareSetting() {
  const initialCareHomeName = "Milbotix QA";
  const initialAreas = [
    "First Floor",
    "Ground Floor",
    "Dementia Wing"
  ];

  const [careHomeName, setCareHomeName] = useState(initialCareHomeName);
  const [areas, setAreas] = useState([...initialAreas]);

  // Add new empty area
  const handleAddArea = () => {
    setAreas([...areas, ""]);
  };

  // Delete area by index
  const handleDeleteArea = (idx) => {
    setAreas(areas.filter((_, i) => i !== idx));
  };

  // Update area value
  const handleAreaChange = (idx, value) => {
    const newAreas = [...areas];
    newAreas[idx] = value;
    setAreas(newAreas);
  };

  // Check if form is dirty
  const isDirty =
    careHomeName !== initialCareHomeName ||
    areas.length !== initialAreas.length ||
    areas.some((area, idx) => area !== initialAreas[idx]);

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
                  <div className='controls_nav_con' >
                    <p className='controls_nav_menu' onClick={() => (window.location.href = '/weares')}>WEARERS</p>
                  </div>
                  <div className='controls_nav_con controls_nav_con_active'>
                    <p className='controls_nav_menu' onClick={() => (window.location.href = '/careSetting')}>Care setting</p>
                  </div>
                </div>
              </div>

              <div className='cardbody'>
                <div className='careFromBdy'>
                  <form className='addFrom'>
                    <div className='form-group'>
                      <label htmlFor='careHomeName' className='fromLable'>Care Home Name</label>
                      <input
                        type='text'
                        className='fromTextarea'
                        id='careHomeName'
                        name='careHomeName'
                        placeholder='Enter Care Home Name'
                        value={careHomeName}
                        onChange={e => setCareHomeName(e.target.value)}
                      />
                    </div>
                    <div className='form-group'>
                      <div className='labelFlex'>
                        <label htmlFor='Areas' className='fromLable'>Areas</label>
                        <RiAddBoxFill
                          className='plusIcon'
                          style={{ cursor: 'pointer' }}
                          onClick={handleAddArea}
                        />
                      </div>
                      {areas.map((area, idx) => (
                        <div className='careAreaflex' key={idx}>
                          <input
                            type='text'
                            className='fromTextarea'
                            id={`area-${idx}`}
                            name={`area-${idx}`}
                            placeholder='Enter Area'
                            value={area}
                            onChange={e => handleAreaChange(idx, e.target.value)}
                          />
                          <RiDeleteBinLine
                            className='dltIcon'
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDeleteArea(idx)}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="btn_group">
                      <button
                        type="button"
                        className="modal-cls"
                        disabled={!isDirty}
                        style={{
                          background: !isDirty ? "#fff" : undefined,
                          color: !isDirty ? "#594966" : undefined,
                          cursor: !isDirty ? "not-allowed" : "pointer",
                          border: !isDirty ? "1px solid #594966" : undefined
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="modal-save"
                        disabled={!isDirty}
                        style={{
                          background: !isDirty ? "#594966" : undefined,
                          color: !isDirty ? "#fff" : undefined,
                          cursor: !isDirty ? "not-allowed" : "pointer",
                          border: !isDirty ? "1px solid #594966" : undefined
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export default CareSetting
