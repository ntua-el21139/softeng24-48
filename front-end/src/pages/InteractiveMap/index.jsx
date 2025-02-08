import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { LoadScript, GoogleMap, Marker, InfoWindow, OverlayView } from '@react-google-maps/api';
import Papa from 'papaparse';

const libraries = ['places'];

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
    fullscreenControl: true
  }), []);

  const filteredMarkers = useMemo(() => 
    selectedOperator === 'all' 
      ? markers 
      : markers.filter(marker => marker.operator === selectedOperator),
    [markers, selectedOperator]
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/tollstations2024.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch CSV data');
        }
        const csvData = await response.text();
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const uniqueOperators = [...new Set(results.data
              .map(station => station.Operator)
              .filter(operator => operator && operator.trim() !== '')
            )];
            setOperators(uniqueOperators);
            
            const parsedMarkers = results.data
              .filter(station => station.Lat && station.Long)
              .map(station => ({
                position: {
                  lat: parseFloat(station.Lat),
                  lng: parseFloat(station.Long)
                },
                title: station.Name,
                operator: station.Operator,
                id: station.TollID,
                details: {
                  Name: station.Name,
                  Operator: station.Operator,
                  TollID: station.TollID,
                  PM: station.PM,
                  Locality: station.Locality,
                  Road: station.Road,
                  Price1: station.Price1,
                  Price2: station.Price2,
                  Price3: station.Price3,
                  Price4: station.Price4
                }
              }));
            setMarkers(parsedMarkers);
            setIsLoading(false);
          },
          error: (error) => {
            setError('Error parsing CSV: ' + error.message);
            setIsLoading(false);
          }
        });
      } catch (err) {
        setError('Error loading data: ' + err.message);
        setIsLoading(false);
      }
    };

    loadData();
    return () => {
      setSelectedMarker(null);
    };
  }, []);

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
                googleMapsApiKey="AIzaSyBnva_tnIVwDQb-XVBDBvin1AmgiXcImD8"
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
                            <span className="text-gray-600">PM:</span>
                            <span className="font-medium">{selectedMarker.details.PM}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Locality:</span>
                            <span className="font-medium">{selectedMarker.details.Locality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Road:</span>
                            <span className="font-medium">{selectedMarker.details.Road}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-gray-800 font-semibold mb-2">Prices:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price 1:</span>
                              <span className="font-medium">{selectedMarker.details.Price1}€</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price 2:</span>
                              <span className="font-medium">{selectedMarker.details.Price2}€</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price 3:</span>
                              <span className="font-medium">{selectedMarker.details.Price3}€</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Price 4:</span>
                              <span className="font-medium">{selectedMarker.details.Price4}€</span>
                            </div>
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