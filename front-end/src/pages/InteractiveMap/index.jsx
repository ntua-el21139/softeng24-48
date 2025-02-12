import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { GoogleMap, Marker, OverlayView } from '@react-google-maps/api';
import { IoFilterSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

const libraries = ['places', 'marker'];
const MAP_ID = 'AIzaSyBnva_tnIVwDQb-XVBDBvin1AmgiXcImD8';

const mapContainerStyle = {
  width: '1200px',
  height: '500px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  position: 'relative'
};

const center = {
  lat: 38.2,
  lng: 23.5
};

const options = {
  disableDefaultUI: false,
  scrollwheel: true,
  draggable: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: true,
  streetViewControl: true,
  rotateControl: true,
  fullscreenControl: true
};

const InteractiveMap = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [operators, setOperators] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setRoleId(userData.role_id);
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAP_ID}&libraries=${libraries.join(',')}`;
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      setLoadError('Failed to load Google Maps');
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded) return;

    const fetchData = async () => {
      try {
        console.log('Fetching map data...');
        const response = await api.get('/extra/mapSupply');
        const data = response.data;
        
        const markerData = data.data.map(item => ({
          position: {
            lat: parseFloat(item.lat),
            lng: parseFloat(item.longt)
          },
          details: {
            Name: item.toll_name,
            Operator: item.operator_name,
            TollID: item.toll_id,
            Locality: item.locality || 'N/A',
            PM: item.PM || 'N/A',
            Email: item.email,
            Price: item.price
          }
        }));
        
        const uniqueOperators = [...new Set(data.data.map(item => item.operator_name))];
        setOperators(uniqueOperators);
        
        setMarkers(markerData);
        setFilteredMarkers(markerData);
        setMapLoaded(true);
      } catch (err) {
        console.error('Error loading map data:', err);
      }
    };

    fetchData();
  }, [scriptLoaded]);

  const onLoad = useCallback(map => {
    console.log('Map loaded');
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setMapLoaded(false);
  }, []);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const handleCloseClick = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const handleOperatorFilter = useCallback((operator, checked) => {
    setSelectedOperators(prev => {
      const newSelection = new Set(prev);
      if (checked) {
        newSelection.add(operator);
      } else {
        newSelection.delete(operator);
      }
      return newSelection;
    });
  }, []);

  useEffect(() => {
    if (selectedOperators.size === 0) {
      setFilteredMarkers(markers);
    } else {
      const filtered = markers.filter(marker => 
        selectedOperators.has(marker.details.Operator)
      );
      setFilteredMarkers(filtered);
    }
  }, [selectedOperators, markers]);

  useEffect(() => {
    if (markers.length > 0 && mapLoaded) {
      console.log('Markers ready to render:', markers.length);
    }
  }, [markers, mapLoaded]);

  const FilterPanel = () => (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 min-w-[250px] max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Filter by Operator</h3>
        <button
          onClick={() => setIsFilterOpen(false)}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <IoMdClose className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      
      <div className="space-y-2">
        {operators.map((operator, index) => (
          <label key={index} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="checkbox"
              checked={selectedOperators.has(operator)}
              onChange={(e) => handleOperatorFilter(operator, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{operator}</span>
            <span className="text-xs text-gray-500 ml-auto">
              ({markers.filter(m => m.details.Operator === operator).length})
            </span>
          </label>
        ))}
      </div>

      {selectedOperators.size > 0 && (
        <div className="mt-4 flex justify-between items-center pt-3 border-t">
          <span className="text-sm text-gray-600">
            Showing {filteredMarkers.length} locations
          </span>
          <button
            onClick={() => setSelectedOperators(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>InterToll</title>
      </Helmet>

      <div className="flex w-full flex-col items-center bg-gradient min-h-screen">
        <Header className="self-stretch" roleId={roleId} />

        <div className="flex justify-center items-center py-1">
          <img 
            src="/images/logo.png" 
            alt="InterToll" 
            className="w-[300px] h-[124px] object-contain"
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="relative mt-2">
            {loadError ? (
              <div className="text-red-500">{loadError}</div>
            ) : scriptLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={7}
                options={options}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleCloseClick}
              >
                <div className="absolute top-4 left-4 z-10">
                  {!isFilterOpen && (
                    <button
                      onClick={() => setIsFilterOpen(true)}
                      className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2 hover:bg-gray-50"
                    >
                      <IoFilterSharp className="w-5 h-5 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {selectedOperators.size ? `${selectedOperators.size} selected` : 'Filter Operators'}
                      </span>
                    </button>
                  )}
                </div>

                {isFilterOpen && <FilterPanel />}

                {filteredMarkers.map((marker, index) => (
                  <Marker
                    key={index}
                    position={marker.position}
                    onClick={() => handleMarkerClick(marker)}
                  />
                ))}

                {selectedMarker && (
                  <OverlayView
                    position={selectedMarker.position}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    getPixelPositionOffset={(width, height) => ({
                      x: -(width / 2),
                      y: -(height + 35)
                    })}
                  >
                    <div className="bg-white p-4 rounded-lg shadow-lg relative min-w-[320px]">
                      <button
                        onClick={handleCloseClick}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                      >
                        ✕
                      </button>
                      <h3 className="text-xl font-semibold text-gray-800 mb-3 pr-6">
                        {selectedMarker.details.Name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Operator:</span>
                          <span className="font-medium">{selectedMarker.details.Operator}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">TollID:</span>
                          <span className="font-medium">{selectedMarker.details.TollID}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Locality:</span>
                          <span className="font-medium">{selectedMarker.details.Locality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">PM:</span>
                          <span className="font-medium">{selectedMarker.details.PM}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-blue-600">{selectedMarker.details.Email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">{selectedMarker.details.Price}€</span>
                        </div>
                      </div>
                    </div>
                  </OverlayView>
                )}
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center" style={mapContainerStyle}>
                <div className="text-xl text-gray-600">Loading map...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InteractiveMap;