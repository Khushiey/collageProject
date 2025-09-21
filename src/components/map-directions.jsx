"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Navigation, Search, Route, Locate, Clock, Car } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import axios from "axios"

const MapComponent = dynamic(() => import("./interactive-map"), {
    ssr: false,
    loading: () => (
        <div className="h-96 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="mx-auto mb-4"
                >
                    <MapPin className="h-16 w-16 text-muted-foreground/50" />
                </motion.div>
                <p className="text-muted-foreground">Loading interactive map...</p>
            </div>
        </div>
    ),
})

export function MapDirections() {
    const [destination, setDestination] = useState("")
    const [currentLocation, setCurrentLocation] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [routeInfo, setRouteInfo] = useState(null)
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2088]) 
    const [routeCoordinates, setRouteCoordinates] = useState(null)

    const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImRlZjVhYzU0Nzg0NDQzMDM5NDQ3MDA0Y2YwM2UwNTgyIiwiaCI6Im11cm11cjY0In0="

    const getCurrentLocation = () => {
        setIsGettingLocation(true)

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setMapCenter([latitude, longitude])
                    setCurrentLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
                    setIsGettingLocation(false)
                },
                (error) => {
                    console.error("Error getting location:", error)
                    setCurrentLocation("Location access denied")
                    setIsGettingLocation(false)
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            )
        } else {
            setCurrentLocation("Geolocation not supported")
            setIsGettingLocation(false)
        }
    }

    // Get directions using OpenRouteService
    const handleGetDirections = async () => {
        if (!destination.trim()) return

        setIsLoading(true)
        setRouteInfo(null)
        setRouteCoordinates(null)

        try {
            // 1️⃣ Geocode the destination
            const geoRes = await axios.get(
                `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(destination)}`
            )

            if (!geoRes.data.features.length) throw new Error("Destination not found")

            const [destLng, destLat] = geoRes.data.features[0].geometry.coordinates

            // 2️⃣ Get route from current location to destination
            const routeRes = await axios.post(
                `https://api.openrouteservice.org/v2/directions/driving-car`,
                {
                    coordinates: [
                        [mapCenter[1], mapCenter[0]], // current location [lng, lat]
                        [destLng, destLat] // destination
                    ]
                },
                {
                    headers: {
                        Authorization: API_KEY,
                        "Content-Type": "application/json"
                    }
                }
            )

            const route = routeRes.data.routes[0]; // first route
            const segment = route.segments[0];     // first segment of the route

            // Extract the geometry for the map
            const coordinates = route.geometry
                ? decodePolyline(route.geometry)
                : segment.steps.flatMap(step => step.way_points.map((i) => [
                    route.geometry.coordinates[i][1],
                    route.geometry.coordinates[i][0]
                ]));

            setRouteInfo({
                distance: segment.distance,
                duration: segment.duration,
                steps: segment.steps
            });

            setRouteCoordinates(coordinates);
            setMapCenter([destLat, destLng])
        } catch (err) {
            console.error(err)
            alert("Error fetching directions")
        } finally {
            setIsLoading(false)
        }
    }

    // Helper function to decode polyline geometry
    const decodePolyline = (encoded) => {
        if (!encoded) return [];
        
        const points = [];
        let index = 0, len = encoded.length;
        let lat = 0, lng = 0;
        
        while (index < len) {
            let b, shift = 0, result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lat += dlat;
            
            shift = 0;
            result = 0;
            do {
                b = encoded.charCodeAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
            lng += dlng;
            
            points.push([lat / 1e5, lng / 1e5]);
        }
        
        return points;
    }

    useEffect(() => {
        getCurrentLocation()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Map Directions</h2>
                    <p className="text-muted-foreground">Get directions from your current location</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Search Panel */}
                <Card className="border-border/40 bg-card/30 lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Route Planning
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Locate className="h-4 w-4" />
                                Current Location
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Getting location..."
                                    value={currentLocation}
                                    readOnly
                                    className="bg-background/50 text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={getCurrentLocation}
                                    disabled={isGettingLocation}
                                    className="flex-shrink-0 bg-transparent"
                                >
                                    {isGettingLocation ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                        >
                                            <Locate className="h-4 w-4" />
                                        </motion.div>
                                    ) : (
                                        <Locate className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Destination</label>
                            <Input
                                placeholder="Enter destination address..."
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                                className="bg-background/50"
                                onKeyPress={(e) => e.key === "Enter" && handleGetDirections()}
                            />
                        </div>

                        <Button
                            onClick={handleGetDirections}
                            disabled={isLoading || !destination.trim()}
                            className="w-full"
                            size="lg"
                        >
                            {isLoading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                    className="mr-2"
                                >
                                    <Navigation className="h-4 w-4" />
                                </motion.div>
                            ) : (
                                <Navigation className="h-4 w-4 mr-2" />
                            )}
                            {isLoading ? "Calculating Route..." : "Get Directions"}
                        </Button>

                        {routeInfo && (
                            <div className="pt-4 border-t border-border/40">
                                <h3 className="text-sm font-medium mb-3">Route Summary</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                                        <Route className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Distance</p>
                                            <p className="text-sm font-medium">
                                                {routeInfo.distance >= 1000
                                                    ? `${(routeInfo.distance / 1000).toFixed(1)} km`
                                                    : `${routeInfo.distance} m`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <div>
                                            <p className="text-xs text-muted-foreground">Duration</p>
                                            <p className="text-sm font-medium">
                                                {routeInfo.duration >= 60
                                                    ? `${Math.round(routeInfo.duration / 60)} minutes`
                                                    : `${routeInfo.duration} seconds`
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Map */}
                <Card className="border-border/40 bg-card/30 lg:col-span-2">
                    <CardContent className="p-0">
                        <MapComponent 
                            center={mapCenter} 
                            destination={destination} 
                            routeInfo={routeInfo}
                            routeCoordinates={routeCoordinates}
                            currentLocation={currentLocation}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Directions Panel */}
            {routeInfo && (
                <Card className="border-border/40 bg-card/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Car className="h-5 w-5" />
                            Turn-by-Turn Directions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {routeInfo.steps.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors"
                                >
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm leading-relaxed">{step.instruction}</p>
                                        {step.distance && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {step.distance >= 1000
                                                    ? `${(step.distance / 1000).toFixed(1)} km`
                                                    : `${step.distance} m`
                                                } • {Math.round(step.duration / 60)} min
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}