# Connect Mobile App to Backend - SIMPLE STEPS

## ✅ Step 1: Already Done - API Functions Added

Chat API is now in `/mobile/src/services/api.ts`:
- `chatAPI.getConversations()` - Get all chats
- `chatAPI.getMessages(conversationId)` - Get messages
- `chatAPI.sendMessage(conversationId, content)` - Send message

## 🔧 Step 2: Update ChatListScreen

**File**: `/mobile/src/screens/ChatListScreen.tsx`

**Add these imports** (line 1):
```typescript
import { chatAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
```

**Add loading state** (after line 112):
```typescript
const [loading, setLoading] = useState(true);
```

**Add this function** (after line 113):
```typescript
// Load real conversations from backend
const loadConversations = async () => {
  try {
    setLoading(true);
    const data = await chatAPI.getConversations();
    console.log('Loaded conversations:', data);

    // Transform backend data to match UI format
    const transformedChats = data.map((conv: any) => {
      const otherUser = conv.participants.find((p: any) => p.id !== 1); // Replace 1 with current user ID
      return {
        id: conv.id.toString(),
        user: otherUser || conv.participants[0],
        last_message: conv.last_message || {
          content: 'No messages yet',
          timestamp: conv.created_at,
          is_read: true,
          sender_id: 0,
        },
        unread_count: conv.unread_count || 0,
      };
    });

    setChats(transformedChats);
    setFilteredChats(transformedChats);
  } catch (error) {
    console.error('Failed to load conversations:', error);
    // Keep fake data on error
  } finally {
    setLoading(false);
  }
};
```

**Add useEffect** (after loadConversations function):
```typescript
// Load conversations when screen appears
useFocusEffect(
  React.useCallback(() => {
    loadConversations();
  }, [])
);
```

**Show loading indicator** (replace the FlatList with):
```typescript
{loading ? (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading conversations...</Text>
  </View>
) : (
  <FlatList
    data={filteredChats}
    renderItem={renderChatItem}
    keyExtractor={(item) => item.id}
    contentContainerStyle={styles.listContent}
    ItemSeparatorComponent={() => <View style={styles.separator} />}
  />
)}
```

## 🔧 Step 3: Update ChatScreen

**File**: `/mobile/src/screens/ChatScreen.tsx`

**Add import** (top of file):
```typescript
import { chatAPI } from '../services/api';
```

**Add state** (after existing useState):
```typescript
const [conversationId, setConversationId] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
```

**Add load messages function** (after existing functions):
```typescript
const loadMessages = async (convId: string) => {
  try {
    setLoading(true);
    const data = await chatAPI.getMessages(convId);
    console.log('Loaded messages:', data);
    setMessages(data);
  } catch (error) {
    console.error('Failed to load messages:', error);
  } finally {
    setLoading(false);
  }
};
```

**Add useEffect** (after loadMessages):
```typescript
useEffect(() => {
  if (chatId) {
    setConversationId(chatId);
    loadMessages(chatId);
  }
}, [chatId]);
```

**Update handleSend** (replace existing handleSend):
```typescript
const handleSend = async () => {
  if (inputText.trim().length === 0 || !conversationId) return;

  const tempId = Date.now().toString();
  const tempMessage = {
    id: tempId,
    content: inputText.trim(),
    sender: { id: 1, username: 'You' }, // Replace with current user
    sender_id: 1,
    timestamp: new Date().toISOString(),
    created_at: new Date().toISOString(),
    is_read: false,
    message_type: 'text',
  };

  // Optimistic UI update
  setMessages([...messages, tempMessage]);
  const messageContent = inputText.trim();
  setInputText('');

  try {
    const savedMessage = await chatAPI.sendMessage(conversationId, messageContent, 'text');
    console.log('Message sent:', savedMessage);

    // Replace temp message with real one
    setMessages(prev =>
      prev.map(msg => msg.id === tempId ? savedMessage : msg)
    );
  } catch (error) {
    console.error('Failed to send message:', error);
    // Remove temp message on error
    setMessages(prev => prev.filter(msg => msg.id !== tempId));
    Alert.alert('Error', 'Failed to send message');
  }
};
```

## 🚀 Step 4: Test It!

1. **Start backend** (if not running):
```bash
cd backend/impactnet
source ../.venv/bin/activate
python manage.py runserver
```

2. **Create test data**:
```bash
python TEST_CHAT.py
```

3. **Open mobile app** - You should see:
   - Real conversations from database
   - Real messages when you click
   - Messages persist after navigation
   - New messages save to database

## 🐛 If Something Breaks:

1. Check backend is running: `http://127.0.0.1:8000`
2. Check API endpoint: `http://127.0.0.1:8000/api/chat/conversations/`
3. Look at mobile console for errors
4. Check backend logs for errors

## ✅ Success Criteria:

- [ ] ChatList loads conversations from database
- [ ] Click conversation opens real messages
- [ ] Send message saves to database
- [ ] Navigate away and back - messages still there
- [ ] Run TEST_CHAT.py - see new conversations appear

That's it! UI is no longer hardcoded!
