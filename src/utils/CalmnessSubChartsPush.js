import RealtimeChartPush from './RealtimeChartPush';

export const pulseRateVariabilityChartPush = new RealtimeChartPush({
  metric: 'PulseRateVariability',
  maxPoints: 10000,
});
export const pulseRateChartPush = new RealtimeChartPush({ metric: 'PulseRate', maxPoints: 10000 });
export const skinConductanceChartPush = new RealtimeChartPush({ metric: 'SkinConductance', maxPoints: 10000 });
export const skinTemperatureChartPush = new RealtimeChartPush({ metric: 'SkinTemperature', maxPoints: 10000 });

export default pulseRateVariabilityChartPush;
