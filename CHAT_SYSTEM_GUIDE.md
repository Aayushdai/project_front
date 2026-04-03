# Chat System Implementation Guide

## Overview
A complete real-time chat system has been integrated into the Travel Nepal map explorer. Users can now:
- Chat directly with friends
- Participate in group chats within trip groups
- See conversation lists with avatars and member counts
- Send/receive messages with timestamps

## Features

### 1. **Chat Tab**
Located in the sidebar alongside Route, Nearby, and Saved tabs.

### 2. **Conversation Types**

#### Direct Messages (Friend-to-Friend)
- One-to-one private conversations
- Shows friend's avatar and name
- Displays last message preview

#### Group Chat (Trip Members)
- Chat with all members in a joined trip
- Shows trip group icon and member count
- Perfect for coordinating trip details

### 3. **Message Features**
- Real-time message sending/receiving
- Message timestamps
- Input validation (empty messages blocked)
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)
- Loading states and error handling
- Message history with auto-scroll

## Frontend Implementation

### New State Variables
```javascript
const [conversations, setConversations] = useState([]);
const [selectedConversation, setSelectedConversation] = useState(null);
const [messages, setMessages] = useState([]);
const [chatLoading, setChatLoading] = useState(false);
const [chatError, setChatError] = useState(null);
const [messageInput, setMessageInput] = useState("");
const [sendingMessage, setSendingMessage] = useState(false);
```

### API Endpoints Used

#### Fetch Conversations
- `GET /users/api/friends/` - Get list of friends
- `GET /trips/api/my-trips/` - Get joined trips

#### Fetch Messages
- `GET /chat/api/messages/?recipient_id={id}` - Direct messages
- `GET /chat/api/messages/?trip_id={id}` - Group messages

#### Send Message
- `POST /chat/api/messages/`
  ```json
  {
    "content": "Message text",
    "receiver_id": 123  // For direct messages
    // OR
    "trip_id": 456      // For group messages
  }
  ```

### UI Components

#### Conversations List
- Scrollable list of all conversations
- Avatar/icon display
- Last message preview
- Unread badge (ready for future implementation)
- Hover effects for better UX

#### Chat Thread
- Back button to return to conversations list
- Message list with auto-scroll capability
- Distinguishes sent vs received messages
  - **Sent**: Gold-tinted, right-aligned
  - **Received**: Subtle gray, left-aligned
- Message timestamps
- Input field with character limit (1000 chars)

## Backend Implementation

### Models
`Message` model with fields:
- `sender` - ForeignKey to UserProfile
- `receiver` - ForeignKey to UserProfile (null for group chat)
- `trip` - ForeignKey to Trip (null for direct messages)
- `content` - TextField
- `timestamp` - DateTimeField (auto_now_add)

### Serializers
`MessageSerializer` includes:
- Sender/receiver name resolution
- Trip name resolution
- `isSent` flag for frontend UI differentiation
- Full timestamp data

### ViewSets & Actions
`MessageViewSet` provides:
1. **create()** - Send new messages (validation for both direct & group)
2. **direct_messages** - `GET /messages/direct_messages/?recipient_id={id}`
3. **group_messages** - `GET /messages/group_messages/?trip_id={id}`

### Validation
- Empty message content blocked
- User must be trip member to send group messages
- Receiver existence verified before saving
- Trip existence and membership verified

## Auto-Refresh Feature
Messages auto-refresh every 3 seconds when a conversation is open:
```javascript
const interval = setInterval(fetchMessages, 3000);
return () => clearInterval(interval);
```

## Future Enhancements

### Could Add:
1. **Real-time WebSocket** - Replace polling with live updates
2. **Typing Indicators** - "User is typing..." feature
3. **Message Reactions** - Emoji reactions to messages
4. **Message Search** - Search within conversations
5. **Unread Badge Count** - Track unread messages
6. **Read Receipts** - Show when messages are read
7. **Audio/Video Chat** - Using WebRTC
8. **File Sharing** - Share photos/documents
9. **Message Persistence** - Load full history on scroll up
10. **User Online Status** - Show who's currently online

## Usage Steps

### For Users

1. **Open Chat Tab**
   - Click "Chat" tab in the sidebar
   
2. **Select a Conversation**
   - Click on a friend or group to open the chat
   
3. **Send a Message**
   - Type message in input field
   - Press Enter or click Send
   - Or Shift+Enter for multiple lines
   
4. **Return to Conversations**
   - Click back arrow (←) to see all conversations
   - Messages auto-refresh every 3 seconds

### For Developers

1. **Update Backend URLs**
   - Ensure `/chat/api/messages/` endpoint is registered in main urls.py

2. **Verify Authentication**
   - All endpoints require Bearer token in Authorization header
   - Token is stored in localStorage as `access_token`

3. **Error Handling**
   - Network errors show in `chatError` state
   - UI disables input during message send (`sendingMessage` flag)
   - Loading states while fetching conversations

4. **Testing**
   - Create test users and mark as KYC approved
   - Add users as friends
   - Create a trip and add members
   - Open Chat tab and verify conversation loading
   - Send/receive messages and verify display

## Styling Notes

All chat UI follows existing design system:
- **Colors**: `#f0c27a` (gold), `#0f0e0d` (dark), `rgba(255,255,255,0.XX)` (transparency)
- **Typography**: Syne (headers), DM Sans (body)
- **Spacing**: 8-16px gaps
- **Animations**: fade-in (.2s ease) on conversation load
- **Responsive**: Sidebar width aware, adapts to 345px or 0px

## Dependencies
- React 18+
- React Router (for useLocation)
- Existing authentication system with localStorage tokens
- Backend API with proper CORS configuration

## Notes
- Currently polling for messages (3s interval), not WebSocket
- Requires proper CORS headers from backend
- KYC status doesn't affect chat access (only route planning)
- Both direct and group messages use same Message model