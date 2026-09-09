import { useEffect, useMemo, useState } from "react";
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

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://civic-connect-backend-6i78.onrender.com";

const API_URL = `${API_BASE_URL}/api/complaints/authority`;

const DEFAULT_CENTER = [23.2599, 77.4126];

const markerIcon = new L.Icon({
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
  }, [map, center]);

  return null;
}

function getStatusClass(status) {
  switch (String(status || "").toLowerCase()) {
    case "resolved":
      return "bg-green-100 text-green-700";
    case "in progress":
      return "bg-blue-100 text-blue-700";
    case "under review":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
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

      if (!token) {
        throw new Error("Please login again to view the civic map.");
      }

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load complaints."
        );
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Civic map error:", err);
      setError(err.message || "Unable to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const mappedComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const latitude = Number(complaint.latitude);
      const longitude = Number(complaint.longitude);

      return (
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude >= -90 &&
        latitude <= 90 &&
        longitude >= -180 &&
        longitude <= 180
      );
    });
  }, [complaints]);

  const mapCenter =
    mappedComplaints.length > 0
      ? [
          Number(mappedComplaints[0].latitude),
          Number(mappedComplaints[0].longitude),
        ]
      : DEFAULT_CENTER;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Authority Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                Civic Map
              </h1>

              <p className="mt-2 text-sm text-slate-600">
                View reported civic complaints by location, category and
                status.
              </p>
            </div>

            <div className="flex gap-3">
              <Link
                to="/authority/dashboard"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Dashboard
              </Link>

              <Link
                to="/authority/complaints"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                All Complaints
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-slate-900">
                Complaint Locations
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {mappedComplaints.length} complaint
                {mappedComplaints.length !== 1 ? "s" : ""} shown on map
              </p>
            </div>

            <button
              type="button"
              onClick={fetchComplaints}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex h-[600px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <p className="text-sm text-slate-500">
              Loading complaint locations...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="font-semibold text-red-800">
              Unable to load the civic map
            </h2>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={fetchComplaints}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              className="h-[600px] w-full"
            >
              <MapCenter center={mapCenter} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {mappedComplaints.map((complaint) => {
                const latitude = Number(complaint.latitude);
                const longitude = Number(complaint.longitude);

                return (
                  <Marker
                    key={complaint.id}
                    position={[latitude, longitude]}
                    icon={markerIcon}
                  >
                    <Popup>
                      <div className="min-w-[220px]">
                        <h3 className="text-base font-semibold text-slate-900">
                          {complaint.title || "Civic Complaint"}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          ID: {complaint.id}
                        </p>

                        <div className="mt-3 space-y-2 text-sm">
                          <p>
                            <span className="font-medium text-slate-700">
                              Category:
                            </span>{" "}
                            {complaint.category || "Not specified"}
                          </p>

                          <p>
                            <span className="font-medium text-slate-700">
                              Status:
                            </span>{" "}
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusClass(
                                complaint.status
                              )}`}
                            >
                              {complaint.status || "Not specified"}
                            </span>
                          </p>

                          <p>
                            <span className="font-medium text-slate-700">
                              Location:
                            </span>{" "}
                            {complaint.address || "Location not specified"}
                          </p>

                          {complaint.priority && (
                            <p>
                              <span className="font-medium text-slate-700">
                                Priority:
                              </span>{" "}
                              {complaint.priority}
                            </p>
                          )}

                          <p className="text-xs text-slate-500">
                            Coordinates: {latitude.toFixed(5)},{" "}
                            {longitude.toFixed(5)}
                          </p>
                        </div>

                        <Link
                          to={`/authority/complaints/${complaint.id}`}
                          className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View Complaint Details →
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        )}

        {!loading &&
          !error &&
          complaints.length > 0 &&
          mappedComplaints.length === 0 && (
            <div className="mt-4 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
              <p className="text-sm text-yellow-800">
                Complaints were found, but none have valid latitude and
                longitude coordinates.
              </p>
            </div>
          )}

        {!loading && !error && complaints.length === 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm text-slate-500">
              No complaints are available to display on the map.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}