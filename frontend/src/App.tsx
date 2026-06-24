import { useState } from 'react';
import MapContainer, { type MapCoordinate } from './components/Map/MapContainer';
import './App.css';

function App() {
  // Center coordinates for Da Nang City
  const [center] = useState<MapCoordinate>({ lat: 16.0544, lng: 108.2022 });
  const [zoom] = useState<number>(13);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}

export default App;
