import React, { useState } from 'react'
import './Compare.css'
import NavBar from '../../../Components/NavBar/NavBar'
import SideBar from '../../../Components/SideBar/SideBar'
import wearersData from '../../../Jsons/DbJson/Wearers.json'
import CompareChartComponents from './Components/CompareChartComponents'
const cardSets = [
  {
    title: 'Calmness',
    items: [
      { id: 'toggleHeart', text: '✦ Pulse Rate Variability', color: '#000000' },
      { id: 'toggleSkin', text: '✦ Skin Conductance', color: '#44B649' },
      { id: 'togglePulse', text: '✦ Pulse Rate ', color: '#673A8F' },
      { id: 'toggleSkinTemperature', text: '✦ Skin temperature', color: '#F59E0B' },
    ],
  },
  {
    title: 'mobility',
    items: [
      { id: 'toggleCadence', text: '✦ Cadence', color: '#FF00C8' },
      { id: 'toggleSymmetryProxy', text: '✦ Symmetry proxy', color: '#00A661' },
      { id: 'toggleTurns', text: '✦ Turns', color: '#0B3EF5' },
      { id: 'toggleStride', text: '✦ Stride time', color: '#EF4444' },
    ],
  },
  {
    title: 'Activity',
    items: [
      { id: 'toggleSteps', text: '✦ Steps', color: '#24CCFF' },
      { id: 'toggleWalking', text: '✦ Walking', color: '#FF0000' },
      { id: 'toggleBouts', text: '✦ Bouts', color: '#6E9600' },
      { id: 'toggleLongest', text: '✦ Longest bout', color: '#F50B5D' },
    ],
  },
];

function Compare() {
  // put these near your other useState hooks
  const [visible, setVisible] = useState(null);
  const [activeOrder, setActiveOrder] = useState([]);
  const [activeChartName, setActiveChartName] = useState('');

  // Initialize all toggles with proper state - set all to false initially
  const [toggles, setToggles] = useState({
    toggleCadence: false,
    toggleStepTiming: false,
    toggleSymmetryProxy: false,
    toggleTurns: false,
    toggleStride: false,
    toggleHeart: false,
    toggleSkin: false,
    togglePulse: false,
    toggleSkinTemperature: false,
    toggleSteps: false,
    toggleWalking: false,
    toggleBouts: false,
    toggleLongest: false,
  });
  // Handler for toggles
  const handleToggle = (_box, id) => {
    setToggles(t => {
      const turningOn = !t[id];

      // keep 'visible' logic you already have
      if (turningOn) setVisible(id);
      else if (visible === id) setVisible(null);

      // maintain order: ensure uniqueness, append when turning on, remove when off
      setActiveOrder(prev => {
        if (turningOn) {
          return [...prev.filter(x => x !== id), id];
        } else {
          return prev.filter(x => x !== id);
        }
      });

      if (turningOn) {
        // Get chart name from the id (remove 'toggle' prefix)
        const chartName = id.replace('toggle', '');
        setActiveChartName(chartName);
      }

      return { ...t, [id]: turningOn };
    });
  };


  const wearer = wearersData.Wearers.wearer1;
  const drillCard = wearer.DrillCard;


  // Color mapping for confidence levels
  const confidenceColors = {
    High: { border: '#EF4444', bg: '#FCD6D6', color: '#EF4444' },
    Medium: { border: '#F59E0B', bg: '#FDEAC9', color: '#F59E0B' },
    Low: { border: '#44B649', bg: '#D6EFD7', color: '#44B649' },
  };

  // Categories to display
  const cardCategories = ['Calmness', 'Mobility', 'Activity'];
  // Add global period unit selector
  const [periodUnit, setPeriodUnit] = useState('day');
  // Add start date pickers for each chart
  const [prevStart, setPrevStart] = useState('');
  const [liveStart, setLiveStart] = useState('');

  // Helper to get input type for date picker based on unit
  const getInputType = unit => {
    switch (unit) {
      case 'day': return 'date';
      case 'week': return 'week';
      case 'month': return 'month';
      case 'year': return 'number';
      default: return 'date';
    }
  };

  // Add this helper function
  const isAnyToggleActive = () => Object.values(toggles).some(value => value);

  return (
    <>
      <NavBar />
      <SideBar />
      <div className='dashone'>
        <div className='dashcon'>
          <div className='continercard'>
            <div className='cardheader'>
              <h2 className='titel'>COMPARE</h2>
              <select
                className='compareCardSelect'
                value={periodUnit}
                onChange={e => {
                  setPeriodUnit(e.target.value);
                  setPrevStart(''); // Reset start dates when period unit changes
                  setLiveStart('');
                }}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
            <div className='togglecards'>
              {cardSets.map(card => (
                <div className='togglecard' key={card.title}>
                  <p className='togglecardTitle'>{card.title}</p>
                  {card.items.map(item => (
                    <div className='toggleCardItem' key={item.id}>
                      <p className='toggleCardText' style={{ color: item.color }}>{item.text}</p>
                      <div className="toggle-switch">
                        <input
                          className="toggle-input"
                          id={item.id + '_prev'}
                          type="checkbox"
                          checked={!!toggles[item.id]}
                          onChange={() => handleToggle('prev', item.id)}
                        />
                        <label className="toggle-label" htmlFor={item.id + '_prev'}></label>
                        <input
                          className="toggle-input"
                          id={item.id + '_live'}
                          type="checkbox"
                          checked={!!toggles[item.id]}
                          onChange={() => handleToggle('live', item.id)}
                        />
                        <label className="toggle-label" htmlFor={item.id + '_live'}></label>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {isAnyToggleActive() && (
              <div className='compareCards'>
                <div className='compareCard'>
                  <div className='compareCardHeader'>
                    <p className='compareCardHeaderTxt'>Previous {periodUnit.charAt(0).toUpperCase() + periodUnit.slice(1)} Data Analyze Chart</p>
                    <input
                      className='compareCardSelect'
                      type={getInputType(periodUnit)}
                      value={prevStart}
                      onChange={e => setPrevStart(e.target.value)}
                      min={periodUnit === 'year' ? '2000' : undefined}
                      max={periodUnit === 'year' ? '2100' : undefined}
                    />
                  </div>
                  <div className='compareCardBody'>
                    <CompareChartComponents
                      toggles={toggles}
                      chartType="previous_data"
                      chartName={activeChartName}
                      periodUnit={periodUnit}
                      startDate={prevStart} // Pass start date for filtering
                    />
                  </div>
                </div>
                <div className='compareCard'>
                  <div className='compareCardHeader'>
                    <p className='compareCardHeaderTxt'>Live {periodUnit.charAt(0).toUpperCase() + periodUnit.slice(1)} Data Analyze Chart</p>
                    <input
                      className='compareCardSelect'
                      type={getInputType(periodUnit)}
                      value={liveStart}
                      onChange={e => setLiveStart(e.target.value)}
                      min={periodUnit === 'year' ? '2000' : undefined}
                      max={periodUnit === 'year' ? '2100' : undefined}
                    />
                  </div>
                  <div className='compareCardBody'>
                    <CompareChartComponents
                      toggles={toggles}
                      chartType="live_data"
                      chartName={activeChartName}
                      periodUnit={periodUnit}
                      startDate={liveStart} // Pass start date for filtering
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Compare