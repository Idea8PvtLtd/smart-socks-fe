import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

const ReportChartComponents = props => {
    const {
        data = {},
        activeWearer,
        colors: {
            backgroundColor = 'white',
            textColor = 'black',
            activityColor = '#2E7D32',
            calmnessColor = '#1976D2',
            mobilityColor = '#F57C00',
        } = {},
        timeScale = { visible: true }
    } = props;

    const chartContainerRef = useRef();

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;

        // Create chart using the exact same pattern as your working code
        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
                attributionLogo: false,
            },
            width: container.clientWidth || 600,
            // height: 400,
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
            timeScale: {
                rightOffset: 12,
                barSpacing: 3,
                fixLeftEdge: false,
                fixRightEdge: false,
                lockVisibleTimeRangeOnResize: true,
                borderVisible: false,
                borderColor: '#fff000',
                visible: true,
                timeVisible: true,
                secondsVisible: false,
            },
            handleScroll: {
                mouseWheel: true,
                pressedMouseMove: true,
                horzTouchDrag: true,
                vertTouchDrag: true,
            },
            handleScale: {
                mouseWheel: true,
                pinch: true,
                axisPressedMouseMove: {
                    time: true,
                    price: true,
                },
                axisDoubleClickReset: {
                    time: true,
                    price: true,
                },
            }
        });

        // Sample data for demonstration - replace with your actual data structure
        const generateSampleData = () => {
            const baseData = {
                activity: [],
                calmness: [],
                mobility: []
            };

            const startDate = new Date('2024-01-01');

            for (let i = 0; i < 30; i++) {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const timeString = date.toISOString().split('T')[0];

                baseData.activity.push({
                    time: timeString,
                    value: 60 + Math.random() * 40    // Random values between 60-100
                });

                baseData.calmness.push({
                    time: timeString,
                    value: 50 + Math.random() * 50    // Random values between 50-100
                });

                baseData.mobility.push({
                    time: timeString,
                    value: 40 + Math.random() * 60    // Random values between 40-100
                });
            }
            return baseData;
        };

        // Get data
        let chartData;
        if (activeWearer && activeWearer.timeSeriesData) {
            chartData = activeWearer.timeSeriesData;
        } else {
            chartData = generateSampleData();
        }

        // Create Activity series using the exact same method as your original working code
        const activitySeries = chart.addSeries(AreaSeries, {
            lineColor: activityColor,
            topColor: 'transparent',
            bottomColor: 'transparent',
            priceScaleId: 'left',
            priceLineVisible: false,
            lastValueVisible: false,
        });
        activitySeries.setData(chartData.activity);

        // Create Calmness series
        const calmnessSeries = chart.addSeries(AreaSeries, {
            lineColor: calmnessColor,
            topColor: 'transparent',
            bottomColor: 'transparent',
            priceScaleId: 'left',
            priceLineVisible: false,
            lastValueVisible: false,
        });
        calmnessSeries.setData(chartData.calmness);

        // Create Mobility series
        const mobilitySeries = chart.addSeries(AreaSeries, {
            lineColor: mobilityColor,
            topColor: 'transparent',
            bottomColor: 'transparent',
            priceScaleId: 'left',
            priceLineVisible: false,
            lastValueVisible: false,
        });
        mobilitySeries.setData(chartData.mobility);

        // Fit content
        chart.timeScale().fitContent();

        // Handle resize
        const handleResize = () => {
            if (chart && container) {
                chart.applyOptions({ width: container.clientWidth || 600 });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chart) {
                chart.remove();
            }
        };
    }, [data, activeWearer, backgroundColor, textColor, activityColor, calmnessColor, mobilityColor, timeScale.visible]);

    return (
        <div style={{
            width: '100%', position: 'relative', height: '100%',
            border: '1px solid #e1e1e1',
            padding: '15px',
            borderRadius: '8px',

        }}>


            {/* Chart Container */}
            <div
                ref={chartContainerRef}
                style={{
                    width: '100%',
                    height: '98%',
                    borderRadius: '8px',
                    backgroundColor: 'white'
                }}
            />
            {/* Chart Legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'start',
                gap: '20px',
                fontSize: '14px',
                fontWeight: '500'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                        width: '16px',
                        height: '3px',
                        backgroundColor: '#2E7D32',
                        borderRadius: '2px'
                    }}></div>
                    <span>Activity</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                        width: '16px',
                        height: '3px',
                        backgroundColor: '#1976D2',
                        borderRadius: '2px'
                    }}></div>
                    <span>Calmness</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{
                        width: '16px',
                        height: '3px',
                        backgroundColor: '#F57C00',
                        borderRadius: '2px'
                    }}></div>
                    <span>Mobility</span>
                </div>
            </div>
        </div>
    );
};

export default ReportChartComponents;