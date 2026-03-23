import { useState } from 'react';
import { MapContainer, TileLayer, Polygon, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { Layers } from 'lucide-react';
import { MAP_TILES } from '../../../utils/mapTiles';

export function ServiceAreaPolygonEditor({ initialPolygon, onSave, height = '400px' }) {
  const [polygon, setPolygon] = useState(initialPolygon || []);
  const [tileType, setTileType] = useState('streets');
  const [showTileMenu, setShowTileMenu] = useState(false);

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
    <div className="relative" style={{ height }}>
      <MapContainer center={[19.076, 72.877]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url={MAP_TILES[tileType] || MAP_TILES.streets} />
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

      <div className="absolute top-3 left-3 z-[400]">
        <button
          type="button"
          onClick={() => setShowTileMenu((prev) => !prev)}
          className="p-2 rounded-xl bg-white/95 dark:bg-dark-900/95 shadow-lg border border-black/10 dark:border-white/10"
          title="Switch map layer"
        >
          <Layers size={16} />
        </button>

        {showTileMenu && (
          <div className="absolute top-10 left-0 p-1.5 rounded-xl bg-white/95 dark:bg-dark-900/95 shadow-2xl border border-black/10 dark:border-white/10 min-w-[120px]">
            {Object.keys(MAP_TILES).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setTileType(type);
                  setShowTileMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  tileType === type
                    ? 'bg-brand-500 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
