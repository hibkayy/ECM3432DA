import React from 'react';
import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { popup } from 'leaflet';

const Home = () => {

    const markers = [
        { id: 1, position: [51.505, -0.09], title: 'Marker 1' , placeName: 'This is marker 1', description: 'Description for marker 1'},
        { id: 2, position: [51.505, -0.19], title: 'Marker 1' , placeName: 'This is marker 1', description: 'Description for marker 1'},
        { id: 3, position: [51.505, -0.07], title: 'Marker 1' , placeName: 'This is marker 1', description: 'Description for marker 1'},
        { id: 4, position: [51.505, -0.12], title: 'Marker 1' , placeName: 'This is marker 1', description: 'Description for marker 1'},
        { id: 5, position: [51.505, -0.15], title: 'Marker 1' , placeName: 'This is marker 1', description: 'Description for marker 1'},
    ];

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[51.5074, -0.1278]} 
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup 
          chunkedLoading
          showCoverageOnHover={false}
          spiderfyDistanceMultiplier={2}
        >
            
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup><h1>{marker.placeName}</h1><p>{marker.description}</p></Popup>
          </Marker>
        ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default Home;