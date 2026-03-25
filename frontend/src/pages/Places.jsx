import { useEffect, useState } from 'react';
import '../styles/Places.css';

const RANK_TIERS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const avgRating = (ratings) => {
    if (!ratings?.length) return null;
    return (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1);
};

const tierForStars = (score) => {
    if (!score || score < 1 || score > 5) return null;
    return RANK_TIERS[score];
};

const tierForAverage = (avgStr) => {
    if (avgStr == null) return null;
    const n = Math.round(parseFloat(avgStr));
    if (n < 1 || n > 5) return null;
    return RANK_TIERS[n];
};

const placeStats = (place) => {
    const ratings = place.ratings || [];
    const count = ratings.length;
    const avg = count ? ratings.reduce((s, r) => s + r.score, 0) / count : null;
    return { avg, count };
};

const sortPlacesByRankedRating = (list) => {
    const withStats = list.map((p) => ({ ...p, ...placeStats(p) }));
    withStats.sort((a, b) => {
        const aRated = a.avg != null;
        const bRated = b.avg != null;
        if (aRated && !bRated) return -1;
        if (!aRated && bRated) return 1;
        if (!aRated && !bRated) return a.title.localeCompare(b.title);
        if (b.avg !== a.avg) return b.avg - a.avg;
        if (b.count !== a.count) return b.count - a.count;
        return a.title.localeCompare(b.title);
    });
    let lastAvg = null;
    let currentRank = 1;
    let ratedPosition = 0;
    return withStats.map((p) => {
        if (p.avg == null) {
            const { avg: _a, count: _c, ...rest } = p;
            return { ...rest, leaderboardRank: null };
        }
        ratedPosition += 1;
        if (lastAvg === null || Math.abs(p.avg - lastAvg) > 1e-9) {
            currentRank = ratedPosition;
        }
        lastAvg = p.avg;
        const { avg: _a, count: _c, ...rest } = p;
        return { ...rest, leaderboardRank: currentRank };
    });
};

const Stars = ({ value, tier }) => {
    const filled = Math.round(value);
    return (
        <span className="stars">
            {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className={n <= filled ? 'star filled' : 'star'}>★</span>
            ))}
            <span className="rating-value">{value}/5</span>
            {tier && <span className="rank-tier-label">{tier}</span>}
        </span>
    );
};

const getGuestId = () => {
    let id = localStorage.getItem('guestId');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('guestId', id);
    }
    return id;
};

const PlaceCard = ({ place, leaderboardRank }) => {
    const [comments, setComments] = useState(place.comments || []);
    const [ratings, setRatings] = useState(place.ratings || []);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const token = localStorage.getItem('token');
    const guestId = getGuestId();

    const existingRating = ratings.find(r => r.guestId === guestId);
    const [selectedScore, setSelectedScore] = useState(existingRating?.score || 0);

    const avg = avgRating(ratings);
    const avgTier = tierForAverage(avg);

    const submitComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        const res = await fetch(`/api/places/${place._id}/comments`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: commentText })
        });
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setCommentText('');
    };

    const submitRating = async (score) => {
        setSelectedScore(score);
        const res = await fetch(`/api/places/${place._id}/rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ score, guestId })
        });
        if (res.ok) {
            setRatings(prev => {
                const existing = prev.findIndex(r => r.guestId === guestId);
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = { ...updated[existing], score };
                    return updated;
                }
                return [...prev, { guestId, score }];
            });
        }
    };

    return (
        <li className="place-card">
            <div className="place-header">
                {leaderboardRank != null && (
                    <span className="leaderboard-rank" title="Leaderboard rank by average rating">#{leaderboardRank}</span>
                )}
                <h3>{place.title}</h3>
                {avg && <Stars value={avg} tier={avgTier} />}
            </div>
            <p>{place.description}</p>
            <div className="place-meta">
                <span className="place-coords">📍 {place.position[0].toFixed(4)}, {place.position[1].toFixed(4)}</span>
                {place.submittedBy && <span className="submitted-by">Submitted by {place.submittedBy.username}</span>}
            </div>

            <div className="rate-row">
                <span>Your rating:</span>
                {[1, 2, 3, 4, 5].map(n => (
                    <span
                        key={n}
                        className={`star interactive ${n <= selectedScore ? 'filled' : ''}`}
                        onClick={() => submitRating(n)}
                        title={tierForStars(n) ?? undefined}
                    >★</span>
                ))}
                {selectedScore > 0 && (
                    <span className="your-rank-tier">{tierForStars(selectedScore)}</span>
                )}
            </div>

            <button className="toggle-comments" onClick={() => setShowComments(v => !v)}>
                {showComments ? 'Hide' : 'Show'} comments ({comments.length})
            </button>

            {showComments && (
                <div className="comments-section">
                    {comments.length === 0 && <p className="no-comments">No comments yet.</p>}
                    {comments.map(c => (
                        <div key={c._id} className="comment">
                            <span className="comment-author">{c.author?.username ?? 'Unknown'}</span>
                            <span className="comment-text">{c.text}</span>
                        </div>
                    ))}
                    {token && (
                        <form className="comment-form" onSubmit={submitComment}>
                            <input
                                type="text"
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                placeholder="Add a comment..."
                                required
                            />
                            <button type="submit">Post</button>
                        </form>
                    )}
                </div>
            )}
        </li>
    );
};

const Places = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('/api/places')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch places');
                return res.json();
            })
            .then(data => setPlaces(sortPlacesByRankedRating(data)))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="places-status">Loading...</p>;
    if (error) return <p className="places-status error">{error}</p>;

    return (
        <div className="places-page">
            <h2>All Places</h2>
            <p className="places-ranking-hint">Places are ordered by ranked average rating (ties share the same rank). Unrated places appear last.</p>
            {places.length === 0 ? (
                <p className="places-status">No approved places yet.</p>
            ) : (
                <ul className="places-list">
                    {places.map(place => (
                        <PlaceCard
                            key={place._id}
                            place={place}
                            leaderboardRank={place.leaderboardRank}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Places;
