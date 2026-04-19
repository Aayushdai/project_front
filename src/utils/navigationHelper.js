/**
 * Navigation Helper - Maps user queries to app routes
 * Provides intelligent navigation suggestions for chatbot responses
 */

// Complete routing configuration with metadata
export const ROUTES_CONFIG = [
  // Public Routes
  { path: '/', name: 'Login', keywords: ['login', 'sign in', 'signin'], section: 'auth', requiresAuth: false },
  { path: '/register', name: 'Sign Up', keywords: ['register', 'signup', 'create account', 'sign up'], section: 'auth', requiresAuth: false },
  { path: '/forgot-password', name: 'Password Recovery', keywords: ['forgot password', 'reset password', 'password recovery'], section: 'auth', requiresAuth: false },
  { path: '/about', name: 'About', keywords: ['about', 'what is travel companion'], section: 'info', requiresAuth: false },

  // Private Routes
  { path: '/home', name: 'Home', keywords: ['home', 'dashboard', 'main'], section: 'main', requiresAuth: true },
  { path: '/dashboard', name: 'Dashboard', keywords: ['dashboard', 'overview', 'trips overview'], section: 'main', requiresAuth: true },
  { path: '/profile', name: 'Profile', keywords: ['profile', 'my profile', 'edit profile', 'setup profile'], section: 'user', requiresAuth: true },
  { path: '/settings', name: 'Settings', keywords: ['settings', 'preferences', 'account settings'], section: 'user', requiresAuth: true },
  { path: '/kyc', name: 'KYC Form', keywords: ['kyc', 'verify identity', 'know your customer', 'passport', 'id verification'], section: 'verification', requiresAuth: true },
  { path: '/search', name: 'Search Results', keywords: ['search', 'find trips', 'search trips'], section: 'discovery', requiresAuth: true },
  { path: '/create-trip', name: 'Create Trip', keywords: ['create trip', 'new trip', 'start trip', 'create a trip', 'plan trip'], section: 'trips', requiresAuth: true },
  { path: '/trip-planner', name: 'Trip Planner', keywords: ['trip planner', 'itinerary planner', 'plan itinerary', 'add itinerary'], section: 'trips', requiresAuth: true },
  { path: '/explore', name: 'Explore Destinations', keywords: ['explore', 'destinations', 'browse destinations', 'find destination', 'discover'], section: 'discovery', requiresAuth: true },
  { path: '/chat', name: 'Chat', keywords: ['chat', 'message', 'messages', 'messaging', 'communicate', 'conversation'], section: 'social', requiresAuth: true },

  // Dynamic Routes (need ID/param)
  { path: '/trip/:id', name: 'Trip Details', keywords: ['trip details', 'view trip', 'trip information'], section: 'trips', requiresAuth: true, isDynamic: true },
  { path: '/destination/:id', name: 'Destination', keywords: ['destination details', 'destination information'], section: 'discovery', requiresAuth: true, isDynamic: true },
  { path: '/itinerary/:tripId', name: 'Itinerary', keywords: ['itinerary', 'day by day', 'plan'], section: 'trips', requiresAuth: true, isDynamic: true },
  { path: '/user/:username', name: 'User Profile', keywords: ['user profile', 'traveler profile', 'view profile'], section: 'social', requiresAuth: true, isDynamic: true },

  // Admin Routes
  { path: '/admin', name: 'Admin Dashboard', keywords: ['admin', 'admin dashboard'], section: 'admin', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/kyc', name: 'KYC Management', keywords: ['kyc management', 'kyc admin'], section: 'admin', requiresAuth: true, requiresAdmin: true },
  { path: '/admin/visual', name: 'Analytics', keywords: ['analytics', 'stats', 'statistics'], section: 'admin', requiresAuth: true, requiresAdmin: true },
];

// Build keyword to route index for O(1) lookups
export const buildKeywordIndex = () => {
  const index = new Map();
  ROUTES_CONFIG.forEach(route => {
    route.keywords.forEach(keyword => {
      index.set(keyword, route);
    });
  });
  return index;
};

export const KEYWORD_ROUTE_MAP = buildKeywordIndex();

/**
 * Find the most relevant route for a user query
 * Returns { route, matchType, matchedKeyword }
 */
export const findNavigationRoute = (userQuery) => {
  if (!userQuery) return null;

  const lowerQuery = userQuery.toLowerCase().trim();
  const words = lowerQuery.split(/\s+/).filter(w => w.length > 2);

  // First pass: exact keyword match
  for (const word of words) {
    if (KEYWORD_ROUTE_MAP.has(word)) {
      return {
        route: KEYWORD_ROUTE_MAP.get(word),
        matchType: 'exact',
        matchedKeyword: word
      };
    }
  }

  // Second pass: substring match in keywords
  for (const [keyword, route] of KEYWORD_ROUTE_MAP) {
    if (lowerQuery.includes(keyword)) {
      return {
        route,
        matchType: 'substring',
        matchedKeyword: keyword
      };
    }
  }

  // Third pass: fuzzy match on route names
  for (const route of ROUTES_CONFIG) {
    if (lowerQuery.includes(route.name.toLowerCase())) {
      return {
        route,
        matchType: 'name',
        matchedKeyword: route.name.toLowerCase()
      };
    }
  }

  return null;
};

/**
 * Get routes in a specific category/section
 */
export const getRoutesBySection = (section) => {
  return ROUTES_CONFIG.filter(route => route.section === section);
};

/**
 * Generate a navigation suggestion message with a clickable link
 */
export const generateNavigationLink = (route, userIsAuthenticated = false) => {
  // If route requires auth and user isn't authenticated, can't navigate directly
  if (route.requiresAuth && !userIsAuthenticated) {
    return {
      text: `To access **${route.name}**, you need to log in first. [Go to Login](/)`,
      canNavigate: false,
      route: '/'
    };
  }

  // If route is dynamic, warn user
  if (route.isDynamic) {
    return {
      text: `Visit **${route.name}** to see details about a specific item.`,
      canNavigate: false,
      isDynamic: true
    };
  }

  return {
    text: `Head over to **${route.name}** for that. [Go to ${route.name}](${route.path})`,
    canNavigate: true,
    route: route.path
  };
};

/**
 * Determine if user query is asking for navigation help
 */
export const isNavigationQuery = (userQuery) => {
  const navigationKeywords = [
    'where', 'how do i', 'how to', 'go to', 'take me to', 'find', 
    'navigate', 'navigate to', 'access', 'get to', 'visit'
  ];
  
  const lowerQuery = userQuery.toLowerCase();
  return navigationKeywords.some(keyword => lowerQuery.includes(keyword));
};

/**
 * Get quick navigation suggestions based on user's current context
 */
export const getContextualNavigation = (userContext = {}) => {
  const suggestions = [];

  // If user just logged in / is new
  if (userContext.isNewUser) {
    suggestions.push({
      label: 'Complete KYC',
      route: '/kyc',
      reason: 'Get verified to unlock all features'
    });
    suggestions.push({
      label: 'Setup Profile',
      route: '/profile',
      reason: 'Add travel preferences and interests'
    });
    suggestions.push({
      label: 'Create Your First Trip',
      route: '/create-trip',
      reason: 'Start planning your adventure'
    });
  }

  // If user hasn't completed KYC
  if (userContext.kycStatus === 'pending' || userContext.kycStatus === 'rejected') {
    suggestions.push({
      label: 'Complete KYC',
      route: '/kyc',
      reason: 'Required to chat and join trips'
    });
  }

  // If user has created trips
  if (userContext.hasTrips) {
    suggestions.push({
      label: 'Trip Planner',
      route: '/trip-planner',
      reason: 'Plan day-by-day itineraries'
    });
  }

  // General suggestions
  if (suggestions.length === 0) {
    suggestions.push({
      label: 'Explore Destinations',
      route: '/explore',
      reason: 'Find your next adventure'
    });
    suggestions.push({
      label: 'Find Travel Partners',
      route: '/search',
      reason: 'Match with compatible travelers'
    });
    suggestions.push({
      label: 'Messages',
      route: '/chat',
      reason: 'Connect with other travelers'
    });
  }

  return suggestions;
};

/**
 * Parse navigation from a chatbot message
 * Returns an object with navigation info if found
 */
export const parseNavigationFromMessage = (messageContent) => {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const match = linkRegex.exec(messageContent);
  
  if (match) {
    return {
      text: match[1],
      path: match[2]
    };
  }
  
  return null;
};
