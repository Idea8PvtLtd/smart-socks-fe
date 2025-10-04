import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import calmnessChartPush from '../../../../utils/CalmnessMainChartPush';

const CalmnessChart = props => {
    const {
        colors: {
            backgroundColor = 'white',
            lineColor = '#44B649',
            textColor = 'black',
            areaTopColor = '#44B649',
            areaBottomColor = 'rgba(68, 182, 73, 0.28)',
        } = {},
    } = props;

    const [chartData, setChartData] = useState([]);

    const chartContainerRef = useRef();
    const chartRef = useRef(); // Add chart ref

    useEffect(() => {
        const handleDataUpdate = (newData) => {
            setChartData(newData);
        };

        calmnessChartPush.addListener(handleDataUpdate);
        calmnessChartPush.startLiveUpdates();

        const currentData = calmnessChartPush.getCurrentData();
        if (currentData.length > 0) {
            setChartData(currentData);
        }

        return () => {
            calmnessChartPush.removeListener(handleDataUpdate);
            calmnessChartPush.stopLiveUpdates();
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

const initialData = [
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
];

export function App(props) {
    return (
        <CalmnessChart {...props}></CalmnessChart>
    );
}

export default CalmnessChart;