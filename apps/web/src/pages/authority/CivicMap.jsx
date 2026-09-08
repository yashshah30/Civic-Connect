import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_URL = "http://localhost:5000/api/complaints";

const DEFAULT_CENTER = [23.2599, 77.4126];

const complaintIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapCenter({ center }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
}

export default function CivicMap() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load complaints");
      }

      const complaintList = Array.isArray(data)
        ? data
        : data.complaints || data.data || [];

      const mappedComplaints = complaintList.filter(
        (complaint) =>
          complaint.latitude !== null &&
          complaint.latitude !== undefined &&
          complaint.longitude !== null &&
          complaint.longitude !== undefined &&
          !Number.isNaN(Number(complaint.latitude)) &&
          !Number.isNaN(Number(complaint.longitude))
      );

      setComplaints(mappedComplaints);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
      setError(err.message || "Unable to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const center =
    complaints.length > 0
      ? [
          Number(complaints[0].latitude),
          Number(complaints[0].longitude),
        ]
      : DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Authority Portal
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Civic Map
            </h1>

            <p className="mt-1 text-slate-600">
              View reported civic complaints by location, category and status.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/authority/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </Link>

            <Link
              to="/authority/complaints"
              className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white hover:bg-slate-800"
            >
              All Complaints
            </Link>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Complaint Locations
              </h2>

              <p className="text-sm text-slate-500">
                {complaints.length} complaints shown on map
              </p>
            </div>

            <button
              onClick={fetchComplaints}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Unable to load complaints</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
            No complaints with valid location coordinates were found.
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex h-[600px] items-center justify-center text-slate-500">
              Loading complaint locations...
            </div>
          ) : (
            <MapContainer
              center={center}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "600px", width: "100%" }}
            >
              <MapCenter center={center} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {complaints.map((complaint) => {
                const latitude = Number(complaint.latitude);
                const longitude = Number(complaint.longitude);

                return (
                  <Marker
                    key={complaint.id}
                    position={[latitude, longitude]}
                    icon={complaintIcon}
                  >
                    <Popup>
                      <div className="min-w-[220px] text-sm">
                        <h3 className="mb-2 text-base font-bold text-slate-900">
                          {complaint.title ||
                            complaint.subject ||
                            "Civic Complaint"}
                        </h3>

                        <div className="space-y-1 text-slate-700">
                          <p>
                            <strong>ID:</strong> {complaint.id}
                          </p>

                          <p>
                            <strong>Category:</strong>{" "}
                            {complaint.category || "N/A"}
                          </p>

                          <p>
                            <strong>Status:</strong>{" "}
                            {complaint.status || "N/A"}
                          </p>

                          <p>
                            <strong>Priority:</strong>{" "}
                            {complaint.priority || "N/A"}
                          </p>

                          <p>
                            <strong>Location:</strong>{" "}
                            {complaint.address || "N/A"}
                          </p>

                          <p>
                            <strong>Coordinates:</strong>{" "}
                            {latitude}, {longitude}
                          </p>
                        </div>

                        <Link
                          to={`/authority/complaints/${complaint.id}`}
                          className="mt-3 inline-block rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white"
                        >
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}