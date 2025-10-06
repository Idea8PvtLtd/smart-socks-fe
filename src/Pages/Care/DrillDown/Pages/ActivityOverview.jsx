import React, { useState } from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
import NavBar from '../../../../Components/NavBar/NavBar';
import SideBar from '../../../../Components/SideBar/SideBar';
import AddObservationsModel from '../../../Care/Observations/AddObservationsModel';
import CalmnessChartComponent from '../Components/CalmnessChart';
import MobilityChartComponent from '../Components/MobilityChart';
import ActivityChartComponents from './Components/ActivityChartComponents';

function ActivityOverview() {

  const [showAddObsModal, setShowAddObsModal] = useState(false);
  const [observationInput, setObservationInput] = useState("");

  const handleOpenAddObsModal = () => setShowAddObsModal(true);
  const handleCloseAddObsModal = () => setShowAddObsModal(false);
  const handleObsInputChange = (e) => setObservationInput(e.target.value);

  const handleSaveObservation = () => {
    setShowAddObsModal(false);
    setObservationInput("");
  };
  return (
    <div>
      <NavBar />
      <SideBar />
      <div className='dashone'>
        <div className='dashcon'>
          <div className='continercard'>
            <div className='cardheader'>
              <div className='hed_leftAro'>
                <FaArrowLeftLong className='arrow_line' onClick={() => (window.location.href = '/drillDown')} />
                <h2 className='titel'>Activity overview</h2>
              </div>
              <div className='controls'>
                <button className='addObservationBtn' onClick={handleOpenAddObsModal}>Add Note</button>
              </div>
            </div>
            <div className='cardbodyDrill'>
              <div className='fullChartCont'>
                <ActivityChartComponents />
              </div>
              <div className='hed_leftAro'>
                <h4 className='titel'>Other chart</h4>
              </div>
              <div className='chartCardContiner'>
                <div className='chartCardDrill2'>
                  <div className='chartCardHed'>
                    <p className='chartCardtitle'>Mobility</p>
                    <p className='chartCardlink' onClick={() => (window.location.href = '/mobilityOverview')}>view full charts</p>
                  </div>
                  <div className='chartBx'>
                    <MobilityChartComponent
                    />
                  </div>
                </div>
                <div className='chartCardDrill2'>
                  <div className='chartCardHed'>
                    <p className='chartCardtitle'>Calmness</p>
                    <p className='chartCardlink' onClick={() => (window.location.href = '/calmnessOverview')}>view full charts</p>
                  </div>
                  <div className='chartBx'>
                    <CalmnessChartComponent
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AddObservationsModel
        open={showAddObsModal}
        onClose={handleCloseAddObsModal}
        value={observationInput}
        onChange={handleObsInputChange}
        onSave={handleSaveObservation}
      />
    </div>
  )
}

export default ActivityOverview
