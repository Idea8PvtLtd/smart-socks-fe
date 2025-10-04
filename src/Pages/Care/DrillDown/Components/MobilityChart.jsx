import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import mobilityChartPush from '../../../../utils/MobilityMainChartPush';

const MobilityChart = props => {
    const {
        colors: {
            backgroundColor = 'white',
            lineColor = '#673A8F',
            textColor = 'black',
            areaTopColor = '#673A8F',
            areaBottomColor = 'rgba(103, 58, 143, 0.28)'
        } = {},
    } = props;

    const [chartData, setChartData] = useState([]);

    const chartContainerRef = useRef();
    const chartRef = useRef(); // Add chart ref

    useEffect(() => {
        const handleDataUpdate = (newData) => {
            setChartData(newData);
        };

        mobilityChartPush.addListener(handleDataUpdate);
        mobilityChartPush.startLiveUpdates();

        const currentData = mobilityChartPush.getCurrentData();
        if (currentData.length > 0) {
            setChartData(currentData);
        }

        return () => {
            mobilityChartPush.removeListener(handleDataUpdate);
            mobilityChartPush.stopLiveUpdates();
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
        <MobilityChart {...props}></MobilityChart>
    );
}

export default MobilityChart;