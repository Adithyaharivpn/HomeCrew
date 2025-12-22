import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Box, Typography, Paper, CircularProgress, Button, Chip } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

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
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobsOnly = async () => {
            try {
                const res = await api.get('/api/jobs');
                console.log("🔥 JOBS LOADED:", res.data.length);

                const validJobs = [];
                
                res.data.forEach(job => {
                    if (job.status === 'open' && job.location && job.location.lat && job.location.lng) {
                        validJobs.push({
                            id: job._id,
                            title: job.title,
                            category: job.category,
                            city: job.city,
                            coords: [parseFloat(job.location.lat), parseFloat(job.location.lng)],
                        });
                    }
                });

                console.log("📍 MAPPED JOBS:", validJobs);
                setJobs(validJobs);

            } catch (err) {
                console.error("API Error", err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobsOnly();
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Paper elevation={3} sx={{ height: '85vh', m: 2, mt: 10, borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            
            {/* Legend */}
            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, bgcolor: 'white', p: 1.5, borderRadius: 2, boxShadow: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Map Legend</Typography>
                <Box sx={{ mt: 0.5 }}>
                    <Chip size="small" label="Available Jobs" sx={{ bgcolor: '#2196f3', color: 'white' }} />
                </Box>
            </Box>

            <MapContainer 
                center={[9.9312, 76.2673]} 
                zoom={10} 
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                <MapBounds items={jobs} />

                {jobs.map((job, index) => (
                    <CircleMarker 
                        key={index}
                        center={job.coords}
                        pathOptions={{ color: '#1565c0', fillColor: '#2196f3', fillOpacity: 0.8 }}
                        radius={10} // Size of the dot
                    >
                        <Popup>
                            <Box sx={{ minWidth: 150 }}>
                                <Chip label="Job" color="primary" size="small" sx={{ mb: 1, height: 20 }} />
                                <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>
                                    {job.title}
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary">
                                    {job.category}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mb: 1, mt: 0.5 }}>
                                    📍 {job.city}
                                </Typography>
                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    fullWidth 
                                    onClick={() => navigate(`/job/${job.id}`)}
                                >
                                    View Details
                                </Button>
                            </Box>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>
        </Paper>
    );
};

export default MapSearch;