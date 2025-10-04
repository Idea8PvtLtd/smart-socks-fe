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

export function App(props) {
    return (
        <CalmnessChart {...props}></CalmnessChart>
    );
}

export default CalmnessChart;