import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { verifyTaskPhoto } from '../lib/claude';
import { uploadProofPhoto } from '../lib/storage';
import type { Task } from '../lib/claude';

type Props = {
  task: Task | null;
  userId: string;
  onVerified: (taskId: number, photoUrl: string, message: string) => void;
  onClose: () => void;
};

type State = 'idle' | 'uploading' | 'verifying' | 'success' | 'failed';

export default function ProofModal({ task, userId, onVerified, onClose }: Props) {
  const [state, setState] = useState<State>('idle');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState('');

  if (!task) return null;

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access in your phone settings to upload proof.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await processPhoto(result.assets[0].uri, result.assets[0].base64 ?? null);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.3,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await processPhoto(result.assets[0].uri, result.assets[0].base64 ?? null);
    }
  };

  const processPhoto = async (uri: string, base64: string | null) => {
    setPhotoUri(uri);

    if (!base64) {
      setState('failed');
      setResultMessage('Could not read photo data. Try again.');
      return;
    }

    const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

    setState('uploading');
    let photoUrl = '';

    try {
      photoUrl = await uploadProofPhoto(userId, task.id, uri);
    } catch (e: any) {
      setState('failed');
      setResultMessage(`Upload failed: ${e.message}`);
      return;
    }

    setState('verifying');

    try {
      const result = await verifyTaskPhoto(task.title, cleanBase64 ?? '');
      setResultMessage(result.message);

      if (result.verified) {
        setState('success');
        onVerified(task.id, photoUrl, result.message);
      } else {
        setState('failed');
      }
    } catch (e: any) {
      setState('failed');
      setResultMessage(`Verification failed: ${e.message}`);
    }
  };

  const reset = () => {
    setPhotoUri(null);
    setState('idle');
    setResultMessage('');
  };

  return (
    <Modal visible={!!task} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* Handle bar */}
          <View style={s.handle} />

          {/* Task info */}
          <View style={s.taskRow}>
            <Text style={s.taskEmoji}>{task.emoji}</Text>
            <View>
              <Text style={s.taskLabel}>Proving:</Text>
              <Text style={s.taskTitle}>{task.title}</Text>
            </View>
          </View>

          {/* IDLE — choose how to upload */}
          {state === 'idle' && (
            <View style={s.actions}>
              <Text style={s.instructions}>Take a photo that shows you completed this task. Claude AI will verify it.</Text>
              <TouchableOpacity style={s.primaryBtn} onPress={openCamera} activeOpacity={0.85}>
                <Text style={s.primaryBtnIcon}>📸</Text>
                <Text style={s.primaryBtnText}>Take a photo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.secondaryBtn} onPress={openGallery} activeOpacity={0.85}>
                <Text style={s.secondaryBtnText}>Choose from gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* UPLOADING / VERIFYING */}
          {(state === 'uploading' || state === 'verifying') && (
            <View style={s.loadingSection}>
              {photoUri && <Image source={{ uri: photoUri }} style={s.previewImage} />}
              <ActivityIndicator size="large" color="#4ade80" />
              <Text style={s.loadingTitle}>
                {state === 'uploading' ? 'Uploading photo...' : 'Claude is verifying...'}
              </Text>
              <Text style={s.loadingSubtitle}>
                {state === 'verifying' ? 'Checking if you actually did it 👀' : ''}
              </Text>
            </View>
          )}

          {/* SUCCESS */}
          {state === 'success' && (
            <View style={s.resultSection}>
              {photoUri && <Image source={{ uri: photoUri }} style={s.previewImage} />}
              <View style={s.successBadge}>
                <Text style={s.successIcon}>✓</Text>
              </View>
              <Text style={s.successTitle}>Verified!</Text>
              <Text style={s.resultMessage}>{resultMessage}</Text>
              <TouchableOpacity style={s.primaryBtn} onPress={onClose}>
                <Text style={s.primaryBtnText}>Done 🔥</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FAILED */}
          {state === 'failed' && (
            <View style={s.resultSection}>
              {photoUri && <Image source={{ uri: photoUri }} style={s.previewImage} />}
              <View style={s.failedBadge}>
                <Text style={s.failedIcon}>✗</Text>
              </View>
              <Text style={s.failedTitle}>Not verified</Text>
              <Text style={s.resultMessage}>{resultMessage}</Text>
              <TouchableOpacity style={s.primaryBtn} onPress={reset}>
                <Text style={s.primaryBtnText}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.cancelBtn} onPress={onClose}>
                <Text style={s.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#141414', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48, gap: 20 },
  handle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 4 },

  taskRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16 },
  taskEmoji: { fontSize: 32 },
  taskLabel: { color: '#71717a', fontSize: 11, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  taskTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 2 },

  instructions: { color: '#71717a', fontSize: 14, lineHeight: 20, textAlign: 'center' },
  actions: { gap: 12 },

  primaryBtn: { backgroundColor: '#4ade80', borderRadius: 16, paddingVertical: 18, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  primaryBtnIcon: { fontSize: 18 },
  primaryBtnText: { color: '#000', fontWeight: '800', fontSize: 17 },
  secondaryBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  secondaryBtnText: { color: '#a1a1aa', fontWeight: '600', fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: 8 },
  cancelText: { color: '#3f3f46', fontSize: 15 },

  loadingSection: { alignItems: 'center', gap: 16, paddingVertical: 8 },
  loadingTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  loadingSubtitle: { color: '#71717a', fontSize: 14 },

  previewImage: { width: '100%', height: 180, borderRadius: 16, resizeMode: 'cover' },

  resultSection: { alignItems: 'center', gap: 14, width: '100%' },
  successBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center' },
  successIcon: { color: '#4ade80', fontSize: 28, fontWeight: '900' },
  successTitle: { color: '#4ade80', fontSize: 22, fontWeight: '900' },
  failedBadge: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#450a0a', alignItems: 'center', justifyContent: 'center' },
  failedIcon: { color: '#f87171', fontSize: 28, fontWeight: '900' },
  failedTitle: { color: '#f87171', fontSize: 22, fontWeight: '900' },
  resultMessage: { color: '#a1a1aa', fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
