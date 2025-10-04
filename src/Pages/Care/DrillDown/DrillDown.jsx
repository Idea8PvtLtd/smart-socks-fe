import React, { useEffect, useState } from 'react';
import './DrillDown.css';
import NavBar from '../../../Components/NavBar/NavBar';
import SideBar from '../../../Components/SideBar/SideBar';
import wearersData from '../../../Jsons/DbJson/Wearers.json';
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
  }, []);

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
                <select className='compareCardSelect'>
                  <option>Today</option>
                  <option>Last 7 days</option>
                  <option>Last 14 days</option>
                  <option>Last 30 days</option>
                </select>
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
                        data={[
                          { time: '2018-12-18', value: 25.46 },
                          { time: '2018-12-19', value: 23.92 },
                          { time: '2018-12-20', value: 22.68 },
                          { time: '2018-12-21', value: 22.67 },
                          { time: '2018-12-22', value: 32.51 },
                          { time: '2018-12-23', value: 31.11 },
                          { time: '2018-12-24', value: 27.02 },
                          { time: '2018-12-25', value: 27.32 },
                          { time: '2018-12-26', value: 25.17 },
                          { time: '2018-12-27', value: 28.89 },
                          { time: '2018-12-28', value: 25.46 },
                          { time: '2018-12-29', value: 23.92 },
                          { time: '2018-12-30', value: 22.68 },
                          { time: '2018-12-31', value: 22.67 },
                        ]}
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
                        data={[
                          { time: '2018-12-18', value: 25.46 },
                          { time: '2018-12-19', value: 23.92 },
                          { time: '2018-12-20', value: 22.68 },
                          { time: '2018-12-21', value: 22.67 },
                          { time: '2018-12-22', value: 32.51 },
                          { time: '2018-12-23', value: 31.11 },
                          { time: '2018-12-24', value: 27.02 },
                          { time: '2018-12-25', value: 27.32 },
                          { time: '2018-12-26', value: 25.17 },
                          { time: '2018-12-27', value: 28.89 },
                          { time: '2018-12-28', value: 25.46 },
                          { time: '2018-12-29', value: 23.92 },
                          { time: '2018-12-30', value: 22.68 },
                          { time: '2018-12-31', value: 22.67 },
                        ]}
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
                        data={[
                          { time: '2018-12-18', value: 25.46 },
                          { time: '2018-12-19', value: 23.92 },
                          { time: '2018-12-20', value: 22.68 },
                          { time: '2018-12-21', value: 22.67 },
                          { time: '2018-12-22', value: 32.51 },
                          { time: '2018-12-23', value: 31.11 },
                          { time: '2018-12-24', value: 27.02 },
                          { time: '2018-12-25', value: 27.32 },
                          { time: '2018-12-26', value: 25.17 },
                          { time: '2018-12-27', value: 28.89 },
                          { time: '2018-12-28', value: 25.46 },
                          { time: '2018-12-29', value: 23.92 },
                          { time: '2018-12-30', value: 22.68 },
                          { time: '2018-12-31', value: 22.67 },
                        ]}
                      />
                    </div>
                  </div>
                </div>
                {/* <div className='chartCardDrill'>
                <p className='chartCardtitle'>Wearer Statistics </p>
                <div className='chartCardbody'>
                  <div className='chartCardbodyData'>
                    <p className='chartCardbodyDataTit'>How long have you been wearing it?</p>
                    <p className='chartCardbodyDataans'>5 Hours</p>
                  </div>
                  <div className='chartCardbodyData'>
                    <p className='chartCardbodyDataTit'>How long have you been Not wearing it?</p>
                    <p className='chartCardbodyDataans'>8 Hours</p>
                  </div>
                </div>
              </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DrillDown;
