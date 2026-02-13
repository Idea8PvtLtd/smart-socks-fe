import RealtimeChartPush from './RealtimeChartPush';

const calmnessChartPush = new RealtimeChartPush({
  metric: 'CalmnessMainChart',
  maxPoints: 10000,
});

export default calmnessChartPush;
