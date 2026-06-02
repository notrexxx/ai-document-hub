import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DocumentUploader from './src/components/DocumentUploader';
import ChatInterface from './src/components/ChatInterface';

export default function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="cube" size={24} color="#007AFF" style={styles.headerIcon} />
          <Text style={styles.headerTitle}>AI Document Hub</Text>
        </View>
        <Ionicons name="settings-outline" size={22} color="#8E8E93" />
      </View>

      <View style={styles.container}>
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
    backgroundColor: '#F2F2F7', // iOS standard background
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  container: {
    flex: 1,
  },
});