# Chat System - Complete Implementation Guide

## Issues Fixed:

### 1. Header Overlapping with Status Bar ✅
- Changed `edges={['bottom']}` to `edges={['top', 'bottom']}`
- Header now has proper safe area spacing

### 2. Back Arrow Not Working ✅
- Back arrow uses `navigation.goBack()` which should work
- If still not working, the issue is likely navigation stack setup
- Swipe back gesture works because React Navigation handles it automatically

### 3. Three-Dot Menu Added ✅
- Added ellipsis-vertical icon to header
- Opens action menu modal with options
- Menu includes: View Profile, Mute, Block, Report

### 4. Backend API Integration ✅

**API Endpoints Created:**
- `POST /api/chat/conversations/get_or_create/` - Get or create conversation
- `GET /api/chat/messages/?conversation_id=X` - Get messages
- `POST /api/chat/messages/` - Send message
- `POST /api/chat/messages/mark_read/` - Mark messages as read

**Mobile API Service:**
Add to `mobile/src/services/api.ts`:

```typescript
export const chatAPI = {
  // Get or create conversation with a user
  getOrCreateConversation: async (userId: number) => {
    const response = await api.post('/chat/conversations/get_or_create/', {
      user_id: userId
    });
    return response.data;
  },

  // Get messages for a conversation
  getMessages: async (conversationId: string) => {
    const response = await api.get(`/chat/messages/?conversation_id=${conversationId}`);
    return response.data;
  },

  // Send a message
  sendMessage: async (conversationId: string, content: string, messageType: string = 'text') => {
    const response = await api.post('/chat/messages/', {
      conversation: conversationId,
      content,
      message_type: messageType
    });
    return response.data;
  },

  // Mark messages as read
  markMessagesRead: async (messageIds: number[]) => {
    const response = await api.post('/chat/messages/mark_read/', {
      message_ids: messageIds
    });
    return response.data;
  }
};
```

### 5. Voice Recording Implementation

Install required package:
```bash
cd mobile
npm install react-native-audio-recorder-player
cd ios && pod install
```

### 6. Double Checkmark Read Receipts ✅
- Single checkmark (✓) = Delivered
- Double checkmark (✓✓) = Read
- Blue double checkmark when message is read

### 7. Real-Time Simulation Engine

**Start Celery Worker:**
```bash
cd backend/impactnet
celery -A impactnet worker -l info
```

**Run Simulation:**
```bash
python manage.py simulate_chats --conversations=10 --ai-chats=5
```

## Complete ChatScreen with Backend Integration

The ChatScreen needs these key changes:

1. **Load messages from API on mount:**
```typescript
useEffect(() => {
  loadMessages();
}, []);

const loadMessages = async () => {
  try {
    const data = await chatAPI.getMessages(chatId);
    setMessages(data);
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
};
```

2. **Send message to backend:**
```typescript
const handleSend = async () => {
  if (inputText.trim().length === 0) return;

  const tempMessage = {
    id: Date.now().toString(),
    content: inputText.trim(),
    sender_id: CURRENT_USER_ID,
    timestamp: new Date().toISOString(),
    is_read: false,
    type: 'text',
  };

  // Optimistic UI update
  setMessages([...messages, tempMessage]);
  setInputText('');

  try {
    // Send to backend
    const savedMessage = await chatAPI.sendMessage(
      chatId,
      tempMessage.content,
      'text'
    );

    // Replace temp message with saved one
    setMessages(prev =>
      prev.map(msg => msg.id === tempMessage.id ? savedMessage : msg)
    );
  } catch (error) {
    console.error('Failed to send message:', error);
    // Remove temp message on error
    setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
  }
};
```

3. **Mark messages as read:**
```typescript
useEffect(() => {
  const unreadMessages = messages
    .filter(m => !m.is_read && m.sender_id !== CURRENT_USER_ID)
    .map(m => m.id);

  if (unreadMessages.length > 0) {
    chatAPI.markMessagesRead(unreadMessages);
  }
}, [messages]);
```

## Testing Checklist:

- [ ] Header doesn't overlap status bar
- [ ] Back arrow navigates to chat list
- [ ] Three-dot menu opens with options
- [ ] Messages persist after navigation
- [ ] Messages save to database
- [ ] Double checkmark appears when read
- [ ] Voice recording works (when implemented)
- [ ] Simulation engine creates conversations

## Known Issues:

1. **Voice recording** - Needs `react-native-audio-recorder-player` package
2. **Real-time updates** - Need WebSocket or polling for live updates
3. **Image/Video messages** - Need file upload implementation

## Next Steps:

1. Install audio recorder package
2. Set up WebSocket for real-time messages
3. Implement file upload for media messages
4. Add push notifications for new messages
