import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowRight, ChevronDown, Heart, RotateCw, Sparkles, X } from 'lucide-react';
import { getFeed, getMatches, postSwipe } from './api.js';
import ProfileCard from './components/ProfileCard.jsx';
import BottomNav from './components/BottomNav.jsx';
import MatchModal from './components/MatchModal.jsx';
import ProfileSkeleton from './components/ProfileSkeleton.jsx';
import ToastNotification from './components/ToastNotification.jsx';

const DEMO_AVATAR = '/images/demo-user.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [profiles, setProfiles] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [newMatch, setNewMatch] = useState(null);
  const [toast, setToast] = useState(null);
  const swipePending = useRef(false);
  const topProfile = profiles[0];

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [feed, matchData] = await Promise.all([getFeed(), getMatches()]);
      setProfiles(feed.profiles);
      setMatches(matchData.matches);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const swipe = async (action) => {
    if (!topProfile || swipePending.current) return;
    swipePending.current = true;
    setBusy(true);
    setError('');
    setSwipeDirection(action === 'LIKE' ? 1 : -1);
    try {
      const result = await postSwipe(topProfile.id, action);
      setProfiles((current) => current.filter((profile) => profile.id !== topProfile.id));
      if (result.matched && result.match) {
        setMatches((current) => [result.match, ...current.filter((match) => match.id !== result.match.id)]);
        setNewMatch(result.match);
      } else {
        showToast(action === 'LIKE' ? 'Like sent. Keep discovering!' : 'On to the next one.');
      }
    } catch (swipeError) {
      setSwipeDirection(0);
      showToast(swipeError.message, 'error');
    } finally {
      setBusy(false);
      swipePending.current = false;
      setSwipeDirection(0);
    }
  };

  const handleDragEnd = (offset, velocity) => {
    if (busy) return;
    if (offset > 100 || (offset > 65 && velocity > 1100)) swipe('LIKE');
    else if (offset < -100 || (offset < -65 && velocity < -1100)) swipe('PASS');
  };

  const openMatches = () => {
    setActiveTab('matches');
    setNewMatch(null);
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActiveTab('discover')} aria-label="Coy Discover">
          <span className="brand-mark"><Heart size={25} fill="currentColor" strokeWidth={2.2} /></span>
          <span>Coy</span>
        </button>
        <LayoutGroup>
          <BottomNav active={activeTab} onChange={setActiveTab} matchCount={matches.length} />
        </LayoutGroup>
        <div className="header-actions">
          <div className="slots-pill" aria-label={`${Math.max(0, 5 - matches.length)} crush slots available`}>
            <Sparkles size={14} fill="currentColor" />
            <span>{Math.max(0, 5 - matches.length)} slots left</span>
            <ChevronDown size={14} />
          </div>
          <img className="account-avatar" src={DEMO_AVATAR} alt="Your demo profile" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }} />
        </div>
      </header>

      <main>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            className="page-transition"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {activeTab === 'home' ? (
              <section className="home-screen">
                <motion.div className="home-illustration" initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
                  <Heart size={34} fill="currentColor" /><Sparkles size={19} />
                </motion.div>
                <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p>
                <h1>Good connections<br />start with a hello.</h1>
                <p className="home-copy">Your next favorite person might be one swipe away.</p>
                <button className="primary-button" onClick={() => setActiveTab('discover')}>Meet someone new <ArrowRight size={17} /></button>
                {matches.length > 0 && <button className="home-match-link" onClick={openMatches}><Heart size={16} />You have {matches.length} {matches.length === 1 ? 'match' : 'matches'}</button>}
              </section>
            ) : activeTab === 'matches' ? (
              <section className="matches-screen">
                <div className="section-heading">
                  <p className="eyebrow">THE FEELING IS MUTUAL</p>
                  <h1>Your matches<span className="coral-period">.</span></h1>
                  <p className="section-copy">A little spark, in both directions.</p>
                </div>
                {loading ? <div className="matches-loading" aria-label="Loading matches"><span /><span /><span /></div> : error ? (
                  <div className="error-card"><p>{error}</p><button className="text-button" onClick={loadData}>Try again</button></div>
                ) : matches.length ? (
                  <motion.div className="matches-list" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}>
                    {matches.map((match) => (
                      <motion.article className="match-row" key={match.id} variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} transition={{ type: 'spring', stiffness: 280, damping: 25 }}>
                        <img src={match.photo} alt={match.name} onError={(event) => { event.currentTarget.style.opacity = '0'; }} />
                        <div className="match-row-info">
                          <h2>{match.name}, {match.age}</h2>
                          <p>{match.location}</p>
                        </div>
                        <span className="match-mark" aria-label="Mutual match"><Heart size={17} fill="currentColor" /></span>
                      </motion.article>
                    ))}
                  </motion.div>
                ) : (
                  <div className="empty-matches">
                    <span className="empty-heart"><Heart size={29} /></span>
                    <h2>Your story is just starting</h2>
                    <p>When you both like each other, you’ll find your match right here.</p>
                    <button className="text-button" onClick={() => setActiveTab('discover')}>Back to Discover <ArrowRight size={15} /></button>
                  </div>
                )}
              </section>
            ) : (
              <section className="discover-screen">
                <div className="section-heading discover-heading">
                  <p className="eyebrow">A LITTLE CLOSER TO A SPARK</p>
                  <h1>Discover people<span className="coral-period">.</span></h1>
                  <p className="section-copy">Someone interesting might be closer than you think.</p>
                </div>
                {loading && profiles.length === 0 ? <ProfileSkeleton /> : error && !topProfile ? (
                  <div className="error-card"><p>{error}</p><button className="text-button" onClick={loadData}>Try again</button></div>
                ) : topProfile ? (
                  <div className="discovery-content">
                    <div className="card-stage">
                      <AnimatePresence initial={false} mode="popLayout">
                        {profiles.slice(0, 2).map((profile, index) => (
                          <ProfileCard
                            key={profile.id}
                            profile={profile}
                            offset={index}
                            swipeDirection={index === 0 ? swipeDirection : 0}
                            disabled={busy}
                            onSwipe={handleDragEnd}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="swipe-actions">
                      <motion.button className="action-button pass-button" onClick={() => swipe('PASS')} disabled={busy} aria-label="Pass" whileTap={{ scale: 0.88, rotate: -8 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
                        <X size={29} strokeWidth={2.7} />
                      </motion.button>
                      <motion.button className="action-button like-button" onClick={() => swipe('LIKE')} disabled={busy} aria-label="Like" whileTap={{ scale: 0.88 }} transition={{ type: 'spring', stiffness: 420, damping: 18 }}>
                        <Heart size={25} fill="currentColor" />
                      </motion.button>
                    </div>
                    <p className="gesture-hint"><span>←</span> Pass <i /> Like <span>→</span></p>
                  </div>
                ) : (
                  <div className="empty-feed">
                    <div className="empty-orbit"><Heart size={30} fill="currentColor" /><Sparkles size={18} /></div>
                    <p className="eyebrow">YOU’RE ALL CAUGHT UP</p>
                    <h2>That’s everyone for now.</h2>
                    <p>You’ve met all the people around here. Check back soon for new faces.</p>
                    <button className="primary-button" onClick={loadData}><RotateCw size={16} /> Check again</button>
                    <button className="text-button" onClick={openMatches}>See your matches <ArrowRight size={15} /></button>
                  </div>
                )}
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && <ToastNotification key={toast.id} toast={toast} />}
      </AnimatePresence>
      <AnimatePresence>
        {newMatch && <MatchModal match={newMatch} onClose={() => setNewMatch(null)} onViewMatches={openMatches} />}
      </AnimatePresence>
    </div>
  );
}
