import React, { useState, useRef, useEffect } from 'react';
import { IoSearchOutline } from "react-icons/io5";
import { IoCheckmark } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import { IoClose } from "react-icons/io5";
import ActivityChartComponent from '../DrillDown/Components/ActivityChart';
import MobilityChartComponent from '../DrillDown/Components/MobilityChart';
import CalmnessChartComponent from '../DrillDown/Components/CalmnessChart';
import ActivityChartAllComponents from '../DrillDown/Pages/Components/ActivityChartComponents';
import MobilityChartAllComponents from '../DrillDown/Pages/Components/MobilityChartComponents';
import CalmnessChartAllComponents from '../DrillDown/Pages/Components/CalmnessChartComponents';
import NavBar from '../../../Components/NavBar/NavBar';
import SideBar from '../../../Components/SideBar/SideBar';
import wearersData from '../../../Jsons/DbJson/Wearers.json';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './ReportPreview.css'

function ReportPreview() {
    const reportContentRef = useRef(null);
    const activityChartsRef = useRef(null);
    const calmnessChartsRef = useRef(null);
    const mobilityChartsRef = useRef(null);

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

    // Custom Multi-Select Dropdown Component
    const MultiSelectDropdown = ({ wearers, selectedWearers, setSelectedWearers }) => {
        const [isOpen, setIsOpen] = useState(false);
        const [searchTerm, setSearchTerm] = useState('');
        const dropdownRef = useRef(null);
        const MAX_SELECTED = 3;

        // Filter wearers based on search term
        const filteredWearers = wearers.filter(wearer =>
            wearer.FullName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Handle clicking outside to close dropdown
        useEffect(() => {
            const handleClickOutside = (event) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setIsOpen(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        // Toggle wearer selection
        const toggleWearer = (wearer) => {
            setSelectedWearers(prev => {
                const isSelected = prev.some(w => w.id === wearer.id);
                if (isSelected) {
                    return prev.filter(w => w.id !== wearer.id);
                } else {
                    if (prev.length >= MAX_SELECTED) return prev; // Prevent adding more than max
                    return [...prev, wearer];
                }
            });
        };


        // Clear all selections
        const clearAll = () => {
            setSelectedWearers([]);
        };

        return (
            <div className="custom-dropdown" ref={dropdownRef}>
                <div className="dropdown-trigger" onClick={() => setIsOpen(!isOpen)}>
                    <div className="selected-items">
                        <div className="selected-tags">
                            {selectedWearers.length > 0 ? (
                                <span className="placeholder">
                                    {selectedWearers.length} {selectedWearers.length === 1 ? "Wearer Selected" : "Wearers Selected"}
                                </span>
                            ) : (
                                <span className="placeholder">Select Wearers</span>
                            )}
                        </div>
                    </div>
                    <IoChevronDown className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`} />
                </div>

                {isOpen && (
                    <div className="dropdown-menu">
                        <div className="search-container">
                            <IoSearchOutline className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search Here..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        {selectedWearers.length > 0 && (
                            <div className="dropdown-actions">
                                <button className="clear-all-btn" onClick={clearAll}>
                                    Clear All ({selectedWearers.length})
                                </button>
                            </div>
                        )}

                        {selectedWearers.length >= MAX_SELECTED && (
                            <div className="max-limit-msg" style={{ color: '#C62828', padding: '8px', fontSize: '13px' }}>
                                Maximum {MAX_SELECTED} wearers can be selected.
                            </div>
                        )}

                        <div className="options-list">
                            {filteredWearers.length === 0 ? (
                                <div className="no-results">No wearers found</div>
                            ) : (
                                filteredWearers.map(wearer => {
                                    const isSelected = selectedWearers.some(w => w.id === wearer.id);
                                    return (
                                        <div
                                            key={wearer.id}
                                            className={`option-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleWearer(wearer)}
                                        >
                                            <div className="option-content">
                                                <span className="option-text">{wearer.FullName}</span>
                                                {isSelected && <IoCheckmark className="check-icon" />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Chart Components for PDF (hidden in UI but available for PDF capture)
    const PDFChartSections = () => (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px' }}>
            {/* Activity Charts */}
            <div ref={activityChartsRef} className='fullChartCont activityChartpng' >
               <ActivityChartAllComponents/>
            </div>

            {/* Calmness Charts */}
            <div ref={calmnessChartsRef} className='fullChartCont calmnessChartpng'>
               <CalmnessChartAllComponents/>
            </div>

            {/* Mobility Charts */}
            <div ref={mobilityChartsRef} className='fullChartCont mobilityChartpng'>
                <MobilityChartAllComponents/>
            </div>
        </div>
    );

    // Get all wearers as array
    const wearers = Array.isArray(wearersData)
        ? wearersData
        : Object.values(wearersData.Wearers || {});

    // State for selected wearers in dropdown
    const [selectedWearers, setSelectedWearers] = useState([]);
    // State for active tab (wearer id)
    const [activeWearerId, setActiveWearerId] = useState(null);
    // State for selected date range
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    // State for generating PDF
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Helper: categories and colors (move from hardcoded if needed)
    const cardCategories = ['Activity', 'Calmness', 'Mobility'];

    // Set active tab to first selected wearer if none is set
    useEffect(() => {
        if (selectedWearers.length > 0 && !activeWearerId) {
            setActiveWearerId(selectedWearers[0].id);
        }
        // If no wearers selected, clear active tab
        if (selectedWearers.length === 0) {
            setActiveWearerId(null);
        }
    }, [selectedWearers, activeWearerId]);

    // Get active wearer object
    const activeWearer = selectedWearers.find(w => w.id === activeWearerId) || null;
    const drillCard = activeWearer?.DrillCard || {};
    const summary = activeWearer?.Summary || {};

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Generate PDF Report for all selected wearers (each gets a PDF)
    const generatePDFReport = async () => {
        if (selectedWearers.length === 0) {
            alert('Please select at least one wearer to generate a report.');
            return;
        }
        if (!startDate || !endDate) {
            alert('Please select a valid date range.');
            return;
        }

        setIsGeneratingPDF(true);
        try {
            for (const wearer of selectedWearers) {
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();
                let currentY = 10;

                // ---------- Helpers ----------
                const addHeading = (text, y = currentY, align = 'left') => {
                    pdf.setFont('helvetica', 'bold');
                    pdf.setFontSize(16);
                    if (align === 'center') {
                        pdf.text(text, pageWidth / 2, y, { align: 'center' });
                    } else {
                        pdf.text(text, 20, y);
                    }
                    return y + 10;
                };

                const addSubText = (text, y = currentY, align = 'left') => {
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(12);
                    if (align === 'center') {
                        pdf.text(text, pageWidth / 2, y, { align: 'center' });
                    } else {
                        pdf.text(text, 20, y);
                    }
                    return y + 8;
                };

                const ensureSpace = (blockHeight) => {
                    if (currentY + blockHeight > pageHeight - 20) {
                        pdf.addPage();
                        currentY = 20;
                    }
                };

                const addDomAsImage = async (el, extraTopGap = 6, maxWidth = pageWidth - 40) => {
                    if (!el) return;
                    await new Promise(r => requestAnimationFrame(() => setTimeout(r, 150)));
                    const rect = el.getBoundingClientRect();
                    const canvas = await html2canvas(el, {
                        scale: 2,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        width: Math.ceil(rect.width),
                        height: Math.ceil(rect.height),
                        windowWidth: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
                        windowHeight: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const imgW = maxWidth;
                    const imgH = (canvas.height * imgW) / canvas.width;
                    ensureSpace(imgH + extraTopGap);
                    currentY += extraTopGap;
                    pdf.addImage(imgData, 'PNG', 20, currentY, imgW, imgH);
                    currentY += imgH;
                };

                const toPercentLocal = (val) => `${Math.round(val * 10)}%`;

                // ---------- Title / Header ----------
                pdf.setFont('helvetica', 'bold'); pdf.setFontSize(20);
                pdf.text('Health Monitoring Report', pageWidth / 2, currentY, { align: 'center' });
                currentY += 15;

                pdf.setFont('helvetica', 'normal'); pdf.setFontSize(12);
                pdf.text(
                    `Report Date Range: ${formatDate(startDate)} - ${formatDate(endDate)}`,
                    pageWidth / 2,
                    currentY,
                    { align: 'center' }
                );
                currentY += 20;

                pdf.setFont('helvetica', 'bold'); pdf.setFontSize(16);
                pdf.text(`${wearer.FullName} - Health Report`, 20, currentY);
                currentY += 12;

                pdf.setFont('helvetica', 'normal'); pdf.setFontSize(12);
                pdf.text(
                    `Report Period: ${formatDate(startDate)} - ${formatDate(endDate)}`,
                    20,
                    currentY
                );
                currentY += 12;

                // ---------- Summary Cards ----------
                pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14);
                pdf.text('Health Metrics Summary', 20, currentY);
                currentY += 8;

                const cardWidth = (pageWidth - 40) / 3;
                let cardX = 20;
                const rowHeight = 25;

                cardCategories.forEach(cat => {
                    const card = wearer?.DrillCard?.[cat];
                    if (!card) return;
                    pdf.setDrawColor('#cccccc');
                    pdf.rect(cardX, currentY, cardWidth - 5, rowHeight);

                    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
                    pdf.text(`${cat} Average`, cardX + 3, currentY + 8);

                    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(14);
                    pdf.text(toPercentLocal(card.value), cardX + 3, currentY + 15);

                    cardX += cardWidth;
                });
                currentY += rowHeight + 10;

                // ---------- Activity Summary numbers ----------
                pdf.setFont('helvetica', 'bold'); pdf.setFontSize(14);
                pdf.text('Activity Summary', 20, currentY);
                currentY += 8;

                pdf.setFont('helvetica', 'normal'); pdf.setFontSize(12);
                currentY = addSubText('Total Steps: 4,522', currentY);
                currentY = addSubText('Total Stands: 50', currentY);
                currentY = addSubText('Total Turns: 45', currentY);
                currentY = addSubText('Wearing Time: 45 Hour', currentY);
                currentY += 6;

                // ---------- Optional: capture the small 3 charts row ----------
                const smallCharts = document.querySelector('.chartCardContiner');
                if (smallCharts) {
                    await addDomAsImage(smallCharts, 4);
                    currentY += 6;
                }

                // ---------- Activity Charts Page ----------
                pdf.addPage();
                currentY = 10;
                currentY = addHeading('Activity Charts', currentY, 'center');
                if (activityChartsRef.current) {
                    await addDomAsImage(activityChartsRef.current, 10);
                }

                // ---------- Calmness Charts Page ----------
                pdf.addPage();
                currentY = 10;
                currentY = addHeading('Calmness Charts', currentY, 'center');
                if (calmnessChartsRef.current) {
                    await addDomAsImage(calmnessChartsRef.current, 10);
                }

                // ---------- Mobility Charts Page ----------
                pdf.addPage();
                currentY = 10;
                currentY = addHeading('Mobility Charts', currentY, 'center');
                if (mobilityChartsRef.current) {
                    await addDomAsImage(mobilityChartsRef.current, 10);
                }

                // ---------- Save ----------
                const wearerName = wearer.FullName.replace(/\s+/g, '_');
                const dateStr = `${formatDate(startDate).replace(/[\s,]/g, '_')}_${formatDate(endDate).replace(/[\s,]/g, '_')}`;
                const filename = `Health_Report_${wearerName}_${dateStr}.pdf`;
                pdf.save(filename);
            }
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('Error generating PDF report. Please try again.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <>
            <NavBar />
            <SideBar />
            <div className='dashone'>
                <div className='dashcon'>
                    <div className='continercard'>
                        <div className='subContinerCard'>
                            <div className='cardheader'>
                                <div className='hed_leftAro'>
                                    <h2 className='titel'>Reports</h2>
                                </div>
                                <div className='controls'>
                                    <MultiSelectDropdown
                                        wearers={wearers}
                                        selectedWearers={selectedWearers}
                                        setSelectedWearers={setSelectedWearers}
                                    />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <DatePicker
                                            selectsRange
                                            startDate={startDate}
                                            endDate={endDate}
                                            onChange={(update) => setDateRange(update)}
                                            isClearable={true}
                                            placeholderText="Select date range"
                                            dateFormat="yyyy-MM-dd"
                                            className="dateRangePicker"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hidden PDF Chart Sections */}
                        <PDFChartSections />

                        <div className='reportPrevCont' ref={reportContentRef}>
                            {selectedWearers.length === 0 ? (
                                // Show message when no wearers are selected
                                <div className='reportPrevSelectWearer'>
                                    <div className='reportPrevNotSelectWearerItem'>
                                        <p>No wearer selected</p>
                                    </div>
                                </div>
                            ) : (
                                <div className='reportPrevContentBox'>
                                    {/* Wearer tabs */}
                                    <div className='reportPrevSelectWearer'>
                                        <button
                                            className='reportPreviewBtn'
                                            onClick={generatePDFReport}
                                            disabled={isGeneratingPDF}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                opacity: isGeneratingPDF ? 0.6 : 1,
                                                cursor: isGeneratingPDF ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isGeneratingPDF ? 'Generating Report...' : 'Generate PDF Report'}
                                        </button>
                                        {selectedWearers.map(wearer => {
                                            const isActive = wearer.id === activeWearerId;
                                            return (
                                                <div
                                                    key={wearer.id}
                                                    className={isActive ? 'reportPrevSelectWearerItem' : 'reportPrevNotSelectWearerItem'}
                                                    onClick={() => {
                                                        if (!isActive) setActiveWearerId(wearer.id);
                                                    }}
                                                >
                                                    <p>{wearer.FullName}</p>
                                                    <IoClose
                                                        className="reportPrevSelectWearerItemremove"
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setSelectedWearers(prev => prev.filter(w => w.id !== wearer.id));
                                                            if (isActive) {
                                                                const remainingWearers = selectedWearers.filter(w => w.id !== wearer.id);
                                                                setActiveWearerId(remainingWearers.length > 0 ? remainingWearers[0].id : null);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Report cards and charts */}
                                    <div className='reportCardSelect'>
                                        <div className='summryBoxSet'>
                                            {activeWearer ? (
                                                cardCategories.map(cat => {
                                                    const card = drillCard[cat];
                                                    if (!card) return null;
                                                    // Remove confidence wording
                                                    return (
                                                        <div
                                                            className='summryBox'
                                                            key={cat}
                                                            style={{ border: `1px solid #cccccc` }}
                                                        >
                                                            <p className='summryBoxTitle'>{cat}</p>
                                                            <p className='summryBoxCount'>{(card.value)}/10</p>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className='summryBox'>
                                                    <p className='summryBoxTitle'>Select a wearer to view DrillCard</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className='chartCardContiner'>
                                            <div className='chartCardRowsub'>
                                                <div className='chartCardDrill'>
                                                    <div className='chartCardHed'>
                                                        <p className='chartCardtitle'>Activity</p>
                                                    </div>
                                                    <div className='chartBx'>
                                                        <ActivityChartComponent
                                                            data={initialData}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='chartCardDrill'>
                                                    <div className='chartCardHed'>
                                                        <p className='chartCardtitle'>Calmness</p>
                                                    </div>
                                                    <div className='chartBx'>
                                                        <CalmnessChartComponent
                                                            data={initialData}
                                                        />
                                                    </div>
                                                </div>
                                                <div className='chartCardDrill'>
                                                    <div className='chartCardHed'>
                                                        <p className='chartCardtitle'>Mobility</p>
                                                    </div>
                                                    <div className='chartBx'>
                                                        <MobilityChartComponent
                                                            data={initialData}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='reportChartBox'>
                                            <div className='reportChartBoxrightCont'>
                                                <p className='reportChartBoxrightContTit'>Total Steps</p>
                                                <p className='reportChartBoxrightContCount'>4,522</p>
                                            </div>
                                            <div className='reportChartBoxrightCont'>
                                                <p className='reportChartBoxrightContTit'>Total Stands</p>
                                                <p className='reportChartBoxrightContCount'>50</p>
                                            </div>
                                            <div className='reportChartBoxrightCont'>
                                                <p className='reportChartBoxrightContTit'>Total Turns</p>
                                                <p className='reportChartBoxrightContCount'>45</p>

                                            </div>
                                            <div className='reportChartBoxrightCont'>
                                                <p className='reportChartBoxrightContTit'>Wearing time</p>
                                                <p className='reportChartBoxrightContCount'>45 Hour</p>

                                            </div>
                                        </div>

                                    </div>

                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}

export default ReportPreview