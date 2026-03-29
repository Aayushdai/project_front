# EMOJI REPLACEMENT GUIDE
## Comprehensive Line-by-Line Replacement Instructions

---

## FILE: src/pages/ExploreDestination.jsx
### Total: 28 unique emojis across 38+ lines

#### SECTION A: CATEGORY_MAP Object (Lines 43-71)
This is a JavaScript object mapping place categories to emoji icons and colors. Each needs to be replaced with a lucide-react icon component name.

```javascript
// BEFORE (Lines 43-71):
const CATEGORY_MAP = {
  hotel:            { label:"Hotel",          icon:"🏨", color:"#5b8dee" },
  hostel:           { label:"Hostel",         icon:"🛏",  color:"#7b9fd4" },
  guest_house:      { label:"Guest House",    icon:"🏡", color:"#7b9fd4" },
  attraction:       { label:"Attraction",     icon:"🎯", color:"#f0c27a" },
  viewpoint:        { label:"Viewpoint",      icon:"🔭", color:"#34d399" },
  museum:           { label:"Museum",         icon:"🏛",  color:"#c084fc" },
  artwork:          { label:"Artwork",        icon:"🎨", color:"#c084fc" },
  theme_park:       { label:"Theme Park",     icon:"🎡", color:"#fb7185" },
  zoo:              { label:"Zoo",            icon:"🦁", color:"#fb923c" },
  restaurant:       { label:"Restaurant",     icon:"🍽",  color:"#f87171" },
  cafe:             { label:"Café",           icon:"☕", color:"#fb923c" },
  fast_food:        { label:"Fast Food",      icon:"🍔", color:"#facc15" },
  bar:              { label:"Bar",            icon:"🍺", color:"#a78bfa" },
  place_of_worship: { label:"Temple/Shrine",  icon:"⛩",  color:"#34d399" },
  hospital:         { label:"Hospital",       icon:"🏥", color:"#f43f5e" },
  bank:             { label:"Bank",           icon:"🏦", color:"#60a5fa" },
  pharmacy:         { label:"Pharmacy",       icon:"💊", color:"#4ade80" },
  ruins:            { label:"Ruins",          icon:"🏚",  color:"#a16207" },
  monument:         { label:"Monument",       icon:"🗿", color:"#a16207" },
  memorial:         { label:"Memorial",       icon:"🕯",  color:"#a16207" },
  peak:             { label:"Peak",           icon:"🏔",  color:"#e2e8f0" },
  waterfall:        { label:"Waterfall",      icon:"💧", color:"#38bdf8" },
  cave_entrance:    { label:"Cave",           icon:"🕳",  color:"#94a3b8" },
  supermarket:      { label:"Supermarket",    icon:"🛒", color:"#86efac" },
  mall:             { label:"Mall",           icon:"🏬", color:"#fda4af" },
  park:             { label:"Park",           icon:"🌿", color:"#4ade80" },
  stadium:          { label:"Stadium",        icon:"🏟",  color:"#38bdf8" },
  default:          { label:"Place",          icon:"📍", color:"#f0c27a" },
};

// AFTER - Replace with lucide-react icon names (strings or imports):
import { Building2, Bed, Home, Target, Eye, Building, Palette, Zap, Utensils, Coffee, Beef, Wine, Shrine, Heart, DollarSign, Pill, Landmark, Statue, Flame, Mountain, Droplet, Cave, ShoppingCart, Building, Leaf, Trophy, MapPin, Hotel, Telescope, Library, Smile, Fish, Ambulance, Bank, Pill, Ruins, Monument, Candle, Peak, Waves, CaveIcon } from 'lucide-react';

const CATEGORY_MAP = {
  hotel:            { label:"Hotel",          icon:"Hotel", color:"#5b8dee" },
  hostel:           { label:"Hostel",         icon:"Bed",  color:"#7b9fd4" },
  guest_house:      { label:"Guest House",    icon:"Home", color:"#7b9fd4" },
  attraction:       { label:"Attraction",     icon:"Sparkles", color:"#f0c27a" },
  viewpoint:        { label:"Viewpoint",      icon:"Eye", color:"#34d399" },
  museum:           { label:"Museum",         icon:"Building2", color:"#c084fc" },
  artwork:          { label:"Artwork",        icon:"Palette", color:"#c084fc" },
  theme_park:       { label:"Theme Park",     icon:"Zap", color:"#fb7185" },
  zoo:              { label:"Zoo",            icon:"Zap", color:"#fb923c" },
  restaurant:       { label:"Restaurant",     icon:"UtensilsCrossed", color:"#f87171" },
  cafe:             { label:"Café",           icon:"Coffee", color:"#fb923c" },
  fast_food:        { label:"Fast Food",      icon:"Beef", color:"#facc15" },
  bar:              { label:"Bar",            icon:"Wine", color:"#a78bfa" },
  place_of_worship: { label:"Temple/Shrine",  icon:"Church", color:"#34d399" },
  hospital:         { label:"Hospital",       icon:"Heart", color:"#f43f5e" },
  bank:             { label:"Bank",           icon:"DollarSign", color:"#60a5fa" },
  pharmacy:         { label:"Pharmacy",       icon:"Pill", color:"#4ade80" },
  ruins:            { label:"Ruins",          icon:"Landmark", color:"#a16207" },
  monument:         { label:"Monument",       icon:"Statue", color:"#a16207" },
  memorial:         { label:"Memorial",       icon:"Heart", color:"#a16207" },
  peak:             { label:"Peak",           icon:"Mountain", color:"#e2e8f0" },
  waterfall:        { label:"Waterfall",      icon:"Waves", color:"#38bdf8" },
  cave_entrance:    { label:"Cave",           icon:"Cave", color:"#94a3b8" },
  supermarket:      { label:"Supermarket",    icon:"ShoppingCart", color:"#86efac" },
  mall:             { label:"Mall",           icon:"Building2", color:"#fda4af" },
  park:             { label:"Park",           icon:"Leaf", color:"#4ade80" },
  stadium:          { label:"Stadium",        icon:"Trophy", color:"#38bdf8" },
  default:          { label:"Place",          icon:"MapPin", color:"#f0c27a" },
};
```

**EMOJI REPLACEMENTS MAPPING:**
| Emoji | Lucide Icon | Icon Name | Alternative |
|-------|-----------|-----------|-------------|
| 🏨 | Hotel building | `Hotel` | Building2, Building |
| 🛏 | Bed | `Bed` | Sleep, Rest |
| 🏡 | House | `Home` | House, HomeIcon |
| 🎯 | Target | `Target` | Aim, Bullseye |
| 🔭 | Telescope | `Eye` | EyeIcon, View |
| 🏛 | Library/Museum | `Building2` | Library, Book |
| 🎨 | Artist palette | `Palette` | Palette, Paint |
| 🎡 | Ferris wheel | `Zap` | Sparkles, Zap |
| 🦁 | Lion/Zoo | `Zap` | Animal, Zoo (not in lucide) |
| 🍽 | Utensils | `UtensilsCrossed` | Utensils, Spoon |
| ☕ | Coffee | `Coffee` | CoffeeIcon |
| 🍔 | Hamburger | `Beef` | Zap, DollarSign |
| 🍺 | Beer/Bar | `Wine` | Beaker, Bar (custom) |
| ⛩ | Shrine/Temple | `Church` | Home, Temple (custom) |
| 🏥 | Hospital | `Heart` | Cross, HealthIcon (custom) |
| 🏦 | Bank | `DollarSign` | Wallet, Bank (custom) |
| 💊 | Pharmacy pill | `Pill` | Activity, Health |
| 🏚 | Ruins | `Landmark` | Ruin (custom), Landmark |
| 🗿 | Statue | `Statue` | Square, Columns (custom) |
| 🕯 | Candle/Memorial | `Heart` | Flame, Candle (custom) |
| 🏔 | Mountain peak | `Mountain` | Mountains, Zap |
| 💧 | Water drop | `Waves` | Droplet, Water |
| 🕳 | Cave/Hole | `Cave` | Tunnel, Cave (custom) |
| 🛒 | Shopping cart | `ShoppingCart` | Cart, Bag |
| 🏬 | Shopping mall | `Building2` | Shop, Mall (custom) |
| 🌿 | Plant/Park | `Leaf` | Leaf, Tree |
| 🏟 | Stadium | `Trophy` | Award, Smile |
| 📍 | Location pin | `MapPin` | Marker, Navigation |

---

#### SECTION B: FILTERS Array (Lines 75-85)
```javascript
// BEFORE:
const FILTERS = [
  { key:"all",             label:"All",         icon:"🗺" },
  { key:"Temple/Shrine",   label:"Temples",     icon:"⛩" },
  { key:"Attraction",      label:"Attractions", icon:"🎯" },
  { key:"Viewpoint",       label:"Viewpoints",  icon:"🔭" },
  { key:"Restaurant",      label:"Food",        icon:"🍽" },
  { key:"Hotel",           label:"Hotels",      icon:"🏨" },
  { key:"Peak",            label:"Peaks",       icon:"🏔" },
  { key:"Museum",          label:"Museums",     icon:"🏛" },
  { key:"Waterfall",       label:"Waterfalls",  icon:"💧" },
  { key:"Ruins",           label:"Heritage",    icon:"🏚" },
];

// AFTER:
const FILTERS = [
  { key:"all",             label:"All",         icon:"Map" },
  { key:"Temple/Shrine",   label:"Temples",     icon:"Church" },
  { key:"Attraction",      label:"Attractions", icon:"Sparkles" },
  { key:"Viewpoint",       label:"Viewpoints",  icon:"Eye" },
  { key:"Restaurant",      label:"Food",        icon:"UtensilsCrossed" },
  { key:"Hotel",           label:"Hotels",      icon:"Hotel" },
  { key:"Peak",            label:"Peaks",       icon:"Mountain" },
  { key:"Museum",          label:"Museums",     icon:"Building2" },
  { key:"Waterfall",       label:"Waterfalls",  icon:"Waves" },
  { key:"Ruins",           label:"Heritage",    icon:"Landmark" },
];
```

**FILTERS EMOJI REPLACEMENTS:**
| Emoji | Location | Lucide Icon |
|-------|----------|------------|
| 🗺 | All places | `Map` |
| ⛩ | Temples | `Church` |
| 🎯 | Attractions | `Sparkles` |
| 🔭 | Viewpoints | `Eye` |
| 🍽 | Food | `UtensilsCrossed` |
| 🏨 | Hotels | `Hotel` |
| 🏔 | Peaks | `Mountain` |
| 🏛 | Museums | `Building2` |
| 💧 | Waterfalls | `Waves` |
| 🏚 | Ruins/Heritage | `Landmark` |

---

#### SECTION C: Button Labels (Line 491)
```javascript
// BEFORE (Line 491):
<button style={S.ctrlBtn} onClick={() => map.fitBounds(getNepalBounds(), { padding:[20,20] })} title="Fit Nepal">
  🇳🇵
</button>

// AFTER - Use Flag icon or text:
import { Flag } from 'lucide-react';

<button style={S.ctrlBtn} onClick={() => map.fitBounds(getNepalBounds(), { padding:[20,20] })} title="Fit Nepal">
  <Flag size={20} /> {/* or */}
  {"🇳🇵"} {/* Keep emoji if you prefer */}
  {/* or text: */}
  NP
</button>
```

**RECOMMENDATION:** Keep the 🇳🇵 emoji for flags as there's no perfect lucide-react replacement, OR use two-letter country code "NP"

---

#### SECTION D: Header Branding (Line 698)
```javascript
// BEFORE (Line 698):
🇳🇵 Travel <span style={{ color:"#f0c27a" }}>Nepal</span>

// AFTER:
<span style={{ fontSize: "1.5em" }}>🇳🇵</span> Travel <span style={{ color:"#f0c27a" }}>Nepal</span>
// OR with icon:
import { Globe } from 'lucide-react';
<Globe size={24} /> Travel <span style={{ color:"#f0c27a" }}>Nepal</span>
// OR just text:
Travel Nepal
```

---

#### SECTION E: Accuracy Display (Line 917)
```javascript
// BEFORE (Line 917):
📍 Accuracy: ±{liveAcc}m

// AFTER:
import { MapPin } from 'lucide-react';
<MapPin size={16} /> Accuracy: ±{liveAcc}m
```

---

## FILE: src/pages/Home.jsx
### Total: 2 emojis (1 unique)

#### Location Pin in Dropdown (Line 104)
```javascript
// BEFORE:
<span className="text-lg">📍</span>

// AFTER:
import { MapPin } from 'lucide-react';
<MapPin className="text-lg w-5 h-5" />
```

#### Large Location Pin in Card (Line 160)
```javascript
// BEFORE:
<span className="text-5xl">📍</span>

// AFTER:
import { MapPin } from 'lucide-react';
<MapPin className="text-5xl" size={80} /> {/* text-5xl = roughly 3rem */}
{/* or */}
<div style={{ fontSize: '3rem' }}>
  <MapPin size={48} />
</div>
```

---

## FILE: src/components/ChatbotWidget.jsx
### Total: 1 emoji instance

#### Chat Widget Title (Line 131)
```javascript
// BEFORE (Line 131):
<div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f0e0d" }}>
  🇳🇵 Travel Assistant
</div>

// AFTER - Option 1: Keep emoji
<div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f0e0d" }}>
  🇳🇵 Travel Assistant
</div>

// AFTER - Option 2: Use icon
import { Globe } from 'lucide-react';
<div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f0e0d", display: 'flex', alignItems: 'center', gap: '8px' }}>
  <Globe size={16} />
  Travel Assistant
</div>

// AFTER - Option 3: Just text
<div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f0e0d" }}>
  Travel Assistant
</div>
```

**RECOMMENDATION:** Option 1 (keep flag emoji) - looks good and recognizable for app branding

---

## FILE: src/pages/DestinationDetail.jsx
### Total: 1 emoji

#### Location Display (Line 175)
```javascript
// BEFORE (Line 175):
📍 {destination.location}

// AFTER:
import { MapPin } from 'lucide-react';
<MapPin size={16} className="inline" /> {destination.location}
{/* or */}
<span className="inline-flex items-center gap-1">
  <MapPin size={16} />
  {destination.location}
</span>
```

---

## IMPLEMENTATION STEPS

### Step 1: Add Lucide-React Imports
At the top of **src/pages/ExploreDestination.jsx**, add:
```javascript
import {
  Hotel, Bed, Home, Target, Eye, Building2, Palette, Sparkles,
  UtensilsCrossed, Coffee, Church, Wine, Heart, DollarSign, Pill,
  Landmark, Mountain, Waves, ShoppingCart, Leaf, Trophy, MapPin,
  Map, Globe, Flag
} from 'lucide-react';
```

### Step 2: Update Icon Rendering
In your component's JSX, change from string emoji to React component:

**If icon is used as a string:**
```javascript
// Check how icons are currently rendered
// Usually something like:
{someObject.icon} // This won't work with component names

// Change to:
const IconComponent = ICONS[someObject.icon];
<IconComponent size={24} color={someObject.color} />
```

**Or update the object structure:**
```javascript
import { Hotel, Bed, Home } from 'lucide-react';

const CATEGORY_MAP = {
  hotel: {
    label: "Hotel",
    Icon: Hotel, // Use component directly
    color: "#5b8dee"
  },
  hostel: {
    label: "Hostel",
    Icon: Bed,
    color: "#7b9fd4"
  },
  // ... rest
};

// Then render as:
{CATEGORY_MAP[category].Icon && (
  <CATEGORY_MAP[category].Icon size={24} color={CATEGORY_MAP[category].color} />
)}
```

### Step 3: Similar Updates for Other Files
Repeat Steps 1-2 for Home.jsx, ChatbotWidget.jsx, and DestinationDetail.jsx

### Step 4: Test
- Visual tests on all map views
- Test filter buttons
- Test responsive behavior
- Verify colors render correctly with new icons

---

## QUICK EMOJI REFERENCE TABLE

For quick copy-paste during replacement:

| Emoji | Use | File | Line | Replacement |
|-------|-----|------|------|-------------|
| 🏨 | Hotel | ExploreDestination.jsx | 44, 80 | Hotel |
| 🛏 | Hostel | ExploreDestination.jsx | 46 | Bed |
| 🏡 | Guest House | ExploreDestination.jsx | 47 | Home |
| 🎯 | Attraction | ExploreDestination.jsx | 48, 77 | Sparkles |
| 🔭 | Viewpoint | ExploreDestination.jsx | 49, 78 | Eye |
| 🏛 | Museum | ExploreDestination.jsx | 50, 82 | Building2 |
| 🎨 | Artwork | ExploreDestination.jsx | 50 | Palette |
| 🎡 | Theme Park | ExploreDestination.jsx | 52 | Sparkles |
| 🦁 | Zoo | ExploreDestination.jsx | 53 | Zap |
| 🍽 | Restaurant | ExploreDestination.jsx | 54, 79 | UtensilsCrossed |
| ☕ | Cafe | ExploreDestination.jsx | 55 | Coffee |
| 🍔 | Fast Food | ExploreDestination.jsx | 56 | Beef |
| 🍺 | Bar | ExploreDestination.jsx | 57 | Wine |
| ⛩ | Temple | ExploreDestination.jsx | 58, 76 | Church |
| 🏥 | Hospital | ExploreDestination.jsx | 59 | Heart |
| 🏦 | Bank | ExploreDestination.jsx | 60 | DollarSign |
| 💊 | Pharmacy | ExploreDestination.jsx | 61 | Pill |
| 🏚 | Ruins | ExploreDestination.jsx | 62, 85 | Landmark |
| 🗿 | Monument | ExploreDestination.jsx | 63 | Landmark |
| 🕯 | Memorial | ExploreDestination.jsx | 64 | Heart |
| 🏔 | Peak | ExploreDestination.jsx | 65, 81 | Mountain |
| 💧 | Waterfall | ExploreDestination.jsx | 66, 83 | Waves |
| 🕳 | Cave | ExploreDestination.jsx | 67 | Cave |
| 🛒 | Supermarket | ExploreDestination.jsx | 68 | ShoppingCart |
| 🏬 | Mall | ExploreDestination.jsx | 69 | Building2 |
| 🌿 | Park | ExploreDestination.jsx | 70 | Leaf |
| 🏟 | Stadium | ExploreDestination.jsx | 71 | Trophy |
| 📍 | Location/Pin | ExploreDestination.jsx, Home.jsx, DestinationDetail.jsx | 71, 104, 160, 175, 917 | MapPin |
| 🗺 | Map | ExploreDestination.jsx | 75 | Map |
| 🇳🇵 | Nepal Flag | ExploreDestination.jsx, ChatbotWidget.jsx | 131, 491, 698 | Keep emoji or "NP" text |

---

**Total Changes Required:** 38 lines  
**Estimated Time:** 1-2 hours  
**Difficulty:** LOW-MEDIUM  
**Risk:** LOW (purely cosmetic change)

