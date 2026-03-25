import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Admin.css';

const Admin = () => {
    const [pending, setPending] = useState([]);
    const [approved, setApproved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        Promise.all([
            axios.get('/api/places/pending', { headers }),
            axios.get('/api/places', { headers })
        ])
            .then(([pendingRes, approvedRes]) => {
                setPending(pendingRes.data);
                setApproved(approvedRes.data);
            })
            .catch(err => setError(err.response?.data?.message || 'Failed to load places'))
            .finally(() => setLoading(false));
    }, []);

    const approve = async (id) => {
        await axios.patch(`/api/places/${id}/approve`, {}, { headers });
        const place = pending.find(p => p._id === id);
        setPending(prev => prev.filter(p => p._id !== id));
        setApproved(prev => [...prev, { ...place, approved: true }]);
    };

    const reject = async (id) => {
        await axios.delete(`/api/places/${id}`, { headers });
        setPending(prev => prev.filter(p => p._id !== id));
    };

    const deleteApproved = async (id) => {
        await axios.delete(`/api/places/${id}`, { headers });
        setApproved(prev => prev.filter(p => p._id !== id));
    };

    if (loading) return <p className="admin-status">Loading...</p>;
    if (error) return <p className="admin-status error">{error}</p>;

    return (
        <div className="admin">
            <h2>Pending Places</h2>
            {pending.length === 0 ? (
                <p className="admin-status">No pending places.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Submitted By</th>
                            <th>Coordinates</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pending.map(place => (
                            <tr key={place._id}>
                                <td>{place.title}</td>
                                <td>{place.description}</td>
                                <td>{place.submittedBy?.username ?? '—'}</td>
                                <td>{place.position[0].toFixed(4)}, {place.position[1].toFixed(4)}</td>
                                <td className="admin-actions">
                                    <button className="btn-approve" onClick={() => approve(place._id)}>Approve</button>
                                    <button className="btn-reject" onClick={() => reject(place._id)}>Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h2 className="admin-section-title">Approved Places</h2>
            {approved.length === 0 ? (
                <p className="admin-status">No approved places.</p>
            ) : (
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Submitted By</th>
                            <th>Coordinates</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approved.map(place => (
                            <tr key={place._id}>
                                <td>{place.title}</td>
                                <td>{place.description}</td>
                                <td>{place.submittedBy?.username ?? '—'}</td>
                                <td>{place.position[0].toFixed(4)}, {place.position[1].toFixed(4)}</td>
                                <td className="admin-actions">
                                    <button className="btn-reject" onClick={() => deleteApproved(place._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Admin;
