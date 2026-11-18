export default function ProfileSkeleton() {
  return (
    <div className="card-stage skeleton-stage" aria-label="Loading profiles" role="status">
      <div className="profile-card skeleton-card skeleton-back">
        <div className="skeleton-photo" />
        <div className="skeleton-details"><i /><i /><i /></div>
      </div>
      <div className="profile-card skeleton-card">
        <div className="skeleton-photo" />
        <div className="skeleton-details">
          <i className="skeleton-name" />
          <i className="skeleton-location" />
          <i className="skeleton-bio" />
          <div className="skeleton-tags"><i /><i /><i /></div>
        </div>
      </div>
      <span className="sr-only">Finding your people…</span>
    </div>
  );
}
