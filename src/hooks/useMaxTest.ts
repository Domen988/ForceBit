import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Audio } from 'expo-av'; 
import { useForceStore } from '../stores/forceStore'; 
import { generateTone } from '../utils/audioGen'; // Import the new generator

export type TestState = 'IDLE' | 'COUNTDOWN' | 'PULL' | 'RESULT';

export const useMaxTest = (setupId: string, onSaveComplete: () => void) => {
  const [testState, setTestState] = useState<TestState>('IDLE');
  const [countdown, setCountdown] = useState(5);
  const [maxForce, setMaxForce] = useState(0);
  const [result, setResult] = useState(0);

  const maxForceRef = useRef(0);
  const soundObjectRef = useRef<Audio.Sound | null>(null);
  const saveResult = useForceStore(state => state.saveResult);

  // --- 1. GENERATE SOUNDS (Run once on mount) ---
  // 440Hz = Low Beep (Countdown), 0.15s duration
  const tickSoundURI = useMemo(() => generateTone(440, 0.15, 0.6), []);
  // 880Hz = High Beep (GO!), 0.6s duration
  const goSoundURI = useMemo(() => generateTone(880, 0.6, 0.8), []);

  // --- 2. AUDIO SETUP ---
  useEffect(() => {
    const configureAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
        });
      } catch (e) {
        console.warn("Audio setup failed:", e);
      }
    };
    configureAudio();

    return () => {
      // Unload sound on unmount
      if (soundObjectRef.current) {
        soundObjectRef.current.unloadAsync();
      }
    };
  }, []);

  const playBeep = async (type: 'tick' | 'go') => {
    try {
      // Unload previous sound to allow rapid replay
      if (soundObjectRef.current) {
        await soundObjectRef.current.unloadAsync();
      }

      // Load the generated Data URI
      const source = { uri: type === 'tick' ? tickSoundURI : goSoundURI };
      
      const { sound } = await Audio.Sound.createAsync(source);
      soundObjectRef.current = sound;
      await sound.playAsync();
    } catch (error) {
      console.warn("Audio playback failed", error);
    }
  };

  // --- 3. TEST LOGIC ---
  const startTest = useCallback(() => {
    setMaxForce(0);
    maxForceRef.current = 0;
    setResult(0);
    setTestState('COUNTDOWN');
    setCountdown(5);

    let count = 5;
    
    // Play initial beep immediately
    playBeep('tick');

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        playBeep('tick');
      } else {
        clearInterval(interval);
        playBeep('go'); // High pitch for GO
        setTestState('PULL');
      }
    }, 1000);
  }, [tickSoundURI, goSoundURI]); // Dependencies ensure URIs are ready

  const finishTest = useCallback(() => {
    setTestState('RESULT');
    const finalPeak = maxForceRef.current;
    setResult(finalPeak);
  }, []);

  // Auto-stop after 5 seconds of PULL
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (testState === 'PULL') {
      timer = setTimeout(finishTest, 5000); 
    }
    return () => clearTimeout(timer);
  }, [testState, finishTest]);

  const updateTestValue = useCallback((incomingValue: number) => {
    if (testState === 'PULL') {
      maxForceRef.current = Math.max(maxForceRef.current, incomingValue);
      setMaxForce(prev => Math.max(prev, incomingValue));
    }
  }, [testState]);

  const saveAndExit = useCallback(() => {
    if (result > 0) {
        saveResult(setupId, result);
    }
    onSaveComplete(); 
  }, [result, setupId, saveResult, onSaveComplete]);

  const retryTest = useCallback(() => {
    setTestState('IDLE');
    setMaxForce(0);
    setResult(0);
    maxForceRef.current = 0;
  }, []);

  return {
    testState,
    countdown,
    result,
    maxForce,
    startTest,
    updateTestValue,
    saveAndExit,
    retryTest
  };
};