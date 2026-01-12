import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = ({ setLocation }) => {
    const [position, setPosition] = useState(null);
    
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLocation(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const LocationPicker = ({ onLocationSelect, className }) => {
    const [viewState, setViewState] = useState({ lat: 9.9312, lng: 76.2673, zoom: 10 }); // Default Cochin
    const [loadingCity, setLoadingCity] = useState(false);

    const handleLocationSelect = async (latlng) => {
        setLoadingCity(true);
        try {
            // Reverse Geocoding via Nominatim (OpenStreetMap)
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await res.json();
            
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown Location";
            onLocationSelect({
                lat: latlng.lat,
                lng: latlng.lng,
                city: city
            });
        } catch (err) {
            console.error("Geocoding failed", err);
            onLocationSelect({
                lat: latlng.lat,
                lng: latlng.lng,
                city: "Custom Location" // Fallback
            });
        } finally {
            setLoadingCity(false);
        }
    };

    return (
        <div className={cn("h-full w-full rounded-2xl overflow-hidden border border-border mt-2 relative z-0", className)}>
            {loadingCity && (
                <div className="absolute inset-0 z-[1000] bg-black/50 flex items-center justify-center text-white text-xs font-bold uppercase tracking-widest">
                    Detecting City...
                </div>
            )}
            <MapContainer 
                center={[viewState.lat, viewState.lng]} 
                zoom={viewState.zoom} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OSM'
                />
                <LocationMarker setLocation={handleLocationSelect} />
            </MapContainer>
        </div>
    );
};

export default LocationPicker;
