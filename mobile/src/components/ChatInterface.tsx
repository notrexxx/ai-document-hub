import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Ionicons } from '@expo/vector-icons';
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

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await apiClient.post('/chat/ask', { documentId, question: userMessage.text });
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: response.data.answer };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'ai', text: 'Connection error. Make sure your NestJS server is running.' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Sleek Metadata Bar */}
      <View style={styles.metaBar}>
        <View style={styles.metaLeft}>
          <Ionicons name="document-text" size={16} color="#8E8E93" style={{ marginRight: 6 }} />
          <Text style={styles.metaId} numberOfLines={1} ellipsizeMode="middle">
            {documentId}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close-circle" size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 30, paddingTop: 20 }}>
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#D1D1D6" />
            <Text style={styles.placeholderText}>
              Ask anything about the text file you just uploaded!
            </Text>
          </View>
        )}
        
        {messages.map((msg) => (
          <View key={msg.id} style={[styles.messageWrapper, msg.role === 'user' ? styles.userWrapper : styles.aiWrapper]}>
            {msg.role === 'ai' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#FFF" />
              </View>
            )}
            <View style={[styles.messageBubble, msg.role === 'user' ? styles.userBubble : styles.aiBubble]}>
              {msg.role === 'user' ? (
                <Text style={styles.userText}>{msg.text}</Text>
              ) : (
                <Markdown style={markdownStyles}>{msg.text}</Markdown>
              )}
            </View>
          </View>
        ))}
        {isLoading && (
          <View style={styles.loadingWrapper}>
             <ActivityIndicator size="small" color="#007AFF" />
             <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Pill-Shaped Input Row */}
      <View style={styles.inputContainer}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            placeholderTextColor="#8E8E93"
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  metaBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: '#E5E5EA' },
  metaLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 16 },
  metaId: { fontSize: 13, color: '#1C1C1E', fontWeight: '500', flex: 1 },
  closeButton: { padding: 4 },
  chatArea: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, opacity: 0.7 },
  placeholderText: { textAlign: 'center', color: '#8E8E93', marginTop: 12, fontSize: 15, fontWeight: '500', paddingHorizontal: 40 },
  messageWrapper: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  userWrapper: { justifyContent: 'flex-end' },
  aiWrapper: { justifyContent: 'flex-start' },
  aiAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 4 },
  messageBubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4 },
  userText: { color: '#FFFFFF', fontSize: 16, lineHeight: 22 },
  loadingWrapper: { flexDirection: 'row', alignItems: 'center', marginLeft: 36, marginBottom: 20 },
  loadingText: { marginLeft: 8, fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  inputContainer: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderColor: '#E5E5EA' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F7', borderRadius: 24, paddingLeft: 16, paddingRight: 6, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E5EA' },
  input: { flex: 1, fontSize: 16, color: '#1C1C1E', minHeight: 36 },
  sendButton: { backgroundColor: '#007AFF', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  sendButtonDisabled: { backgroundColor: '#A2C9F2' },
});

const markdownStyles = StyleSheet.create({
  body: { color: '#1C1C1E', fontSize: 16, lineHeight: 24 },
  paragraph: { marginTop: 0, marginBottom: 12 },
  strong: { fontWeight: '700', color: '#000' },
  em: { fontStyle: 'italic' },
  code_inline: { backgroundColor: '#F2F2F7', color: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 14, overflow: 'hidden' },
  fence: { backgroundColor: '#1C1C1E', padding: 16, borderRadius: 12, marginTop: 8, marginBottom: 12 },
  code_block: { color: '#F8F8F2', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 },
  list_item: { marginBottom: 6 },
});