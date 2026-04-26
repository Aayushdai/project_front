import React from 'react';

// Global skeleton styles - inject once at module load
const SHIMMER_STYLE = `
  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  /* ── DARK MODE (Default) ── */
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

// ── Helper: Get skeleton styles based on current theme ──
const getSkeletonStyle = () => {
  if (typeof document === 'undefined') return {};
  
  const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
  
  if (isDarkMode) {
    return {
      background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.05) 100%)',
      backgroundSize: '1000px 100%',
      animation: 'shimmer 2s infinite',
      borderRadius: '8px',
    };
  } else {
    // Light mode - lighter orange/brown color
    return {
      background: 'linear-gradient(90deg, rgba(180, 83, 9, 0.20) 0%, rgba(180, 83, 9, 0.30) 50%, rgba(180, 83, 9, 0.20) 100%)',
      backgroundSize: '1000px 100%',
      animation: 'shimmer 2s infinite',
      borderRadius: '8px',
      border: '1px solid rgba(180, 83, 9, 0.15)',
    };
  }
};

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
export const TripCardSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{ ...skeletonStyle, borderRadius: '20px', padding: '1.6rem' }}>
      {/* Top section (title + badge) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SKELETON_SPACING.md, gap: SKELETON_SPACING.lg }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...skeletonStyle, height: '1.2rem', width: '80%', marginBottom: SKELETON_SPACING.sm }} />
          <div style={{ ...skeletonStyle, height: '0.8rem', width: '60%' }} />
        </div>
        <div style={{ ...skeletonStyle, height: SKELETON_SIZES.badge.height, width: SKELETON_SIZES.badge.width, flexShrink: 0 }} />
      </div>

      {/* Description (2 lines) */}
      <div style={{ ...skeletonStyle, height: '0.8rem', marginBottom: SKELETON_SPACING.sm }} />
      <div style={{ ...skeletonStyle, height: '0.8rem', width: '95%', marginBottom: SKELETON_SPACING.lg }} />

      {/* Meta fields (3 items in a row) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: SKELETON_SPACING.md, marginBottom: SKELETON_SPACING.lg }}>
        {[1, 2, 3].map(i => (
          <div key={i}>
            <div style={{ ...skeletonStyle, height: '0.6rem', marginBottom: SKELETON_SPACING.xs }} />
            <div style={{ ...skeletonStyle, height: '0.9rem' }} />
          </div>
        ))}
      </div>

      {/* Button area (2 buttons) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SKELETON_SPACING.md }}>
        {[1, 2].map(i => (
          <div key={i} style={{ ...skeletonStyle, height: SKELETON_SIZES.button.height }} />
        ))}
      </div>
    </div>
  );
};


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
export const ChatConversationSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{
      padding: '14px 16px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      animation: 'fadeIn 0.3s ease-in-out'
    }}>
      {/* Avatar */}
      <div style={{
        ...skeletonStyle,
        ...SKELETON_SIZES.avatarMd,
        borderRadius: '50%',
        flexShrink: 0
      }} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Name + Timestamp row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
          <div style={{ ...skeletonStyle, height: '0.9rem', width: '40%' }} />
          <div style={{ ...skeletonStyle, height: '0.8rem', width: '15%', flexShrink: 0 }} />
        </div>
        {/* Last message preview */}
        <div style={{ ...skeletonStyle, height: '0.8rem', width: '85%' }} />
      </div>

      {/* Unread dot */}
      <div style={{
        ...skeletonStyle,
        ...SKELETON_SIZES.dot,
        borderRadius: '50%',
        flexShrink: 0
      }} />
    </div>
  );
};


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
export const ProfileHeaderSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{ marginBottom: SKELETON_SPACING.xxxl }}>
      <div style={{ display: 'flex', gap: SKELETON_SPACING.xxl, alignItems: 'flex-start', marginBottom: SKELETON_SPACING.xxl }}>
        {/* Avatar */}
        <div style={{
          ...skeletonStyle,
          ...SKELETON_SIZES.avatarLg,
          borderRadius: '50%',
          flexShrink: 0
        }} />

        {/* Info section */}
        <div style={{ flex: 1 }}>
          {/* Name + Match score */}
          <div style={{ display: 'flex', gap: SKELETON_SPACING.lg, alignItems: 'center', marginBottom: SKELETON_SPACING.md }}>
            <div style={{ ...skeletonStyle, height: '1.5rem', width: '60%' }} />
          </div>

          {/* Location + Travel Style */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SKELETON_SPACING.lg, marginBottom: SKELETON_SPACING.lg }}>
            <div>
              <div style={{ ...skeletonStyle, height: '0.7rem', marginBottom: SKELETON_SPACING.sm, width: '40%' }} />
              <div style={{ ...skeletonStyle, height: '0.9rem' }} />
            </div>
            <div>
              <div style={{ ...skeletonStyle, height: '0.7rem', marginBottom: SKELETON_SPACING.sm, width: '40%' }} />
              <div style={{ ...skeletonStyle, height: '0.9rem' }} />
            </div>
          </div>

          {/* Button */}
          <div style={{ ...skeletonStyle, height: SKELETON_SIZES.button.height, width: '150px' }} />
        </div>
      </div>
    </div>
  );
};


// ============================================
// PROFILE FRIENDS LIST SKELETON
// ============================================
export const ProfileFriendsListSkeleton = ({ count = 5 }) => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div>
      <div style={{ ...skeletonStyle, height: '1.2rem', width: '100px', marginBottom: SKELETON_SPACING.lg }} />
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
        <div style={{
          ...skeletonStyle,
          ...SKELETON_SIZES.avatarSm,
          borderRadius: '50%',
          flexShrink: 0
        }} />

        {/* Name + Badge */}
        <div style={{ flex: 1 }}>
          <div style={{ ...skeletonStyle, height: '0.9rem', width: '70%' }} />
        </div>

        {/* Travel Pace */}
        <div style={{
          ...skeletonStyle,
          ...SKELETON_SIZES.travelPace,
          borderRadius: '50%',
          flexShrink: 0
        }} />
      </div>
    ))}
    </div>
  );
};


// ============================================
// MESSAGE BUBBLE SKELETON
// ============================================
export const MessageBubbleSkeleton = ({ isOwn = false }) => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
    marginBottom: SKELETON_SPACING.lg,
    animation: 'fadeIn 0.3s ease-in-out'
  }}>
    <div style={{
      ...skeletonStyle,
      height: SKELETON_SIZES.messageBubble.height,
      width: '45%',
      minWidth: '100px',
      maxWidth: '300px'
    }} />
  </div>
  );
};


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
export const BoxSkeleton = ({ width = '100%', height = '2rem', borderRadius = BASE_BORDER_RADIUS, style = {} }) => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{ ...skeletonStyle, width, height, borderRadius, ...style }} />
  );
};


// ============================================
// STATS CARDS SKELETON
// ============================================
export const StatsCardSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: SKELETON_SPACING.lg }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ ...skeletonStyle, padding: SKELETON_SPACING.xxl, borderRadius: '14px' }}>
          <div style={{ ...skeletonStyle, height: '1rem', marginBottom: SKELETON_SPACING.md, width: '60%' }} />
          <div style={{ ...skeletonStyle, height: '1.8rem', width: '40%' }} />
        </div>
      ))}
    </div>
  );
};

// ============================================
// PHOTO GALLERY SKELETON
// ============================================
export const PhotoGallerySkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden mb-12">
      {/* Gallery Header */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <div style={{ ...skeletonStyle, height: '0.8rem', width: '120px' }} />
      </div>

      {/* Gallery Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Trip Group 1 */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Trip Header */}
          <div style={{ ...skeletonStyle, height: '2rem', marginBottom: '1rem', width: '180px', borderRadius: '8px' }} />
          
          {/* Photos Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ ...skeletonStyle, aspectRatio: '1', borderRadius: '8px' }} />
            ))}
          </div>
        </div>

        {/* Trip Group 2 */}
        <div>
          {/* Trip Header */}
          <div style={{ ...skeletonStyle, height: '2rem', marginBottom: '1rem', width: '200px', borderRadius: '8px' }} />
          
          {/* Photos Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ ...skeletonStyle, aspectRatio: '1', borderRadius: '8px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// DASHBOARD HEADER SKELETON
// ============================================
export const DashboardHeaderSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{ marginBottom: SKELETON_SPACING.xxxl }}>
      {/* Greeting line */}
      <div style={{ ...skeletonStyle, height: '2.2rem', width: '50%', marginBottom: SKELETON_SPACING.md, borderRadius: '12px' }} />
      {/* Subtext line */}
      <div style={{ ...skeletonStyle, height: '0.9rem', width: '65%', borderRadius: '8px' }} />
    </div>
  );
};

// ============================================
// DASHBOARD TABS SKELETON
// ============================================
export const DashboardTabsSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <div style={{ display: 'flex', gap: SKELETON_SPACING.md, marginBottom: SKELETON_SPACING.xxl }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ ...skeletonStyle, height: '2.5rem', width: '120px', borderRadius: '10px' }} />
      ))}
    </div>
  );
};

// ============================================
// DASHBOARD SEARCH & FILTER SKELETON
// ============================================
export const DashboardSearchFilterSkeleton = () => {
  const skeletonStyle = getSkeletonStyle();
  return (
    <>
      {/* Search Bar */}
      <div style={{ marginBottom: SKELETON_SPACING.lg }}>
        <div style={{ ...skeletonStyle, height: '2.5rem', borderRadius: '12px' }} />
      </div>
      
      {/* Filter Button */}
      <div style={{ marginBottom: SKELETON_SPACING.lg }}>
        <div style={{ ...skeletonStyle, height: '2rem', width: '200px', borderRadius: '8px' }} />
      </div>
    </>
  );
};

// ============================================
// DASHBOARD COMPLETE LOADING SKELETON
// ============================================
export const DashboardLoadingSkeleton = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'inherit',
      padding: '2.5rem 1.5rem 4rem',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
        <DashboardHeaderSkeleton />
        
        {/* Stats */}
        <div style={{ marginBottom: SKELETON_SPACING.xxxl }}>
          <StatsCardSkeleton />
        </div>
        
        {/* Tabs */}
        <DashboardTabsSkeleton />
        
        {/* Search & Filter */}
        <DashboardSearchFilterSkeleton />
        
        {/* Trips Grid */}
        <div>
          <TripsGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
};
