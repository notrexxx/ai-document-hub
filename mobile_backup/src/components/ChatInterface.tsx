import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView, useColorScheme, LayoutAnimation, Keyboard } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { apiClient } from '../api/client';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

interface ChatProps {
  documentId: string;
  onClose: () => void;
}

export default function ChatInterface({ documentId, onClose }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref for Smart Scrolling
  const scrollViewRef = useRef<ScrollView>(null);

  // Dark Mode detection
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Dynamic Colors
  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    subtext: isDark ? '#98989D' : '#8E8E93',
    border: isDark ? '#38383A' : '#E5E5EA',
    bubbleAi: isDark ? '#2C2C2E' : '#FFFFFF',
    codeBg: isDark ? '#38383A' : '#F2F2F7',
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Haptic pop when hitting send
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Smoothly animate the new bubble sliding in
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/ask', { documentId, question: userMessage.text });
      
      // Haptic success tick
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: 'Connection error. Ensure backend is running.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <View style={[styles.metaBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.metaLeft, { backgroundColor: theme.background }]}>
          <Ionicons name="document-text" size={16} color={theme.subtext} style={{ marginRight: 6 }} />
          <Text style={[styles.metaId, { color: theme.text }]} numberOfLines={1} ellipsizeMode="middle">{documentId}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close-circle" size={24} color={theme.subtext} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.chatArea} 
        contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss} // Smart Keyboard dismissal
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })} // Smart Auto-scroll
      >
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color={theme.border} />
            <Text style={[styles.placeholderText, { color: theme.subtext }]}>Ask anything about the text file you just uploaded!</Text>
          </View>
        )}
        
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.userWrapper : styles.aiWrapper]}>
            {msg.role === 'ai' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFF" />
              </View>
            )}
            <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : [styles.aiBubble, { backgroundColor: theme.bubbleAi }]]}>
              {msg.role === 'user' ? (
                <Text style={styles.userText}>{msg.text}</Text>
              ) : (
                <Markdown style={createMarkdownStyles(theme)}>{msg.text}</Markdown>
              )}
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingWrapper}>
             <ActivityIndicator size="small" color="#007AFF" />
             <Text style={[styles.loadingText, { color: theme.subtext }]}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Type your question..."
            placeholderTextColor={theme.subtext}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage} 
            disabled={isLoading || !inputText.trim()}
          >
            <Ionicons name="arrow-up" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Generate markdown styles dynamically based on the theme
const createMarkdownStyles = (theme: any) => StyleSheet.create({
  body: { color: theme.text, fontSize: 16, lineHeight: 24 },
  paragraph: { marginTop: 0, marginBottom: 12 },
  strong: { fontWeight: '700', color: theme.text },
  em: { fontStyle: 'italic' },
  code_inline: { backgroundColor: theme.codeBg, color: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, overflow: 'hidden' },
  fence: { backgroundColor: '#1C1C1E', padding: 16, borderRadius: 12, marginTop: 8, marginBottom: 12 },
  code_block: { color: '#F8F8F2', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  list_item: { marginBottom: 6 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  metaBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  metaLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 16 },
  metaId: { fontSize: 13, fontWeight: '500', flex: 1 },
  closeButton: { padding: 4 },
  chatArea: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, opacity: 0.7 },
  placeholderText: { textAlign: 'center', marginTop: 12, fontSize: 15, fontWeight: '500', paddingHorizontal: 40 },
  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 4 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  aiBubble: { borderBottomLeftRadius: 4 },
  userText: { color: '#FFFFFF', fontSize: 16, lineHeight: 22 },
  loadingWrapper: { flexDirection: 'row', alignItems: 'center', marginLeft: 36, marginBottom: 20 },
  loadingText: { marginLeft: 8, fontSize: 13, fontWeight: '500' },
  inputContainer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, borderWidth: 1 },
  input: { flex: 1, fontSize: 16, minHeight: 36 },
  sendButton: { backgroundColor: '#007AFF', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendButtonDisabled: { backgroundColor: '#A2C9F2' },
});