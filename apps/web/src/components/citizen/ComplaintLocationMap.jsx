import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons when using Vite/React
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ComplaintLocationMap = ({
    latitude,
    longitude,
    address,
}) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
    ) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-600">
                    Complaint location is not available.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
            <MapContainer
                center={[lat, lng]}
                zoom={16}
                scrollWheelZoom={false}
                className="h-80 w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[lat, lng]}>
                    <Popup>
                        <div className="text-sm">
                            <p className="font-semibold">
                                Complaint Location
                            </p>

                            {address && (
                                <p className="mt-1 text-slate-600">
                                    {address}
                                </p>
                            )}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default ComplaintLocationMap;
