import { Button } from "components/ui";
import React, { useState, useEffect, useRef } from "react";
import api from "../../lib/axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import html2canvas from 'html2canvas';

export default function StatisticsColumn() {
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [passesData, setPassesData] = useState([]);
  const [showTollDropdown, setShowTollDropdown] = useState(false);
  const [tollNames, setTollNames] = useState([]);
  const [tollStationsData, setTollStationsData] = useState([]);
  const [selectedTollName, setSelectedTollName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRangeText, setDateRangeText] = useState('Select Time Period');
  const [operatorFromStorage, setOperatorFromStorage] = useState(false);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);

  // Add operator names mapping
  const operatorNames = {
    'AM': 'Aegean Motorway',
    'EG': 'Egnatia',
    'GE': 'Gefyra',
    'KO': 'Kentriki Odos',
    'MO': 'Moreas',
    'NAO': 'Nea Attiki Odos',
    'NO': 'Nea Odos',
    'OO': 'Olympia Odos'
  };

  // Modify the useEffect that gets operator_id
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const operatorId = userData?.data?.operator_id;
    if (operatorId) {
      setSelectedRegion(operatorId);
      setOperatorFromStorage(true);
      // Fetch toll names for the operator's region
      fetchTollNames(operatorId);
    } else {
      setOperatorFromStorage(false);
    }
  }, []);

  const fetchTollNames = async (region) => {
    try {
      const url = `/extra/useCaseTwo/${region}`;
      console.log('Fetching toll names for region:', url);
      
      const response = await api.get(url);
      console.log('Toll Names Response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const tollStations = response.data.data;
        setTollStationsData(tollStations);
        
        // Filter stations for the selected region
        const regionStations = tollStations.filter(station => 
          station.toll_id.startsWith(region)
        );

        const names = regionStations.map(station => station.toll_name);
        console.log('Extracted toll names:', names);
        
        setTollNames(names);
      } else {
        setTollNames([]);
        setTollStationsData([]);
      }
    } catch (error) {
      console.error('Error fetching toll names:', error);
      setTollNames([]);
      setTollStationsData([]);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  };

  const fetchData = async () => {
    try {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      
      const url = `/tollStationPasses/${selectedStation}/${formattedStartDate}/${formattedEndDate}`;
      console.log('Fetching data from:', url);
      
      const response = await api.get(url);
      console.log('API Response:', response.data);
      
      if (!response.data || !response.data.passList) {
        console.log('No data received from API');
        alert('No data found for the selected period');
        return;
      }

      // Group passes by date and count them
      const passesPerDay = response.data.passList.reduce((acc, pass) => {
        const date = pass.timestamp.split(' ')[0];
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date]++;
        return acc;
      }, {});

      // Convert to array format for the chart
      const formattedData = Object.entries(passesPerDay).map(([date, count]) => ({
        date: date,
        passes: count
      }));

      // Sort by date
      formattedData.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      console.log('Formatted data:', formattedData);
      setPassesData(formattedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert(`Error fetching data: ${error.message}`);
    }
  };

  const chartRef = useRef(null);

  const handleDownload = async () => {
    if (!chartRef.current || passesData.length === 0) {
      alert('No chart data to download');
      return;
    }

    try {
      // Create canvas from the chart div
      const canvas = await html2canvas(chartRef.current);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        link.download = `toll-passes-${selectedStation}-${date}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Failed to download chart');
    }
  };

  // Add a useEffect to watch for changes in selectedStation and dateRangeText
  useEffect(() => {
    if (selectedStation && dateRangeText !== 'Select Time Period') {
      fetchData();
    }
  }, [selectedStation, dateRangeText]);

  // Modify the toll station selection handler
  const handleTollSelect = (tollName) => {
    const station = tollStationsData.find(s => s.toll_name === tollName);
    if (station) {
      setSelectedStation(station.toll_id);
      setSelectedTollName(tollName);
    }
    setShowTollDropdown(false);
  };

  // Modify the date selection handler
  const handleDatesDone = () => {
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    setDateRangeText(`${formattedStartDate} - ${formattedEndDate}`);
    setShowDatePicker(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        {/* Selection Controls */}
        <div className={`grid ${!operatorFromStorage ? 'grid-cols-3 w-[920px]' : 'grid-cols-2 w-[620px]'} gap-4`}>
          {/* Operator Selection - Only show when operator is not from localStorage */}
          {!operatorFromStorage && (
            <div className="relative">
              <button 
                className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-full h-[48px]"
                onClick={() => setShowOperatorDropdown(!showOperatorDropdown)}
              >
                <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                  {selectedRegion ? operatorNames[selectedRegion] : 'Select Toll Operator'}
                </span>
                <span className="text-xl ml-2">›</span>
              </button>
              
              {showOperatorDropdown && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                  {Object.entries(operatorNames).map(([id, name]) => (
                    <button
                      key={id}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={() => {
                        setSelectedRegion(id);
                        setShowOperatorDropdown(false);
                        // Reset toll station selection
                        setSelectedTollName('');
                        setSelectedStation('');
                        // Reset statistics/chart data
                        setPassesData([]);
                        // Reset date selection
                        setDateRangeText('Select Time Period');
                        // Then fetch new toll names
                        fetchTollNames(id);
                      }}
                    >
                      {name} ({id})
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Toll Names Selection */}
          <div className="relative">
            <button 
              className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-full h-[48px]"
              onClick={() => setShowTollDropdown(!showTollDropdown)}
            >
              <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedTollName || (tollNames.length > 0 ? `Select Toll Station` : `Loading Toll Stations...`)}
              </span>
              <span className="text-xl ml-2">›</span>
            </button>
            
            {showTollDropdown && tollNames.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {tollNames.map((tollName, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 whitespace-normal"
                    onClick={() => handleTollSelect(tollName)}
                  >
                    {tollName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Selection Button */}
          <div className="relative">
            <button 
              className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-full h-[48px]"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {dateRangeText}
              </span>
              <span className="text-xl ml-2">›</span>
            </button>
            
            {showDatePicker && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 p-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From:</label>
                    <DatePicker
                      selected={startDate}
                      onChange={date => setStartDate(date)}
                      className="w-full px-4 py-2 border rounded-lg"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="From date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To:</label>
                    <DatePicker
                      selected={endDate}
                      onChange={date => setEndDate(date)}
                      className="w-full px-4 py-2 border rounded-lg"
                      dateFormat="yyyy-MM-dd"
                      placeholderText="To date"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleDatesDone}
                      className="bg-[#2D7EFF] text-white px-4 py-2 rounded-lg hover:bg-[#2D7EFF]/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Display */}
        <div className="w-[600px] mt-6">
          <div 
            ref={chartRef} 
            className="flex h-[250px] items-center justify-center bg-white rounded-[16px] p-4"
          >
            {passesData.length > 0 ? (
              <BarChart width={550} height={230} data={passesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="passes" fill="#4A4A9A" name="Number of Passes" />
              </BarChart>
            ) : (
              <span className="text-gray-500 text-lg">
                Select parameters to view statistics
              </span>
            )}
          </div>

          {/* Download Button */}
          <div className="flex justify-center mt-4">
            <Button
              shape="round"
              className="bg-[#2D7EFF] text-white px-6 py-2 rounded-full hover:bg-[#2D7EFF]/90 transition-colors"
              onClick={handleDownload}
              disabled={passesData.length === 0}
            >
              Download the chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}