import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../api/client';

interface UploaderProps {
  onUploadSuccess: (documentId: string) => void;
}

export default function DocumentUploader({ onUploadSuccess }: UploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown'], 
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsUploading(true);
      const file = result.assets[0];

      const formData = new FormData();

      // Platform specific upload logic!
      if (Platform.OS === 'web' && file.file) {
        // Web expects the raw HTML5 File object
        formData.append('file', file.file as any);
      } else {
        // Mobile expects the URI object mapping
        formData.append('file', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name,
          type: file.mimeType || 'text/plain',
        } as any);
      }

      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Pass the new document ID up to the App component
      onUploadSuccess(response.data.id);
    } catch (err: any) {
      console.error('Upload Error:', err);
      // Give a more descriptive error if the backend rejects it
      const errorMessage = err.response?.data?.message || 'Failed to upload the file. Ensure your backend is running.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={48} color="#007AFF" />
        </View>
        
        <Text style={styles.title}>Upload Knowledge Base</Text>
        <Text style={styles.subtitle}>
          Select a text or markdown file to provide context for the AI.
        </Text>

        <TouchableOpacity 
          style={[styles.uploadZone, isUploading && styles.uploadZoneDisabled]} 
          onPress={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Processing Document...</Text>
            </View>
          ) : (
            <View style={styles.idleState}>
              <Ionicons name="document-attach" size={32} color="#8E8E93" />
              <Text style={styles.uploadText}>Tap to browse files</Text>
              <Text style={styles.fileHint}>Supports .txt and .md</Text>
            </View>
          )}
        </TouchableOpacity>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5F1FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  uploadZone: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#D1D1D6',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    backgroundColor: '#FAFAFC',
    alignItems: 'center',
  },
  uploadZoneDisabled: {
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
  },
  idleState: {
    alignItems: 'center',
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 12,
    marginBottom: 4,
  },
  fileHint: {
    fontSize: 13,
    color: '#8E8E93',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#007AFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBE9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});