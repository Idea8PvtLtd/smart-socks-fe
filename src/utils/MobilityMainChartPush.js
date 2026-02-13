import RealtimeChartPush from './RealtimeChartPush';

const mobilityChartPush = new RealtimeChartPush({
  metric: 'MobilityMainChart',
  maxPoints: 10000,
});

export default mobilityChartPush;
