import { Compass, House, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function BottomNav({ active, onChange, matchCount }) {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <button className={`nav-item ${active === 'home' ? 'active' : ''}`} onClick={() => onChange('home')}>
        {active === 'home' && <motion.span className="nav-active-indicator" layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
        <House size={20} fill={active === 'home' ? 'currentColor' : 'none'} />
        <span>Home</span>
      </button>
      <button className={`nav-item ${active === 'discover' ? 'active' : ''}`} onClick={() => onChange('discover')}>
        {active === 'discover' && <motion.span className="nav-active-indicator" layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
        <Compass size={20} fill={active === 'discover' ? 'currentColor' : 'none'} />
        <span>Discover</span>
      </button>
      <button className={`nav-item ${active === 'matches' ? 'active' : ''}`} onClick={() => onChange('matches')}>
        {active === 'matches' && <motion.span className="nav-active-indicator" layoutId="nav-indicator" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
        <span className="match-nav-icon"><Heart size={20} fill={active === 'matches' ? 'currentColor' : 'none'} />{matchCount > 0 && <i />}</span>
        <span>Matches</span>
      </button>
    </nav>
  );
}
