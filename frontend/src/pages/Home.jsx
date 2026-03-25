import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import '../styles/Home.css';

const pendingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const MapClickHandler = ({ onClick }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        }
    });
    return null;
};

const Home = () => {
    const [places, setPlaces] = useState([]);
    const [pendingPlaces, setPendingPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPosition, setSelectedPosition] = useState(null);
    const [form, setForm] = useState({ title: '', description: '' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const res = await fetch('/api/places');
                if (!res.ok) throw new Error('Failed to fetch places');
                setPlaces(await res.json());

                if (token) {
                    const pendingRes = await fetch('/api/places/mine', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (pendingRes.ok) setPendingPlaces(await pendingRes.json());
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaces();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/places', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    position: [selectedPosition.lat, selectedPosition.lng]
                })
            });
            const newPlace = await response.json();
            setPendingPlaces((prev) => [...prev, newPlace]);
            setSelectedPosition(null);
            setForm({ title: '', description: '' });
        } catch (err) {
            console.error('Failed to add place:', err);
        }
    };

    if (loading) return <p className="status-message">Loading map...</p>;
    if (error) return <p className="status-message error">Error: {error}</p>;

    return (
        <div className="map-wrapper">
            {!token && (
                <div className="contribute-banner">
                    Know a hidden gem? <a href="/register">Register</a> to add places to the map.
                </div>
            )}

            {selectedPosition && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Add a Place</h2>
                        <p className="coordinates">
                            📍 {selectedPosition.lat.toFixed(4)}, {selectedPosition.lng.toFixed(4)}
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Enter a title"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Enter a description"
                                    required
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="btn-submit">Add Place</button>
                                <button type="button" className="btn-cancel" onClick={() => setSelectedPosition(null)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <MapContainer
                center={[51.5074, -0.1278]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapClickHandler onClick={token ? (latlng) => setSelectedPosition(latlng) : () => {}} />

                <MarkerClusterGroup chunkedLoading showCoverageOnHover={false} spiderfyDistanceMultiplier={2}>
                    {places.map((place) => (
                        <Marker key={place._id} position={place.position}>
                            <Popup>
                                <strong>{place.title}</strong>
                                <p>{place.description}</p>
                            </Popup>
                        </Marker>
                    ))}
                    {pendingPlaces.map((place) => (
                        <Marker key={place._id} position={place.position} icon={pendingIcon}>
                            <Popup>
                                <strong>{place.title}</strong>
                                <p>{place.description}</p>
                                <em>Pending approval</em>
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            </MapContainer>
        </div>
    );
};

export default Home;
