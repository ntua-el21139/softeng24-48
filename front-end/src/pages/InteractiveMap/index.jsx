import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { LoadScript, GoogleMap, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';

const libraries = ['places', 'marker'];
const MAP_ID = 'AIzaSyBnva_tnIVwDQb-XVBDBvin1AmgiXcImD8';

const InteractiveMap = () => {
  const [markers, setMarkers] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [operators, setOperators] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  const onLoad = useCallback(map => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
    setSelectedMarker(null);
  }, []);

  const handleMarkerClick = useCallback((marker) => {
    setSelectedMarker(marker);
  }, []);

  const handleCloseClick = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  const mapContainerStyle = useMemo(() => ({
    width: '1200px',
    height: '500px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    position: 'relative'
  }), []);

  const center = useMemo(() => ({
    lat: 38.2,
    lng: 23.5
  }), []);

  const options = useMemo(() => ({
    disableDefaultUI: false,
    scrollwheel: true,
    draggable: true,
    styles: [],
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
    streetViewControl: true,
    rotateControl: true,
    fullscreenControl: true,
    mapId: MAP_ID
  }), []);

  const filteredMarkers = useMemo(() => {
    if (selectedOperator === 'all') {
      return markers;
    }
    
    return markers.filter(marker => marker.operator_name === selectedOperator);
  }, [markers, selectedOperator]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('http://localhost:9115/api/extra/mapSupply');
        if (!response.ok) {
          throw new Error('Failed to fetch station data');
        }
        
        const result = await response.json();
        const data = result.data || result;
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from API');
        }

        const uniqueOperators = [...new Set(data
          .map(station => station.operator_name)
          .filter(Boolean)
        )];
        setOperators(uniqueOperators);
        
        const parsedMarkers = data
          .filter(station => station.lat && station.longt)
          .map(station => ({
            position: {
              lat: parseFloat(station.lat),
              lng: parseFloat(station.longt)
            },
            title: station.station_name || '',
            operator_name: station.operator_name,
            id: station.station_id,
            details: {
              Name: station.station_name || '',
              Operator: station.operator_name,
              TollID: station.station_id,
              Price: station.price2 || ''
            }
          }));
        setMarkers(parsedMarkers);
        setIsLoading(false);
      } catch (err) {
        console.error('Full error:', err);
        setError('Error loading data: ' + err.message);
        setIsLoading(false);
      }
    };

    loadData();
    return () => {
      setSelectedMarker(null);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.markers?.forEach(marker => marker.setMap(null));
      }
    };
  }, [filteredMarkers]);

  if (error) {
    return <div className="text-red-500 text-center mt-4">Error: {error}</div>;
  }

  const OperatorControl = () => (
    <div
      style={{
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
      }}
    >
      <select 
        value={selectedOperator}
        onChange={(e) => setSelectedOperator(e.target.value)}
        className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
        style={{ width: '100%' }}
      >
        <option value="all">All Operators</option>
        {operators.map(operator => (
          <option key={operator} value={operator}>
            {operator}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col items-center bg-gradient min-h-screen">
        <Header className="self-stretch" />

        <div className="flex justify-center items-center py-1">
          <img 
            src="/images/logo.png" 
            alt="InterToll" 
            className="w-[300px] h-[124px] object-contain"
          />
        </div>

        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="text-center mt-4">Loading map data...</div>
          ) : (
            <div className="relative mt-2">
              <LoadScript 
                googleMapsApiKey={MAP_ID}
                libraries={libraries}
                loadingElement={<div>Loading map...</div>}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={7}
                  options={options}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  onClick={handleCloseClick}
                  mapId={MAP_ID}
                >
                  <OperatorControl />
                  {filteredMarkers.map(marker => (
                    <Marker
                      key={marker.id}
                      position={marker.position}
                      title={marker.title}
                      onClick={() => handleMarkerClick(marker)}
                      optimized={true}
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
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">{selectedMarker.details.Price}€</span>
                          </div>
                        </div>
                      </div>
                    </OverlayView>
                  )}
                </GoogleMap>
              </LoadScript>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InteractiveMap;