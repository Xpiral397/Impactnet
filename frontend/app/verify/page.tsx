'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useRouter } from 'next/navigation';

const LIVENESS_ACTIONS = {
  smile: { instruction: 'Please SMILE! 😊', icon: '😊' },
  open_mouth: { instruction: 'Open your MOUTH wide! 😮', icon: '😮' },
  close_eyes: { instruction: 'Close your EYES! 😌', icon: '😌' },
  turn_left: { instruction: 'Turn your head to the LEFT! ⬅️', icon: '⬅️' },
  turn_right: { instruction: 'Turn your head to the RIGHT! ➡️', icon: '➡️' },
  blink: { instruction: 'BLINK your eyes! 👁️', icon: '👁️' }
};

export default function FaceVerificationPage() {
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();

  // State management
  const [step, setStep] = useState<'intro' | 'reference' | 'liveness' | 'complete'>('intro');
  const [referenceImage, setReferenceImage] = useState<string>('');
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [requiredActions, setRequiredActions] = useState<string[]>([]);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const [completedActions, setCompletedActions] = useState<Array<{ action: string; image: string }>>([]);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const currentAction = requiredActions[currentActionIndex];

  // Countdown timer
  useEffect(() => {
    if (showCountdown && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showCountdown && countdown === 0) {
      captureImage();
    }
  }, [showCountdown, countdown]);

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return null;

    const imageSrc = webcamRef.current.getScreenshot();
    return imageSrc;
  }, [webcamRef]);

  const startVerification = async () => {
    setLoading(true);
    setError('');

    try {
      // Capture reference image
      const refImage = captureImage();
      if (!refImage) {
        throw new Error('Failed to capture reference image');
      }

      setReferenceImage(refImage);

      // Call API to start verification
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/ai/face-verify/start/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reference_image: refImage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start verification');
      }

      const data = await response.json();
      setVerificationId(data.verification_id);
      setRequiredActions(data.liveness_actions);
      setStep('liveness');
    } catch (err: any) {
      setError(err.message || 'Failed to start verification');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setShowCountdown(true);
    setCountdown(3);
  };

  const captureActionImage = () => {
    const image = captureImage();
    if (!image) {
      setError('Failed to capture image');
      return;
    }

    const newAction = {
      action: currentAction,
      image: image
    };

    setCompletedActions([...completedActions, newAction]);
    setShowCountdown(false);

    // Move to next action or complete
    if (currentActionIndex < requiredActions.length - 1) {
      setCurrentActionIndex(currentActionIndex + 1);
    } else {
      completeVerification([...completedActions, newAction]);
    }
  };

  const completeVerification = async (actions: Array<{ action: string; image: string }>) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/ai/face-verify/complete/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          verification_id: verificationId,
          verification_image: referenceImage,
          liveness_actions: actions
        })
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      setResult(data);
      setStep('complete');
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Face Verification</h1>
          <p className="text-gray-600">Complete liveness detection to verify your identity</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Intro Step */}
          {step === 'intro' && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                  <span className="text-4xl">🔐</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's verify it's really you</h2>
                <p className="text-gray-600">We'll ask you to perform a few simple actions to ensure security</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-2xl">📸</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Capture your face</h3>
                    <p className="text-sm text-gray-600">We'll take a reference photo first</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Complete 3 random actions</h3>
                    <p className="text-sm text-gray-600">Follow the instructions (smile, blink, turn head, etc.)</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Get verified!</h3>
                    <p className="text-sm text-gray-600">You'll be verified once all actions are completed</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('reference')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Start Verification
              </button>
            </div>
          )}

          {/* Reference Image Step */}
          {step === 'reference' && (
            <div className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Look directly at the camera</h2>
                <p className="text-gray-600">Make sure your face is clearly visible</p>
              </div>

              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  mirrored={true}
                />

                {/* Face guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-white rounded-full opacity-50"></div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={startVerification}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Capture Reference Photo'}
              </button>
            </div>
          )}

          {/* Liveness Detection Step */}
          {step === 'liveness' && currentAction && (
            <div className="p-8">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Action {currentActionIndex + 1} of {requiredActions.length}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    {Math.round(((currentActionIndex) / requiredActions.length) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                    style={{ width: `${((currentActionIndex) / requiredActions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Instruction */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                  <span className="text-6xl">{LIVENESS_ACTIONS[currentAction as keyof typeof LIVENESS_ACTIONS]?.icon}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {LIVENESS_ACTIONS[currentAction as keyof typeof LIVENESS_ACTIONS]?.instruction}
                </h2>
                <p className="text-gray-600">Position yourself and click "Ready" when you're prepared</p>
              </div>

              {/* Webcam */}
              <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-6">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  mirrored={true}
                />

                {/* Countdown Overlay */}
                {showCountdown && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-9xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={startCountdown}
                disabled={showCountdown || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {showCountdown ? 'Get Ready...' : loading ? 'Processing...' : 'I\'m Ready!'}
              </button>
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && result && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                  result.verification_passed ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <span className="text-6xl">{result.verification_passed ? '✅' : '❌'}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {result.verification_passed ? 'Verification Successful!' : 'Verification Failed'}
                </h2>
                <p className="text-gray-600">
                  {result.verification_passed
                    ? 'Your identity has been verified successfully'
                    : 'Unable to verify your identity. Please try again.'}
                </p>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.face_match_score?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Face Match</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {result.liveness_score?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Liveness</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {result.confidence_score?.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
              </div>

              <div className="flex gap-4">
                {result.verification_passed ? (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Continue to Dashboard
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setStep('intro');
                      setCompletedActions([]);
                      setCurrentActionIndex(0);
                      setError('');
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
