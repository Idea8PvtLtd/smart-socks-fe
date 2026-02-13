import React, { useEffect, useState } from 'react';
import './DrillDown.css';
import NavBar from '../../../Components/NavBar/NavBar';
import SideBar from '../../../Components/SideBar/SideBar';
import { useWearersData } from '../../../Jsons/DbJson/useDbJson';
import ActivityChartComponent from './Components/ActivityChart';
import MobilityChartComponent from './Components/MobilityChart';
import CalmnessChartComponent from './Components/CalmnessChart';
function getBarColor(confidence) {
  switch (confidence) {
    case 'High':
      return '#f44336';
    case 'Medium':
      return '#ff9800';
    case 'Low':
      return '#4caf50';
    default:
      return '#bdbdbd';
  }
}

function DrillDown() {
  const wearersData = useWearersData();
  const [wearerName, setWearerName] = useState('');
  const [drillCard, setDrillCard] = useState(null);

  useEffect(() => {
    const selectedId = localStorage.getItem('selectedWearerId');
    if (!selectedId) return;

    try {
      const wearers = wearersData?.Wearers ?? {};
      const wearer = Object.values(wearers).find(
        (w) => String(w?.id) === String(selectedId)
      );
      if (wearer?.FullName) {
        setWearerName(wearer.FullName);
        setDrillCard(wearer.DrillCard);
      } else {
        setWearerName('Unknown wearer');
        setDrillCard(null);
      }
    } catch (err) {
      console.error('Failed to read wearers JSON', err);
      setDrillCard(null);
    }
  }, [wearersData]);

  return (
    <>
      <NavBar />
      <SideBar />
      <div className='dashone'>
        <div className='dashcon'>
          <div className='continercard'>
            <div className='cardheader'>
              <h2 className='titel'>{wearerName}</h2>
              <div className='controls'>
              </div>
            </div>
            <div className='cardbodyDrill2'>
              <div className='card_cat_set'>
                {drillCard && (
                  <>
                    <div className='cardCMA'>
                      <p className='cardCMA_Title'>Calmness</p>
                      <div className='count_card'>
                        <p className='count_prasant'>{drillCard.Calmness.value}</p>
                        <p className='count_prasant_sub'>/ 10</p>
                      </div>
                      <div
                        className='barRow_Card'
                        style={{
                          width: '100%',
                          background: '#eee',
                          height: '12px',
                          borderRadius: '12px',
                          margin: '8px 0',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${(parseFloat(drillCard.Calmness.value) / 10) * 100}%`,
                            background: getBarColor(drillCard.Calmness.Confidence),
                            height: '100%',
                            borderRadius: '12px',
                            transition: 'width 0.5s'
                          }}
                        ></div>
                      </div>
                      <p className='ConfidenceTxt'>Risk: {drillCard.Calmness.Confidence}</p>
                    </div>
                    <div className='cardCMA'>
                      <p className='cardCMA_Title'>Mobility</p>
                      <div className='count_card'>
                        <p className='count_prasant'>{drillCard.Mobility.value}</p>
                        <p className='count_prasant_sub'>/ 10</p>
                      </div>
                      <div
                        className='barRow_Card'
                        style={{
                          width: '100%',
                          background: '#eee',
                          height: '12px',
                          borderRadius: '12px',
                          margin: '8px 0',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${(parseFloat(drillCard.Mobility.value) / 10) * 100}%`,
                            background: getBarColor(drillCard.Mobility.Confidence),
                            height: '100%',
                            borderRadius: '12px',
                            transition: 'width 0.5s'
                          }}
                        ></div>
                      </div>
                      <p className='ConfidenceTxt'>Risk: {drillCard.Mobility.Confidence}</p>
                    </div>
                    <div className='cardCMA'>
                      <p className='cardCMA_Title'>Activity</p>
                      <div className='count_card'>
                        <p className='count_prasant'>{drillCard.Activity.value}</p>
                        <p className='count_prasant_sub'>/ 10</p>
                      </div>
                      <div
                        className='barRow_Card'
                        style={{
                          width: '100%',
                          background: '#eee',
                          height: '12px',
                          borderRadius: '12px',
                          margin: '8px 0',
                          position: 'relative'
                        }}
                      >
                        <div
                          style={{
                            width: `${(parseFloat(drillCard.Activity.value) / 10) * 100}%`,
                            background: getBarColor(drillCard.Activity.Confidence),
                            height: '100%',
                            borderRadius: '12px',
                            transition: 'width 0.5s'
                          }}
                        ></div>
                      </div>
                      <p className='ConfidenceTxt'>Risk: {drillCard.Activity.Confidence}</p>
                    </div>
                  </>
                )}
              </div>
              <div className='chartCardContiner'>
                <div className='chartCardRowsub'>
                  <div className='chartCardDrill'>
                    <div className='chartCardHed'>
                      <p className='chartCardtitle'>Calmness</p>
                      <p className='chartCardlink' onClick={() => (window.location.href = '/calmnessOverview')}>view full charts</p>
                    </div>
                    <div className='chartBx'>
                      <CalmnessChartComponent
                      />
                    </div>
                  </div>
                  <div className='chartCardDrill'>
                    <div className='chartCardHed'>
                      <p className='chartCardtitle'>Mobility</p>
                      <p className='chartCardlink' onClick={() => (window.location.href = '/mobilityOverview')}>view full charts</p>
                    </div>
                    <div className='chartBx'>
                      <MobilityChartComponent
                        
                      />
                    </div>
                  </div>
                  <div className='chartCardDrill'>
                    <div className='chartCardHed'>
                      <p className='chartCardtitle'>Activity</p>
                      <p className='chartCardlink' onClick={() => (window.location.href = '/activityOverview')}>view full charts</p>
                    </div>
                    <div className='chartBx'>
                      <ActivityChartComponent
                       
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DrillDown;
