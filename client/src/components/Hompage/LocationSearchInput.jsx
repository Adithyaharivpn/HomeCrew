import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Search, Loader2 } from "lucide-react";
import LocationPicker from "./LocationPicker";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from "../../api/axiosConfig"; 
import axios from 'axios';

const LocationSearchInput = ({ value, onChange, onLocationSelect }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (value && value.length > 2 && isSearching) {
                try {
                    // Using OSM Nominatim for suggestions
                    const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&limit=5`);
                    setSuggestions(res.data);
                } catch (err) {
                    console.error("Location search failed", err);
                }
            } else {
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value, isSearching]);

    // Handle Input Change
    const handleInputChange = (e) => {
        setIsSearching(true);
        onChange(e); // Propagate text change to parent
    };

    // Handle Suggestion Click
    const handleSuggestionClick = (place) => {
        onLocationSelect({
            city: place.display_name.split(',')[0], // Simple heuristic, parent can refine
            lat: place.lat,
            lng: place.lon,
            fullAddress: place.display_name
        });
        setSuggestions([]);
        setIsSearching(false);
    };

    // Handle Map Pick
    const handleMapSelect = (locData) => {
        onLocationSelect(locData);
        setDialogOpen(false); // Close modal
    };

    // Close suggestions on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        name="location" 
                        value={value} 
                        onChange={handleInputChange} 
                        placeholder="Search City or Area..." 
                        className="pl-9 bg-background rounded-xl h-12 uppercase text-xs font-bold"
                        autoComplete="off"
                    />
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button type="button" variant="outline" className="h-12 w-12 rounded-xl p-0 shrink-0 border-border bg-background hover:bg-muted">
                            <MapPin className="h-5 w-5 text-blue-600" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden bg-card border-border rounded-xl">
                        <DialogHeader className="p-4 border-b border-border">
                            <DialogTitle className="text-sm font-black uppercase tracking-widest">Pinpoint Precise Location</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 w-full relative">
                            <LocationPicker onLocationSelect={handleMapSelect} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <ScrollArea className="max-h-[200px]">
                        {suggestions.map((place) => (
                            <div 
                                key={place.place_id} 
                                onClick={() => handleSuggestionClick(place)}
                                className="p-3 hover:bg-muted/50 cursor-pointer border-b border-border/50 last:border-0 flex flex-col gap-1"
                            >
                                <span className="text-xs font-bold text-foreground truncate">{place.display_name.split(',')[0]}</span>
                                <span className="text-[10px] text-muted-foreground truncate">{place.display_name}</span>
                            </div>
                        ))}
                    </ScrollArea>
                </div>
            )}
        </div>
    );
};

export default LocationSearchInput;
