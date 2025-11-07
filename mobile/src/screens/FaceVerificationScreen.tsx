import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { faceVerificationAPI } from '../services/api';

const LIVENESS_ACTIONS: Record<string, { instruction: string; icon: string }> = {
  smile: { instruction: 'Please SMILE! 😊', icon: '😊' },
  open_mouth: { instruction: 'Open your MOUTH wide! 😮', icon: '😮' },
  close_eyes: { instruction: 'Close your EYES! 😌', icon: '😌' },
  turn_left: { instruction: 'Turn your head to the LEFT! ⬅️', icon: '⬅️' },
  turn_right: { instruction: 'Turn your head to the RIGHT! ➡️', icon: '➡️' },
  blink: { instruction: 'BLINK your eyes! 👁️', icon: '👁️' },
};

type Step = 'intro' | 'reference' | 'liveness' | 'complete';

interface FaceVerificationScreenProps {
  navigation: any;
}

export default function FaceVerificationScreen({ navigation }: FaceVerificationScreenProps) {
  const cameraRef = useRef<RNCamera>(null);

  const [step, setStep] = useState<Step>('intro');
  const [referenceImage, setReferenceImage] = useState('');
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [requiredActions, setRequiredActions] = useState<string[]>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [completedActions, setCompletedActions] = useState<Array<{ action: string; image: string }>>([]);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const currentAction = requiredActions[currentActionIndex];

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.8, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      return `data:image/jpeg;base64,${data.base64}`;
    }
    return null;
  };

  const startVerification = async () => {
    setLoading(true);
    try {
      const refImage = await takePicture();
      if (!refImage) {
        throw new Error('Failed to capture reference image');
      }

      setReferenceImage(refImage);

      const data = await faceVerificationAPI.startVerification(refImage);
      setVerificationId(data.verification_id);
      setRequiredActions(data.liveness_actions);
      setStep('liveness');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start verification');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    let count = 3;
    setCountdown(count);

    const timer = setInterval(() => {
      count--;
      setCountdown(count);

      if (count === 0) {
        clearInterval(timer);
        captureActionImage();
      }
    }, 1000);
  };

  const captureActionImage = async () => {
    const image = await takePicture();
    if (!image) {
      Alert.alert('Error', 'Failed to capture image');
      return;
    }

    const newAction = {
      action: currentAction,
      image: image,
    };

    setCompletedActions([...completedActions, newAction]);

    if (currentActionIndex < requiredActions.length - 1) {
      setCurrentActionIndex(currentActionIndex + 1);
    } else {
      completeVerification([...completedActions, newAction]);
    }
  };

  const completeVerification = async (actions: Array<{ action: string; image: string }>) => {
    setLoading(true);
    try {
      const data = await faceVerificationAPI.completeVerification(
        verificationId!,
        referenceImage,
        actions
      );
      setResult(data);
      setStep('complete');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.introContent}>
          <Text style={styles.introIcon}>🔐</Text>
          <Text style={styles.introTitle}>Let's verify it's really you</Text>
          <Text style={styles.introSubtitle}>
            We'll ask you to perform a few simple actions to ensure security
          </Text>

          <View style={styles.introSteps}>
            <View style={styles.introStep}>
              <Text style={styles.introStepIcon}>📸</Text>
              <Text style={styles.introStepTitle}>Capture your face</Text>
              <Text style={styles.introStepDescription}>We'll take a reference photo first</Text>
            </View>
            <View style={styles.introStep}>
              <Text style={styles.introStepIcon}>✨</Text>
              <Text style={styles.introStepTitle}>Complete 3 random actions</Text>
              <Text style={styles.introStepDescription}>
                Follow the instructions (smile, blink, turn head, etc.)
              </Text>
            </View>
            <View style={styles.introStep}>
              <Text style={styles.introStepIcon}>✅</Text>
              <Text style={styles.introStepTitle}>Get verified!</Text>
              <Text style={styles.introStepDescription}>
                You'll be verified once all actions are completed
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => setStep('reference')}>
            <Text style={styles.buttonText}>Start Verification</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === 'complete' && result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContent}>
          <Text style={styles.resultIcon}>{result.verification_passed ? '✅' : '❌'}</Text>
          <Text style={styles.resultTitle}>
            {result.verification_passed ? 'Verification Successful!' : 'Verification Failed'}
          </Text>
          <Text style={styles.resultSubtitle}>
            {result.verification_passed
              ? 'Your identity has been verified successfully'
              : 'Unable to verify your identity. Please try again.'}
          </Text>

          <View style={styles.scoresContainer}>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{result.face_match_score?.toFixed(1)}%</Text>
              <Text style={styles.scoreLabel}>Face Match</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{result.liveness_score?.toFixed(1)}%</Text>
              <Text style={styles.scoreLabel}>Liveness</Text>
            </View>
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>{result.confidence_score?.toFixed(1)}%</Text>
              <Text style={styles.scoreLabel}>Confidence</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>
              {result.verification_passed ? 'Continue' : 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RNCamera
        ref={cameraRef}
        style={styles.camera}
        type={RNCamera.Constants.Type.front}
        flashMode={RNCamera.Constants.FlashMode.off}
        captureAudio={false}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
      >
        <View style={styles.cameraOverlay}>
          {/* Instructions */}
          {step === 'reference' && (
            <View style={styles.instructionBox}>
              <Text style={styles.instructionTitle}>Look directly at the camera</Text>
              <Text style={styles.instructionSubtitle}>Make sure your face is clearly visible</Text>
            </View>
          )}

          {step === 'liveness' && currentAction && (
            <>
              {/* Progress */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${((currentActionIndex) / requiredActions.length) * 100}%` },
                  ]}
                />
              </View>

              {/* Action Instruction */}
              <View style={styles.instructionBox}>
                <Text style={styles.actionIcon}>
                  {LIVENESS_ACTIONS[currentAction]?.icon}
                </Text>
                <Text style={styles.instructionTitle}>
                  {LIVENESS_ACTIONS[currentAction]?.instruction}
                </Text>
                <Text style={styles.instructionSubtitle}>
                  Action {currentActionIndex + 1} of {requiredActions.length}
                </Text>
              </View>
            </>
          )}

          {/* Countdown */}
          {countdown > 0 && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          {/* Capture Button */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <TouchableOpacity
                style={styles.captureButton}
                onPress={step === 'reference' ? startVerification : startCountdown}
                disabled={countdown > 0}
              >
                <Text style={styles.captureButtonText}>
                  {countdown > 0 ? 'Get Ready...' : "I'm Ready!"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </RNCamera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 24,
    marginTop: 24,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 2,
  },
  instructionBox: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  captureButton: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  introContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  introIcon: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  introSteps: {
    gap: 16,
    marginBottom: 32,
  },
  introStep: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  introStepIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  introStepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  introStepDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  resultIcon: {
    fontSize: 72,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  scoresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});
