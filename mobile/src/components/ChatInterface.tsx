import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
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

    // 1. Add user message to the local UI immediately
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      text: inputText 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 2. Query your NestJS backend (which routes to Llama)
      const response = await apiClient.post('/chat/ask', {
        documentId,
        question: userMessage.text,
      });

      // 3. Append the AI response to the message timeline
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: response.data.answer,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: 'Connection error. Make sure your NestJS server is running.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Active Document Metadata Bar */}
      <View style={styles.metaBar}>
        <View style={styles.metaLeft}>
          <Text style={styles.metaLabel}>Active Context:</Text>
          <Text style={styles.metaId} numberOfLines={1} ellipsizeMode="middle">
            {documentId}
          </Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Change File</Text>
        </TouchableOpacity>
      </View>

      {/* Message Feed Container */}
      <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.length === 0 && (
          <Text style={styles.placeholderText}>
            Ask anything about the text file you just uploaded!
          </Text>
        )}
        
        {messages.map((msg) => (
          <View 
            key={msg.id} 
            style={[
              styles.messageBubble, 
              msg.role === 'user' ? styles.userBubble : styles.aiBubble
            ]}
          >
            <Text style={[styles.messageText, msg.role === 'user' ? styles.userText : styles.aiText]}>
              {msg.text}
            </Text>
          </View>
        ))}
        {isLoading && <ActivityIndicator style={styles.loader} color="#007AFF" />}
      </ScrollView>

      {/* Persistent Input Bar */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={isLoading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: '100%', 
    backgroundColor: '#fff' 
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  metaLeft: {
    flex: 1,
    marginRight: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  metaId: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 12,
    fontWeight: '600',
  },
  chatArea: { 
    flex: 1, 
    padding: 16 
  },
  placeholderText: { 
    textAlign: 'center', 
    color: '#999', 
    marginTop: 40, 
    fontStyle: 'italic',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  messageBubble: { 
    maxWidth: '85%', 
    padding: 12, 
    borderRadius: 16, 
    marginBottom: 12 
  },
  userBubble: { 
    alignSelf: 'flex-end', 
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  aiBubble: { 
    alignSelf: 'flex-start', 
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 20 
  },
  userText: { 
    color: '#fff' 
  },
  aiText: { 
    color: '#222' 
  },
  loader: { 
    marginTop: 10, 
    alignSelf: 'flex-start',
    marginLeft: 10
  },
  inputRow: { 
    flexDirection: 'row', 
    padding: 12, 
    borderTopWidth: 1, 
    borderColor: '#eee', 
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  input: { 
    flex: 1, 
    backgroundColor: '#f9f9f9', 
    paddingVertical: 10,
    paddingHorizontal: 16, 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    marginRight: 10,
    fontSize: 15,
    color: '#333'
  },
  sendButton: { 
    backgroundColor: '#007AFF', 
    paddingVertical: 10, 
    paddingHorizontal: 18, 
    borderRadius: 24 
  },
  sendButtonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 15
  }
});