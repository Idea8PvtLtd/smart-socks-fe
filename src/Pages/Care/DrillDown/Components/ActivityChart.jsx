import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import activityChartPush from '../../../../utils/ActivityMainChartPush';

const ActivityChart = props => {
    const {
        colors: {
            backgroundColor = 'white',
            lineColor = '#F59E0B',
            textColor = 'black',
            areaTopColor = '#F59E0B',
            areaBottomColor = 'rgba(245, 158, 11, 0.28)',
        } = {},
    } = props;

    const [chartData, setChartData] = useState([]);

       const chartContainerRef = useRef();
    const chartRef = useRef(); // Add chart ref

    useEffect(() => {
        const handleDataUpdate = (newData) => {
            setChartData(newData);
        };

        activityChartPush.addListener(handleDataUpdate);
        activityChartPush.startLiveUpdates();

        const currentData = activityChartPush.getCurrentData();
        if (currentData.length > 0) {
            setChartData(currentData);
        }

        return () => {
            activityChartPush.removeListener(handleDataUpdate);
            activityChartPush.stopLiveUpdates();
        };
    }, []);

    useEffect(
        () => {
            const container = chartContainerRef.current;
            if (!container) return;

            // Create chart and store in ref
            chartRef.current = createChart(container, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor,
                    attributionLogo: false,
                },
                width: container.clientWidth || 300,
                height: 200,
                leftPriceScale: {
                    visible: true,
                    position: 'left',
                    borderColor: '#cccccc',
                },
                rightPriceScale: {
                    visible: false,
                },
                watermark: {
                    visible: false,
                },
                priceLineVisible: false,
                lastValueVisible: false,
            });
            chartRef.current.timeScale().fitContent();

            const newSeries = chartRef.current.addSeries(AreaSeries, {
                lineColor,
                topColor: areaTopColor,
                bottomColor: areaBottomColor,
                priceScaleId: 'left',
                priceLineVisible: false,
                lastValueVisible: false,
            });
            newSeries.setData(chartData);

            const handleResize = () => {
                if (chartRef.current && container) {
                    chartRef.current.applyOptions({ width: container.clientWidth || 300 });
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (chartRef.current) {
                    chartRef.current.remove();
                    chartRef.current = null;
                }
            };
        },
        [chartData, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    );

    return (
        <div
            ref={chartContainerRef}
            style={{ width: '100%', height: 'auto' }}
        />
    );
};

export function App(props) {
    return (
        <ActivityChart {...props}></ActivityChart>
    );
}

export default ActivityChart;