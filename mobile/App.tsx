import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, Text, Platform, useColorScheme, UIManager } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DocumentUploader from './src/components/DocumentUploader';
import ChatInterface from './src/components/ChatInterface';

// Enable Layout Animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  
  // Detect System Dark Mode
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Dynamic Theme Colors
  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    border: isDark ? '#38383A' : '#E5E5EA',
    icon: isDark ? '#98989D' : '#8E8E93',
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="cube" size={24} color="#007AFF" style={styles.headerIcon} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>AI Document Hub</Text>
        </View>
        <Ionicons name="settings-outline" size={22} color={theme.icon} />
      </View>

      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {!activeDocumentId ? (
          <DocumentUploader onUploadSuccess={(id) => setActiveDocumentId(id)} />
        ) : (
          <ChatInterface 
            documentId={activeDocumentId} 
            onClose={() => setActiveDocumentId(null)} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 10,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  container: {
    flex: 1,
  },
});