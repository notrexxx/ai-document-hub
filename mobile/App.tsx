import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, View, Text } from 'react-native';
import DocumentUploader from './src/components/DocumentUploader';
import ChatInterface from './src/components/ChatInterface';

export default function App() {
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Document Hub</Text>
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
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});