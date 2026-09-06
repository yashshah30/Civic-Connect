import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultPosition = [23.2599, 77.4126];

const markerIcon = new L.Icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

function LocationMarker({ position, onLocationSelect }) {
    useMapEvents({
        click(event) {
            const { lat, lng } = event.latlng;

            onLocationSelect({
                latitude: lat.toFixed(6),
                longitude: lng.toFixed(6),
            });
        },
    });

    return position ? (
        <Marker position={position} icon={markerIcon} />
    ) : null;
}

function MapUpdater({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.setView(position, 16);
        }
    }, [position, map]);

    return null;
}

export default function LocationPicker({
    latitude,
    longitude,
    onLocationSelect,
}) {
    const hasCoordinates =
        latitude !== "" &&
        longitude !== "" &&
        !Number.isNaN(Number(latitude)) &&
        !Number.isNaN(Number(longitude));

    const position = hasCoordinates
        ? [Number(latitude), Number(longitude)]
        : defaultPosition;

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
    <span className="text-blue-600">📍</span>
    Click anywhere on the map to select the complaint location
</div>
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={true}
                className="h-[380px] w-full"
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater position={position} />

                <LocationMarker
                    position={hasCoordinates ? position : null}
                    onLocationSelect={onLocationSelect}
                />
            </MapContainer>
        </div>
    );
}