import { Button } from "components/ui";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import html2canvas from 'html2canvas';

export default function StatisticsColumn() {
  const [selectedStation, setSelectedStation] = useState('NO01');
  const [selectedRegion, setSelectedRegion] = useState('NO');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [passesData, setPassesData] = useState([]);
  const [showStationDropdown, setShowStationDropdown] = useState(false);
  const [stationNames, setStationNames] = useState({});
  const [tollNames, setTollNames] = useState([]);
  const [showTollDropdown, setShowTollDropdown] = useState(false);
  const [tollStationsData, setTollStationsData] = useState([]);
  const [selectedTollName, setSelectedTollName] = useState('');

  const regions = ['AM', 'EG', 'GE', 'KO', 'MO', 'NAO', 'NO', 'OO'];
  
  // Update stations based on selected region
  const getStationsForRegion = (region) => {
    return [`${region}01`, `${region}02`, `${region}03`, `${region}11`];
  };

  const stations = getStationsForRegion(selectedRegion);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchData = async () => {
    try {
      // Use selectedStation which contains the toll_id from the selected toll name
      const url = `http://localhost:9115/api/tollStationPasses/${selectedStation}/${formatDate(startDate)}/${formatDate(endDate)}`;
      console.log('Fetching data from:', url);
      console.log('Using toll_id:', selectedStation); // Add this for debugging
      
      const response = await axios.get(url);
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

  // Fetch station names from API
  const fetchStationNames = async (region) => {
    try {
      const url = `http://localhost:9115/api/extra/useCaseTwo/${region}`;
      console.log('Fetching station names from:', url);
      
      const response = await axios.get(url);
      console.log('Station Names Response:', response.data);
      
      if (response.data && response.data.length > 0) {
        // Get the first row which contains the toll station names
        const tollNames = response.data[0];
        console.log('Toll Names:', tollNames);

        // Create mapping of station codes to toll names
        const nameMapping = {};
        // Map the first 4 toll names to station codes
        for (let i = 0; i < 4; i++) {
          const stationCode = `${region}${(i + 1).toString().padStart(2, '0')}`;
          if (tollNames[i]) {
            nameMapping[stationCode] = tollNames[i];
          }
        }
        console.log('Name Mapping:', nameMapping);
        setStationNames(nameMapping);
      }
    } catch (error) {
      console.error('Error fetching station names:', error);
      alert(`Error fetching station names: ${error.message}`);
    }
  };

  // Add useEffect to fetch station names when component mounts
  useEffect(() => {
    fetchStationNames(selectedRegion);
  }, []); // Empty dependency array means this runs once when component mounts

  // Modify the handleRegionSelect function
  const handleRegionSelect = async (region) => {
    setSelectedRegion(region);
    setSelectedStation(`${region}01`);
    setShowRegionDropdown(false);
    setSelectedTollName(''); // Reset selected toll name when region changes
    
    // Fetch toll names immediately when region changes
    try {
      const url = `http://localhost:9115/api/extra/useCaseTwo/${region}`;
      console.log('Fetching toll names for new region:', url);
      
      const response = await axios.get(url);
      console.log('Toll Names Response:', response.data);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const tollStations = response.data.data;
        setTollStationsData(tollStations);
        
        // Filter stations for the selected region
        const regionStations = tollStations.filter(station => 
          station.toll_id.startsWith(region)
        );

        // Map to array of names
        const names = regionStations.map(station => station.toll_name);
        console.log('Extracted toll names:', names);
        
        setTollNames(names);
        
        // Update station names mapping
        const nameMapping = {};
        regionStations.forEach(station => {
          nameMapping[station.toll_id] = station.toll_name;
        });
        setStationNames(nameMapping);
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

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        {/* Selection Controls */}
        <div className="flex gap-4 justify-between w-[600px]">
          {/* Region Selection */}
          <div className="relative">
            <button 
              className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-[140px] h-[48px]"
              onClick={() => setShowRegionDropdown(!showRegionDropdown)}
            >
              <span className="text-base font-medium whitespace-nowrap">{selectedRegion}</span>
              <span className="text-xl ml-2">›</span>
            </button>
            
            {showRegionDropdown && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10">
                {regions.map((region) => (
                  <button
                    key={region}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => handleRegionSelect(region)}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toll Names Selection */}
          <div className="relative">
            <button 
              className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-[300px] h-[48px]"
              onClick={() => setShowTollDropdown(!showTollDropdown)}
            >
              <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedTollName || (tollNames.length > 0 ? `Select ${selectedRegion} Toll Station` : `Loading ${selectedRegion} Stations...`)}
              </span>
              <span className="text-xl ml-2">›</span>
            </button>
            
            {showTollDropdown && tollNames.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {tollNames.map((tollName, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 whitespace-normal"
                    onClick={() => {
                      const station = tollStationsData.find(s => s.toll_name === tollName);
                      if (station) {
                        setSelectedStation(station.toll_id); // This sets the toll_id that will be used by fetchData
                        setSelectedTollName(tollName);
                        console.log('Selected toll_id:', station.toll_id); // Add this for debugging
                      }
                      setShowTollDropdown(false);
                    }}
                  >
                    {tollName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="flex flex-col gap-2">
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              className="px-4 py-2 border rounded-lg"
              dateFormat="yyyy-MM-dd"
              placeholderText="From date"
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              className="px-4 py-2 border rounded-lg"
              dateFormat="yyyy-MM-dd"
              placeholderText="To date"
            />
          </div>
        </div>

        {/* Search Button */}
        <Button
          shape="round"
          className="bg-[#2D7EFF] text-white px-6 py-2 rounded-full hover:bg-[#2D7EFF]/90 transition-colors mt-4"
          onClick={fetchData}
        >
          Search
        </Button>

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
                Select parameters and click search to view statistics
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