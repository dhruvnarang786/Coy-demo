import { forwardRef, useEffect } from 'react';
import { motion, useAnimationControls, useMotionValue, useTransform } from 'motion/react';
import { MapPin, Sparkles } from 'lucide-react';

const ProfileCard = forwardRef(function ProfileCard({ profile, offset, swipeDirection, disabled, onSwipe }, ref) {
  const x = useMotionValue(0);
  const rotation = useTransform(x, [-360, 0, 360], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [18, 115], [0, 1]);
  const passOpacity = useTransform(x, [-115, -18], [1, 0]);
  const controls = useAnimationControls();
  const isTop = offset === 0;

  useEffect(() => {
    if (!isTop) return;
    if (swipeDirection) {
      controls.start({
        x: swipeDirection * (window.innerWidth + 180),
        opacity: 0,
        transition: { type: 'spring', stiffness: 210, damping: 27 },
      });
    } else {
      controls.start({
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 360, damping: 30 },
      });
    }
  }, [controls, isTop, swipeDirection]);

  return (
    <motion.article
      ref={ref}
      className={`profile-card ${isTop ? 'profile-card-top' : 'profile-card-behind'}`}
      layout
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={isTop ? controls : { opacity: 0.82, y: 12, scale: 0.965, x: 0 }}
      exit={{ opacity: 0, x: swipeDirection * (window.innerWidth + 180), transition: { type: 'spring', stiffness: 210, damping: 27 } }}
      style={{ x: isTop ? x : 0, rotate: isTop ? rotation : -0.5, zIndex: 3 - offset }}
      drag={isTop && !disabled ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.88}
      dragMomentum={false}
      dragSnapToOrigin
      onDragEnd={(_event, info) => isTop && onSwipe(info.offset.x, info.velocity.x)}
      transition={{ layout: { type: 'spring', stiffness: 290, damping: 28 } }}
      aria-label={`${profile.name}, ${profile.age}`}
      aria-hidden={!isTop}
    >
      <div className="photo-wrap">
        <img className="profile-photo" src={profile.photo} alt={isTop ? `${profile.name}, ${profile.age}` : ''} draggable="false" onError={(event) => { event.currentTarget.style.opacity = '0'; }} />
        <div className="photo-shade" />
        <motion.div className="swipe-stamp like-stamp" style={{ opacity: likeOpacity }} aria-hidden="true">LIKE</motion.div>
        <motion.div className="swipe-stamp pass-stamp" style={{ opacity: passOpacity }} aria-hidden="true">PASS</motion.div>
        <div className="photo-caption">
          <div className="name-line">
            <h2>{profile.name}, {profile.age}</h2>
          </div>
          <p className="location"><MapPin size={15} />{profile.location}</p>
        </div>
      </div>
      <div className="profile-details">
        <p className="bio">{profile.bio}</p>
        <div className="interest-list">
          {profile.interests.slice(0, 4).map((interest, index) => (
            <motion.span className="interest-chip" key={interest} whileHover={{ y: -2, backgroundColor: '#f8ece9' }} transition={{ duration: 0.16 }}>
              {index === 0 && <Sparkles size={12} />}{interest}
            </motion.span>
          ))}
          {profile.interests.length > 4 && <span className="interest-chip more-chip">+{profile.interests.length - 4}</span>}
        </div>
      </div>
    </motion.article>
  );
});

export default ProfileCard;
