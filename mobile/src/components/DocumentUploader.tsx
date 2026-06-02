import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { apiClient } from '../api/client';

interface UploaderProps {
  onUploadSuccess: (documentId: string) => void;
}

export default function DocumentUploader({ onUploadSuccess }: UploaderProps) {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Open the native file picker (Filters for .txt files)
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain', 
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Failed to pick document:', err);
    }
  };

  // 2. Package the file and send it to your NestJS backend
  const uploadDocument = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();

    // The Cross-Platform Fix: 
    // Web browsers need the raw File object, Mobile needs the URI map
    if (Platform.OS === 'web') {
      formData.append('file', selectedFile.file as Blob);
    } else {
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'text/plain',
      } as any);
    }

    try {
      const response = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Success!', 'File saved securely to your database.');
      setSelectedFile(null); // Clear the UI after success
      
      // Tell the main App that we have a document ready for the AI
      onUploadSuccess(response.data.id);
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Upload Failed', 'Make sure your NestJS backend is running and the IP address is correct.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Document Hub</Text>
      
      {!selectedFile ? (
        <TouchableOpacity style={styles.pickButton} onPress={pickDocument}>
          <Text style={styles.buttonText}>Select .txt File</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.fileCard}>
          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {selectedFile.name}
          </Text>
          <Text style={styles.fileSize}>
            {selectedFile.size ? (selectedFile.size / 1024).toFixed(2) + ' KB' : 'Unknown size'}
          </Text>
          
          <TouchableOpacity 
            style={[styles.uploadButton, isUploading && styles.disabledButton]} 
            onPress={uploadDocument}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Upload to Backend</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={() => setSelectedFile(null)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  pickButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  fileCard: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: '#a1d6b2',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    color: '#FF3B30',
    fontWeight: '500',
  },
});