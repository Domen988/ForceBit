import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider'; 
import { useRoute, useNavigation } from '@react-navigation/native';
import { useForceStore } from '../stores/forceStore';

export default function TrainingScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  
  // 1. Get Params
  const { setupId, contextName } = route.params as { setupId: string, contextName: string };

  // 2. REACTIVE STATE SELECTOR
  // Updates automatically when the store changes (e.g. after a new test)
  const maxForce = useForceStore(state => {
    const history = state.results.filter(r => r.setupId === setupId);
    if (history.length === 0) return 0;
    return Math.max(...history.map(r => r.peakForce));
  });

  const [targetPercent, setTargetPercent] = useState(80); 
  const [currentForce, setCurrentForce] = useState(0); 

  // Derived values
  const targetForce = maxForce * (targetPercent / 100);
  const zoneTolerance = maxForce * 0.05; // +/- 5% tolerance
  
  // Visualization Math
  const graphMax = maxForce > 0 ? maxForce * 1.2 : 60; 
  const getHeight = (val: number) => (val / graphMax) * 100;
  const isInZone = Math.abs(currentForce - targetForce) < zoneTolerance;

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.contextName}>{contextName}</Text>
        <View style={styles.statsRow}>
          <View>
            <Text style={styles.label}>MAX FORCE</Text>
            <Text style={styles.value}>{maxForce.toFixed(1)} kg</Text>
          </View>
          <View>
            <Text style={styles.label}>TARGET ({targetPercent}%)</Text>
            <Text style={[styles.value, { color: '#00D1FF' }]}>{targetForce.toFixed(1)} kg</Text>
          </View>
        </View>
      </View>

      {/* WARNING OVERLAY (If no data) */}
      {maxForce === 0 && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>No max force recorded for this setup.</Text>
          <TouchableOpacity 
            style={styles.calibrateBtn}
            onPress={() => navigation.navigate('MaxTestScreen', { setupId, contextName })}
          >
            <Text style={styles.calibrateText}>CALIBRATE NOW</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TUNNEL VISUALIZATION */}
      <View style={styles.tunnelContainer}>
        <View style={styles.barBackground}>
          {/* Target Zone */}
          <View 
            style={[
              styles.targetZone, 
              { 
                bottom: `${getHeight(targetForce - zoneTolerance)}%`,
                height: `${getHeight(zoneTolerance * 2)}%` 
              }
            ]} 
          />
          {/* Fill Bar */}
          <View 
            style={[
              styles.currentFill, 
              { 
                height: `${getHeight(currentForce)}%`,
                backgroundColor: isInZone ? '#00FF00' : '#fff'
              }
            ]} 
          />
        </View>
        {/* Live Number */}
        <Text style={styles.bigReadout}>{currentForce.toFixed(1)}</Text>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        
        {/* Intensity Slider */}
        <Text style={styles.controlLabel}>Target Intensity: {targetPercent}%</Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={10}
          maximumValue={100}
          step={5}
          value={targetPercent}
          onValueChange={setTargetPercent}
          minimumTrackTintColor="#00D1FF"
          maximumTrackTintColor="#333"
          thumbTintColor="#fff"
        />

        {/* --- DEBUG SLIDER --- */}
        <Text style={[styles.controlLabel, { marginTop: 20, color: '#FFD700' }]}>
           SIMULATE PULL (Debug)
        </Text>
        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={0}
          maximumValue={graphMax}
          step={0.5}
          value={currentForce}
          onValueChange={setCurrentForce} 
          minimumTrackTintColor="#FFD700"
          maximumTrackTintColor="#333"
          thumbTintColor="#FFD700"
        />
        
        {/* Buttons */}
        <View style={styles.buttonRow}>
            <TouchableOpacity 
                style={styles.secondaryBtn}
                onPress={() => navigation.navigate('MaxTestScreen', { setupId, contextName })}
            >
                <Text style={styles.secondaryBtnText}>Retest Max</Text>
            </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

// --- FIXED STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { marginBottom: 20 },
  contextName: { color: '#888', textTransform: 'uppercase', fontSize: 12, marginBottom: 5 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { color: '#666', fontSize: 10, fontWeight: 'bold' },
  value: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  
  // Warning Overlay
  warningContainer: { position: 'absolute', top: 150, left: 20, right: 20, zIndex: 10, backgroundColor: 'rgba(50,0,0,0.9)', padding: 20, borderRadius: 10, alignItems: 'center' },
  warningText: { color: '#fff', marginBottom: 10 },
  calibrateBtn: { backgroundColor: '#FF4444', padding: 10, borderRadius: 5 },
  calibrateText: { color: '#fff', fontWeight: 'bold' },

  // Visualization
  tunnelContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative' },
  barBackground: { width: 60, height: '100%', backgroundColor: '#222', borderRadius: 30, overflow: 'hidden', justifyContent: 'flex-end' },
  targetZone: { position: 'absolute', width: '100%', backgroundColor: 'rgba(0, 209, 255, 0.3)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#00D1FF' },
  currentFill: { width: '100%', backgroundColor: '#fff' },
  bigReadout: { position: 'absolute', color: 'rgba(255,255,255,0.1)', fontSize: 100, fontWeight: '900', zIndex: -1 },

  // Controls (This was missing before)
  controls: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 15 },
  controlLabel: { color: '#aaa', marginBottom: 5 },
  
  // Buttons
  buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 15 },
  secondaryBtn: { borderWidth: 1, borderColor: '#444', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  secondaryBtnText: { color: '#888' }
});