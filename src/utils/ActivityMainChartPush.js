import RealtimeChartPush from './RealtimeChartPush';

const activityChartPush = new RealtimeChartPush({
  metric: 'ActivityMainChart',
  maxPoints: 10000,
});

export default activityChartPush;
