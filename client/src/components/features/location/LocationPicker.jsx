import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Navigation, Globe, Layers } from 'lucide-react';
import { AddressAutocomplete } from './AddressAutocomplete';
import { toast } from 'sonner';
import { MAP_TILES, MAP_TILE_ATTRIBUTION } from '../../../utils/mapTiles';

/**
 * MapEvents
 * Internal helper to handle map clicks
 */
function MapEvents({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

/**
 * ChangeView
 * Internal helper to center map when coordinates change externaly
 */
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 15);
        }
    }, [center, map]);
    return null;
}

/**
 * LocationPicker
 * 
 * A visual map picker combined with address autocomplete.
 */
export function LocationPicker({ onChange, initialLocation = null }) {
    // State for local position
    const [position, setPosition] = useState(() => initialLocation || { lat: 19.0760, lng: 72.8777 });

    const [address, setAddress] = useState('');
    const [isLocating, setIsLocating] = useState(false);

    const handleLocationChange = useCallback((latlng, addr = '') => {
        setPosition(latlng);
        if (addr) setAddress(addr);

        onChange({
            lat: latlng.lat,
            lng: latlng.lng,
            address: addr || address
        });
    }, [address, onChange]);

    const handleAutocompleteSelect = (data) => {
        const latlng = { lat: data.lat, lng: data.lng };
        handleLocationChange(latlng, data.address);
    };

    const handleMapClick = (latlng) => {
        handleLocationChange(latlng);
        // Optionally fetch address for these coords (Reverse Geocoding)
        fetchReverseGeocode(latlng.lat, latlng.lng);
    };

    const fetchReverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
            const data = await response.json();
            if (data.display_name) {
                setAddress(data.display_name);
                onChange({ lat, lng, address: data.display_name });
            }
        } catch (err) {
            console.error('Reverse geocode error:', err);
        }
    };

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            toast.error('Location access requires HTTPS (or localhost in development).');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const latlng = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                handleLocationChange(latlng);
                fetchReverseGeocode(latlng.lat, latlng.lng);
                setIsLocating(false);
            },
            (error) => {
                setIsLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    toast.error('Location access denied. Please allow location in browser settings.');
                } else if (error.code === error.TIMEOUT) {
                    toast.error('Location request timed out. Please try again.');
                } else {
                    toast.error('Could not detect your current location.');
                }
            },
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 15000 }
        );
    };

    const [mapType, setMapType] = useState('satellite');

    return (
        <div className="space-y-4">
            {/* (Keep Autocomplete and Current Location as they were) */}
            <div className="flex flex-col sm:flex-row gap-3">
                <AddressAutocomplete
                    value={address}
                    onChange={handleAutocompleteSelect}
                    className="flex-1"
                />
                <button
                    type="button"
                    onClick={getUserLocation}
                    disabled={isLocating}
                    className="px-4 py-3.5 rounded-xl border flex items-center justify-center gap-2 transition-all bg-white border-gray-200 text-gray-600 hover:text-brand-600 dark:bg-dark-800 dark:border-dark-700 dark:text-gray-300 dark:hover:text-brand-400"
                    title="Use my current location"
                >
                    <Navigation size={18} className={isLocating ? 'animate-pulse' : ''} />
                    <span className="text-sm font-semibold hidden sm:inline">Current Location</span>
                </button>
            </div>

            <div className="relative h-72 rounded-3xl overflow-hidden border-2 shadow-2xl border-gray-100 shadow-brand-500/10 dark:border-dark-700 dark:shadow-brand-500/5">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%', zIndex: 1 }}
                    zoomControl={false}
                    attributionControl={false}
                >
                    <ChangeView center={position} />
                    {mapType === 'streets' ? (
                        <TileLayer
                            url={MAP_TILES.streets}
                            attribution={MAP_TILE_ATTRIBUTION}
                        />
                    ) : (
                        <TileLayer
                            url={MAP_TILES.satellite}
                            attribution={MAP_TILE_ATTRIBUTION}
                        />
                    )}
                    <Marker position={position} />
                    <MapEvents onLocationSelect={handleMapClick} />
                </MapContainer>

                {/* Floating Controls */}
                <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => setMapType(mapType === 'streets' ? 'satellite' : 'streets')}
                        className="p-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all active:scale-95 bg-white/80 border-gray-100 text-brand-600 dark:bg-dark-800/80 dark:border-dark-700 dark:text-brand-400"
                        title={`Switch to ${mapType === 'streets' ? 'Satellite' : 'Streets'} View`}
                    >
                        {mapType === 'streets' ? <Globe size={20} /> : <Layers size={20} />}
                    </button>
                </div>

                {/* Coordinate Display Overlay */}
                <div className="absolute bottom-4 left-4 z-[400] px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-mono bg-white/80 text-gray-600 dark:bg-dark-900/80 dark:text-gray-400">
                    {position?.lat ? position.lat.toFixed(6) : '0.000000'}, {position?.lng ? position.lng.toFixed(6) : '0.000000'}
                </div>
            </div>

            {address && (
                <div className="p-4 rounded-xl border flex items-start gap-3 bg-opacity-50 bg-brand-50 border-brand-100 dark:bg-brand-900/10 dark:border-brand-800/20">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-brand-100 dark:bg-brand-900/30">
                        <MapPin size={16} className="text-brand-600 dark:text-brand-400" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-0.5 text-gray-500 dark:text-gray-400">Selected Location</p>
                        <p className="text-sm leading-snug font-medium text-gray-800 dark:text-gray-200">{address}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
