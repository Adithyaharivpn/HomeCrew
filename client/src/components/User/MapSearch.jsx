import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

// Icons
import { Briefcase, HardHat, Loader2, MapPin } from 'lucide-react';

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const MapBounds = ({ items }) => {
    const map = useMap();
    useEffect(() => {
        if (items.length > 0) {
            const bounds = L.latLngBounds(items.map(item => item.coords));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [items, map]);
    return null;
};

const MapSearch = () => {
    const [mapData, setMapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobsRes, usersRes] = await Promise.all([
                    api.get('/api/jobs'),
                    api.get('/api/users/public/tradespeople') 
                ]);

                const markers = [];
                
                // Process Jobs
                jobsRes.data.forEach(job => {
                    if (job.status === 'open' && job.location?.lat && job.location?.lng) {
                        markers.push({
                            type: 'job',
                            id: job._id,
                            title: job.title,
                            subtitle: job.category,
                            locationName: job.city,
                            coords: [parseFloat(job.location.lat), parseFloat(job.location.lng)],
                            color: '#3b82f6', // Tailwind Blue-500
                            fillColor: '#93c5fd' // Tailwind Blue-300
                        });
                    }
                });

                // Process Users
                usersRes.data.forEach(user => {
                    if (user.mapLocation?.lat && user.mapLocation?.lng) {
                        markers.push({
                            type: 'worker',
                            id: user._id,
                            title: user.name,
                            subtitle: user.tradeCategory,
                            locationName: user.location,
                            coords: [parseFloat(user.mapLocation.lat), parseFloat(user.mapLocation.lng)],
                            avatar: user.profilePictureUrl,
                            color: '#f97316', // Tailwind Orange-500
                            fillColor: '#fdba74' // Tailwind Orange-300
                        });
                    }
                });

                setMapData(markers);

            } catch (err) {
                console.error("API Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <Card className="h-[85vh] m-4 mt-20 overflow-hidden relative shadow-lg border-0">
            
            {/* Legend - Floating Top Right */}
            <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-lg shadow-md border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Map Legend</h4>
                <div className="flex flex-col gap-2">
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white gap-2 px-2 py-1">
                        <Briefcase className="h-3 w-3" />
                        Jobs
                    </Badge>
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white gap-2 px-2 py-1">
                        <HardHat className="h-3 w-3" />
                        Tradespeople
                    </Badge>
                </div>
            </div>

            <MapContainer 
                center={[9.9312, 76.2673]} 
                zoom={10} 
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                <MapBounds items={mapData} />

                {mapData.map((item, index) => (
                    <CircleMarker 
                        key={`${item.type}-${index}`}
                        center={item.coords}
                        pathOptions={{ color: item.color, fillColor: item.fillColor, fillOpacity: 0.8 }}
                        radius={item.type === 'worker' ? 12 : 10} 
                    >
                        <Popup>
                            <div className="min-w-[160px] text-center p-1">
                                
                                {item.type === 'worker' && (
                                    <Avatar className="h-12 w-12 mx-auto mb-2 border-2 border-white shadow-sm">
                                        <AvatarImage src={item.avatar} />
                                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                                            {item.title?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                
                                <Badge className={`mb-2 pointer-events-none ${item.type === 'job' ? 'bg-blue-500' : 'bg-orange-500'}`}>
                                    {item.type === 'job' ? "Job" : "Tradesperson"}
                                </Badge>

                                <h3 className="text-sm font-bold text-slate-900 leading-tight mb-0.5">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-slate-500 mb-1">
                                    {item.subtitle}
                                </p>
                                <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mb-3">
                                    <MapPin className="h-3 w-3" />
                                    {item.locationName}
                                </p>

                                <Button 
                                    size="sm" 
                                    className={`w-full h-8 text-xs font-bold ${
                                        item.type === 'job' 
                                            ? "bg-blue-600 hover:bg-blue-700" 
                                            : "bg-orange-600 hover:bg-orange-700"
                                    }`}
                                    onClick={() => navigate(item.type === 'job' ? `/job/${item.id}` : `/profile/${item.id}`)}
                                >
                                    {item.type === 'job' ? "View Job" : "View Profile"}
                                </Button>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </Card>
    );
};

export default MapSearch;