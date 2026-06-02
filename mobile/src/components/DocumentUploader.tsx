import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, useColorScheme, LayoutAnimation } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { apiClient } from '../api/client';

interface UploaderProps {
  onUploadSuccess: (documentId: string) => void;
}

export default function DocumentUploader({ onUploadSuccess }: UploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dark Mode detection
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Dynamic Theme Colors
  const theme = {
    background: isDark ? '#000000' : '#F2F2F7',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    subtext: isDark ? '#98989D' : '#8E8E93',
    border: isDark ? '#38383A' : '#D1D1D6',
    zoneBg: isDark ? '#2C2C2E' : '#FAFAFC',
    iconBg: isDark ? '#004080' : '#E5F1FF',
    errorBg: isDark ? '#4A1115' : '#FFEBE9',
    errorText: isDark ? '#FF6961' : '#FF3B30',
  };

  const handleUpload = async () => {
    // Haptic feedback on tap
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Smoothly animate the UI if an error disappears or loading starts
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setError(null);
    
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/plain', 'text/markdown'], 
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return; // User cancelled
      }

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsUploading(true);
      const file = result.assets[0];

      const formData = new FormData();

      if (Platform.OS === 'web' && file.file) {
        formData.append('file', file.file as any);
      } else {
        formData.append('file', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name,
          type: file.mimeType || 'text/plain',
        } as any);
      }

      const response = await apiClient.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Haptic success!
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUploadSuccess(response.data.id);
      
    } catch (err: any) {
      console.error('Upload Error:', err);
      // Haptic error
      if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const errorMessage = err.response?.data?.message || 'Failed to upload the file. Ensure your backend is running.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: isDark ? '#000' : '#000' }]}>
        <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
          <Ionicons name="cloud-upload-outline" size={48} color="#007AFF" />
        </View>
        
        <Text style={[styles.title, { color: theme.text }]}>Upload Knowledge Base</Text>
        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Select a text or markdown file to provide context for the AI.
        </Text>

        <TouchableOpacity 
          style={[
            styles.uploadZone, 
            { borderColor: theme.border, backgroundColor: theme.zoneBg },
            isUploading && styles.uploadZoneDisabled
          ]} 
          onPress={handleUpload}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          {isUploading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Processing Document...</Text>
            </View>
          ) : (
            <View style={styles.idleState}>
              <Ionicons name="document-attach" size={32} color={theme.subtext} />
              <Text style={styles.uploadText}>Tap to browse files</Text>
              <Text style={[styles.fileHint, { color: theme.subtext }]}>Supports .txt and .md</Text>
            </View>
          )}
        </TouchableOpacity>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: theme.errorBg }]}>
            <Ionicons name="warning" size={16} color={theme.errorText} />
            <Text style={[styles.errorText, { color: theme.errorText }]}>{error}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  uploadZone: {
    width: '100%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  uploadZoneDisabled: {
    opacity: 0.6,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
    width: '100%',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});