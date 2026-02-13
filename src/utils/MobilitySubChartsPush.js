import RealtimeChartPush from './RealtimeChartPush';

export const stepTimeVariationChartPush = new RealtimeChartPush({
  metric: 'StepTimeVariation',
  maxPoints: 10000,
});
export const turnsChartPush = new RealtimeChartPush({ metric: 'Turns', maxPoints: 10000 });
export const symmetryProxyChartPush = new RealtimeChartPush({ metric: 'SymmetryProxy', maxPoints: 10000 });
export const cadenceChartPush = new RealtimeChartPush({ metric: 'Cadence', maxPoints: 10000 });

export default stepTimeVariationChartPush;
