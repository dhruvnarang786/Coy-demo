import { useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Heart, MessageCircle, Sparkles, X } from 'lucide-react';

const confetti = Array.from({ length: 18 }, (_, index) => index);

export default function MatchModal({ match, onClose, onViewMatches }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  if (!match) return null;
  return (
    <motion.div
      className="modal-backdrop"
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="match-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        initial={{ opacity: 0, scale: 0.88, y: 22 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={(event) => event.stopPropagation()}
      >
        {confetti.map((piece) => <span className={`confetti confetti-${piece % 4}`} style={{ left: `${(piece * 29 + 7) % 92}%`, top: `${(piece * 17 + 3) % 48}%`, '--confetti-x': `${(piece % 2 ? 1 : -1) * (18 + (piece * 13) % 42)}px`, '--confetti-delay': `${piece * 18}ms` }} key={piece} />)}
        <button className="modal-close" onClick={onClose} aria-label="Close match"><X size={20} /></button>
        <motion.div className="match-sparkle" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.16, type: 'spring', stiffness: 360, damping: 16 }}>
          <Sparkles size={20} />
        </motion.div>
        <p className="eyebrow">GOOD THINGS HAPPEN</p>
        <h2 id="match-title">It’s a Match!</h2>
        <p className="match-subtitle">You and {match.name} liked each other.</p>
        <div className="match-photos">
          <motion.img initial={{ x: -28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.12, type: 'spring', stiffness: 250, damping: 22 }} src="/images/demo-user.jpg" alt="Your demo profile" onError={(event) => { event.currentTarget.style.opacity = '0'; }} />
          <motion.div className="match-heart" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 400, damping: 14 }}><Heart size={22} fill="currentColor" /></motion.div>
          <motion.img initial={{ x: 28, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.12, type: 'spring', stiffness: 250, damping: 22 }} src={match.photo} alt={match.name} onError={(event) => { event.currentTarget.style.opacity = '0'; }} />
        </div>
        <button className="primary-button match-continue" onClick={onClose}><MessageCircle size={17} /> Keep discovering</button>
        <button className="match-view-button" onClick={onViewMatches}>View your matches <ArrowRight size={15} /></button>
      </motion.section>
    </motion.div>
  );
}
