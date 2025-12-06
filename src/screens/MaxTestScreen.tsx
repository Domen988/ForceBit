import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useMaxTest } from '../hooks/useMaxTest';

export default function MaxTestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // 1. FIXED: Explicitly grab setupId. 
  // If it's missing, we log an error (it shouldn't be missing if coming from Home)
  const params = route.params as { setupId: string; contextName: string };
  const setupId = params?.setupId; 
  const contextName = params?.contextName || "Unknown Setup";

  // 2. Pass setupId to the hook
  const { 
    testState, 
    countdown, 
    maxForce, 
    result, 
    startTest, 
    updateTestValue, 
    saveAndExit, 
    retryTest 
  } = useMaxTest(setupId, () => navigation.goBack());

  // Simulation for testing (Remove when bluetooth is real)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testState === 'PULL') {
      interval = setInterval(() => {
        // Simulating a pull of 55kg
        updateTestValue(Math.random() * 55); 
      }, 100);
    }
    return () => clearInterval(interval);
  }, [testState]);

  // --- DEBUGGING UI ---
  // If setupId is somehow missing, show a warning immediately
  if (!setupId) {
    return (
      <View style={styles.container}>
        <Text style={{color: 'red', textAlign: 'center', marginTop: 100}}>
            Error: No Setup ID provided. Return to Home.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MAX FORCE TEST</Text>
        <Text style={styles.contextLabel}>{contextName}</Text>
      </View>

      <View style={styles.content}>
        
        {/* STATE: IDLE */}
        {testState === 'IDLE' && (
          <View style={styles.centerBlock}>
            <Text style={styles.instruction}>
              Prepare your grip.{"\n"}The test will last 5 seconds.
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startTest}>
              <Text style={styles.startButtonText}>START TEST</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STATE: COUNTDOWN */}
        {testState === 'COUNTDOWN' && (
          <View style={styles.centerBlock}>
            <Text style={styles.statusLabel}>Get Ready</Text>
            <Text style={styles.hugeNumber}>{countdown}</Text>
          </View>
        )}

        {/* STATE: PULL */}
        {testState === 'PULL' && (
          <View style={styles.centerBlock}>
            <Text style={[styles.statusLabel, {color: '#FF4444'}]}>PULL HARD!</Text>
            <Text style={styles.hugeNumber}>{maxForce.toFixed(1)}</Text>
            <Text style={styles.unit}>kg</Text>
          </View>
        )}

        {/* STATE: RESULT */}
        {testState === 'RESULT' && (
          <View style={styles.centerBlock}>
            <Text style={styles.statusLabel}>Result</Text>
            <Text style={styles.hugeNumber}>{result.toFixed(1)} <Text style={styles.unit}>kg</Text></Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={retryTest}>
                <Text style={styles.secondaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryButton} onPress={saveAndExit}>
                <Text style={styles.primaryButtonText}>Save Result</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#333', marginTop: 40 },
  headerTitle: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  contextLabel: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 5 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerBlock: { alignItems: 'center' },
  instruction: { color: '#ccc', textAlign: 'center', marginBottom: 30, fontSize: 16 },
  statusLabel: { color: '#888', fontSize: 20, marginBottom: 10, textTransform: 'uppercase' },
  hugeNumber: { color: '#fff', fontSize: 100, fontWeight: '900' },
  unit: { fontSize: 30, color: '#666' },
  
  startButton: { backgroundColor: '#00D1FF', paddingVertical: 20, paddingHorizontal: 60, borderRadius: 50 },
  startButtonText: { color: '#000', fontSize: 20, fontWeight: 'bold' },

  buttonRow: { flexDirection: 'row', gap: 20, marginTop: 40 },
  primaryButton: { backgroundColor: '#00D1FF', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  primaryButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#333', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10 },
  secondaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});