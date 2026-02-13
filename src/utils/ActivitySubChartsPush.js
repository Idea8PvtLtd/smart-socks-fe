import RealtimeChartPush from './RealtimeChartPush';

export const walkingChartPush = new RealtimeChartPush({ metric: 'Walking', maxPoints: 10000 });
export const stepsChartPush = new RealtimeChartPush({ metric: 'Steps', maxPoints: 10000 });
export const boutsChartPush = new RealtimeChartPush({ metric: 'Bouts', maxPoints: 10000 });
export const longestBoutChartPush = new RealtimeChartPush({ metric: 'LongestBout', maxPoints: 10000 });

export default walkingChartPush;
