import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit'; 
import { useForceStore } from '../stores/forceStore';

export default function HistoryScreen() {
  const route = useRoute();
  const { setupId, title } = route.params as { setupId: string, title: string };
  const getHistory = useForceStore(state => state.getHistory);
  
  const history = getHistory(setupId);

  // --- 1. HANDLE EMPTY STATE ---
  if (history.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.empty}>No test data recorded yet.</Text>
      </View>
    );
  }

  // --- 2. PREPARE DATA ---
  // To prevent label clutter, we only show the last 10 attempts on the graph.
  // (You can change this number)
  const recentHistory = history.slice(-10); 

  const labels = recentHistory.map(h => 
    new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  );
  const dataPoints = recentHistory.map(h => h.peakForce);

  // --- 3. CALCULATE STATS (Based on ALL history, not just recent) ---
  const allDataPoints = history.map(h => h.peakForce);
  const maxForce = Math.max(...allDataPoints);
  const currentForce = dataPoints[dataPoints.length - 1];

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>{title}</Text>
      
      {/* CRITICAL FIX: LineChart needs at least 2 points to render a line.
         If we have only 1 point, we show a simple "Bar" representation or just text.
      */}
      {dataPoints.length > 1 ? (
        <LineChart
          data={{
            labels: labels,
            datasets: [{ data: dataPoints }]
          }}
          width={Dimensions.get("window").width - 30} 
          height={250}
          yAxisSuffix="kg"
          yAxisInterval={1} // Optional, defaults to 1
          chartConfig={{
            backgroundColor: "#111",
            backgroundGradientFrom: "#1e1e1e",
            backgroundGradientTo: "#1e1e1e",
            decimalPlaces: 1, 
            color: (opacity = 1) => `rgba(0, 209, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(200, 200, 200, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: "5", strokeWidth: "2", stroke: "#fff" }
          }}
          bezier // Makes the line curved and smoother
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      ) : (
        // Fallback view for single data point
        <View style={styles.singlePointContainer}>
            <Text style={styles.singlePointLabel}>First Result:</Text>
            <Text style={styles.singlePointValue}>{currentForce.toFixed(1)} kg</Text>
        </View>
      )}

      {/* STATS BLOCK */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>Best All Time</Text>
            <Text style={[styles.statValue, { color: '#00D1FF' }]}>{maxForce.toFixed(1)} kg</Text>
        </View>
        <View style={styles.statBox}>
            <Text style={styles.statLabel}>Latest</Text>
            <Text style={styles.statValue}>{currentForce.toFixed(1)} kg</Text>
        </View>
      </View>

      <Text style={styles.historyCount}>
        Showing last {dataPoints.length} of {history.length} tests
      </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: '#111', padding: 20, alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#111', padding: 20, alignItems: 'center', justifyContent: 'center' },
  
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  empty: { color: '#666', marginTop: 20, fontSize: 16 },
  
  // Single Point Fallback
  singlePointContainer: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222', width: '100%', borderRadius: 16, marginBottom: 10 },
  singlePointLabel: { color: '#888', fontSize: 16, marginBottom: 5 },
  singlePointValue: { color: '#00D1FF', fontSize: 40, fontWeight: 'bold' },

  // Stats Grid
  statsContainer: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 20, gap: 15 },
  statBox: { flex: 1, backgroundColor: '#222', padding: 15, borderRadius: 12, alignItems: 'center' },
  statLabel: { color: '#888', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  historyCount: { color: '#444', marginTop: 30, fontSize: 12 }
});