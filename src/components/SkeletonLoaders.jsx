import React from 'react';

// Global skeleton styles - inject once at module load
const SHIMMER_STYLE = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }
  .skeleton-base {
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%);
    background-size: 1000px 100%;
    animation: shimmer 2s infinite;
    border-radius: 8px;
  }
  .skeleton-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

// Inject global styles once (prevents duplicate <style> tags)
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = SHIMMER_STYLE;
  if (!document.head.querySelector('style[data-skeleton]')) {
    style.setAttribute('data-skeleton', 'true');
    document.head.appendChild(style);
  }
}

// Common style constants to eliminate magic numbers
const SKELETON_SPACING = {
  xs: '0.3rem',
  sm: '0.4rem',
  md: '0.8rem',
  lg: '1rem',
  xl: '1.2rem',
  xxl: '1.5rem',
  xxxl: '2rem'
};

const SKELETON_SIZES = {
  avatarLg: { width: '100px', height: '100px' },
  avatarMd: { width: '44px', height: '44px' },
  avatarSm: { width: '40px', height: '40px' },
  dot: { width: '10px', height: '10px' },
  badge: { width: '4rem', height: '1.6rem' },
  button: { height: '2.2rem' },
  messageBubble: { height: '2.5rem' },
  travelPace: { width: '28px', height: '28px' }
};

const BASE_BORDER_RADIUS = '8px';


// ============================================
// TRIP CARD SKELETON
// ============================================
export const TripCardSkeleton = () => (
  <div className="skeleton-base" style={{ borderRadius: '20px', padding: '1.6rem' }}>
    {/* Top section (title + badge) */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SKELETON_SPACING.md, gap: SKELETON_SPACING.lg }}>
      <div style={{ flex: 1 }}>
        <div className="skeleton-base" style={{ height: '1.2rem', width: '80%', marginBottom: SKELETON_SPACING.sm }} />
        <div className="skeleton-base" style={{ height: '0.8rem', width: '60%' }} />
      </div>
      <div className="skeleton-base" style={{ height: SKELETON_SIZES.badge.height, width: SKELETON_SIZES.badge.width, flexShrink: 0 }} />
    </div>

    {/* Description (2 lines) */}
    <div className="skeleton-base" style={{ height: '0.8rem', marginBottom: SKELETON_SPACING.sm }} />
    <div className="skeleton-base" style={{ height: '0.8rem', width: '95%', marginBottom: SKELETON_SPACING.lg }} />

    {/* Meta fields (3 items in a row) */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SKELETON_SPACING.md, marginBottom: SKELETON_SPACING.lg }}>
      {[1, 2, 3].map(i => (
        <div key={i}>
          <div className="skeleton-base" style={{ height: '0.6rem', marginBottom: SKELETON_SPACING.xs }} />
          <div className="skeleton-base" style={{ height: '0.9rem' }} />
        </div>
      ))}
    </div>

    {/* Button area (2 buttons) */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SKELETON_SPACING.md }}>
      {[1, 2].map(i => (
        <div key={i} className="skeleton-base" style={{ height: SKELETON_SIZES.button.height }} />
      ))}
    </div>
  </div>
);


// ============================================
// TRIP CARDS GRID SKELETON (6 cards)
// ============================================
export const TripsGridSkeleton = ({ count = 6 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.2rem' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <TripCardSkeleton />
      </div>
    ))}
  </div>
);


// ============================================
// CHAT CONVERSATION ITEM SKELETON
// ============================================
export const ChatConversationSkeleton = () => (
  <div style={{
    padding: '14px 16px',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    animation: 'fadeIn 0.3s ease-in-out'
  }}>
    {/* Avatar */}
    <div className="skeleton-base" style={{
      ...SKELETON_SIZES.avatarMd,
      borderRadius: '50%',
      flexShrink: 0
    }} />

    {/* Content */}
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* Name + Timestamp row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
        <div className="skeleton-base" style={{ height: '0.9rem', width: '40%' }} />
        <div className="skeleton-base" style={{ height: '0.8rem', width: '15%', flexShrink: 0 }} />
      </div>
      {/* Last message preview */}
      <div className="skeleton-base" style={{ height: '0.8rem', width: '85%' }} />
    </div>

    {/* Unread dot */}
    <div className="skeleton-base" style={{
      ...SKELETON_SIZES.dot,
      borderRadius: '50%',
      flexShrink: 0
    }} />
  </div>
);


// ============================================
// CHAT CONVERSATIONS LIST SKELETON
// ============================================
export const ChatListSkeleton = ({ count = 10 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ animation: `fadeIn 0.3s ease-in-out ${i * 50}ms` }}>
        <ChatConversationSkeleton />
      </div>
    ))}
  </div>
);


// ============================================
// PROFILE HEADER SKELETON
// ============================================
export const ProfileHeaderSkeleton = () => (
  <div style={{ marginBottom: SKELETON_SPACING.xxxl }}>
    <div style={{ display: 'flex', gap: SKELETON_SPACING.xxl, alignItems: 'flex-start', marginBottom: SKELETON_SPACING.xxl }}>
      {/* Avatar */}
      <div className="skeleton-base" style={{
        ...SKELETON_SIZES.avatarLg,
        borderRadius: '50%',
        flexShrink: 0
      }} />

      {/* Info section */}
      <div style={{ flex: 1 }}>
        {/* Name + Match score */}
        <div style={{ display: 'flex', gap: SKELETON_SPACING.lg, alignItems: 'center', marginBottom: SKELETON_SPACING.md }}>
          <div className="skeleton-base" style={{ height: '1.5rem', width: '60%' }} />
        </div>

        {/* Location + Travel Style */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SKELETON_SPACING.lg, marginBottom: SKELETON_SPACING.lg }}>
          <div>
            <div className="skeleton-base" style={{ height: '0.7rem', marginBottom: SKELETON_SPACING.sm, width: '40%' }} />
            <div className="skeleton-base" style={{ height: '0.9rem' }} />
          </div>
          <div>
            <div className="skeleton-base" style={{ height: '0.7rem', marginBottom: SKELETON_SPACING.sm, width: '40%' }} />
            <div className="skeleton-base" style={{ height: '0.9rem' }} />
          </div>
        </div>

        {/* Button */}
        <div className="skeleton-base" style={{ height: SKELETON_SIZES.button.height, width: '150px' }} />
      </div>
    </div>
  </div>
);


// ============================================
// PROFILE FRIENDS LIST SKELETON
// ============================================
export const ProfileFriendsListSkeleton = ({ count = 5 }) => (
  <div>
    <div className="skeleton-base" style={{ height: '1.2rem', width: '100px', marginBottom: SKELETON_SPACING.lg }} />
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          padding: '12px 0',
          borderBottom: i < count - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
          animation: `fadeIn 0.3s ease-in-out ${i * 50}ms`
        }}
      >
        {/* Avatar */}
        <div className="skeleton-base" style={{
          ...SKELETON_SIZES.avatarSm,
          borderRadius: '50%',
          flexShrink: 0
        }} />

        {/* Name + Badge */}
        <div style={{ flex: 1 }}>
          <div className="skeleton-base" style={{ height: '0.9rem', width: '70%' }} />
        </div>

        {/* Travel Pace */}
        <div className="skeleton-base" style={{
          ...SKELETON_SIZES.travelPace,
          borderRadius: '50%',
          flexShrink: 0
        }} />
      </div>
    ))}
  </div>
);


// ============================================
// MESSAGE BUBBLE SKELETON
// ============================================
export const MessageBubbleSkeleton = ({ isOwn = false }) => (
  <div style={{
    display: 'flex',
    justifyContent: isOwn ? 'flex-end' : 'flex-start',
    marginBottom: SKELETON_SPACING.lg,
    animation: 'fadeIn 0.3s ease-in-out'
  }}>
    <div className="skeleton-base" style={{
      height: SKELETON_SIZES.messageBubble.height,
      width: '45%',
      minWidth: '100px',
      maxWidth: '300px'
    }} />
  </div>
);


// ============================================
// MESSAGES THREAD SKELETON
// ============================================
export const MessageThreadSkeleton = ({ count = 8 }) => (
  <div style={{ padding: SKELETON_SPACING.lg }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i}>
        <MessageBubbleSkeleton isOwn={i % 3 === 0} />
      </div>
    ))}
  </div>
);


// ============================================
// GENERIC BOX SKELETON
// ============================================
export const BoxSkeleton = ({ width = '100%', height = '2rem', borderRadius = BASE_BORDER_RADIUS, style = {} }) => (
  <div className="skeleton-base" style={{ width, height, borderRadius, ...style }} />
);


// ============================================
// STATS CARDS SKELETON
// ============================================
export const StatsCardSkeleton = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: SKELETON_SPACING.lg }}>
    {[1, 2, 3].map(i => (
      <div key={i} className="skeleton-base" style={{ padding: SKELETON_SPACING.xxl, borderRadius: '14px' }}>
        <div className="skeleton-base" style={{ height: '1rem', marginBottom: SKELETON_SPACING.md, width: '60%' }} />
        <div className="skeleton-base" style={{ height: '1.8rem', width: '40%' }} />
      </div>
    ))}
  </div>
);

// ============================================
// PHOTO GALLERY SKELETON
// ============================================
export const PhotoGallerySkeleton = () => (
  <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden mb-12">
    {/* Gallery Header */}
    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
      <div className="skeleton-base" style={{ height: '0.8rem', width: '120px' }} />
    </div>

    {/* Gallery Content */}
    <div style={{ padding: '1.5rem' }}>
      {/* Trip Group 1 */}
      <div style={{ marginBottom: '2rem' }}>
        {/* Trip Header */}
        <div className="skeleton-base" style={{ height: '2rem', marginBottom: '1rem', width: '180px', borderRadius: '8px' }} />
        
        {/* Photos Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-base" style={{ aspectRatio: '1', borderRadius: '8px' }} />
          ))}
        </div>
      </div>

      {/* Trip Group 2 */}
      <div>
        {/* Trip Header */}
        <div className="skeleton-base" style={{ height: '2rem', marginBottom: '1rem', width: '200px', borderRadius: '8px' }} />
        
        {/* Photos Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton-base" style={{ aspectRatio: '1', borderRadius: '8px' }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);
