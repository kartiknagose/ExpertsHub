import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

export function ServiceAreaPolygonEditor({ initialPolygon, onSave, height = '400px' }) {
  const [polygon, setPolygon] = useState(initialPolygon || []);

  const handleCreated = (e) => {
    const layer = e.layer;
    const latlngs = layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]);
    setPolygon(latlngs);
    onSave && onSave(latlngs);
  };

  const handleEdited = (e) => {
    const layers = e.layers;
    layers.eachLayer((layer) => {
      const latlngs = layer.getLatLngs()[0].map((latlng) => [latlng.lat, latlng.lng]);
      setPolygon(latlngs);
      onSave && onSave(latlngs);
    });
  };

  return (
    <div style={{ height }}>
      <MapContainer center={[19.076, 72.877]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            draw={{ rectangle: false, circle: false, marker: false, polyline: false }}
          />
          {polygon.length > 0 && <Polygon positions={polygon} />}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}
