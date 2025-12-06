import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Polyline, Rect, Line } from 'react-native-svg';

// Configuration
const WINDOW_WIDTH = Dimensions.get('window').width;
const GRAPH_HEIGHT = 200;
const MAX_FORCE_Y = 60; // Max Y-axis value (e.g., 60kg)
const POINTS_TO_SHOW = 100; // How much history to keep on screen

interface ForceTunnelProps {
  history: number[]; // Array of last N force values
  targetForce: number; // e.g., 20kg
  tolerance: number; // e.g., 2kg (draws zone 18kg-22kg)
}

export const ForceTunnel = ({ history, targetForce, tolerance }: ForceTunnelProps) => {
  
  // 1. Helper: Map Force (Kg) to Y-Pixel
  // SVG coordinates: 0 is top, Height is bottom. So we invert.
  const getY = (kg: number) => {
    const clampled = Math.min(Math.max(kg, 0), MAX_FORCE_Y);
    const percent = clampled / MAX_FORCE_Y;
    return GRAPH_HEIGHT - (percent * GRAPH_HEIGHT);
  };

  // 2. Build the "Snake" Path
  // We map the array indices to X coordinates
  const pointsString = history
    .map((val, index) => {
      const x = (index / (POINTS_TO_SHOW - 1)) * WINDOW_WIDTH;
      const y = getY(val);
      return `${x},${y}`;
    })
    .join(' ');

  // 3. Calculate Zone Rect
  const zoneTop = getY(targetForce + tolerance);
  const zoneBottom = getY(targetForce - tolerance);
  const zoneHeight = Math.abs(zoneBottom - zoneTop);

  return (
    <View style={{ height: GRAPH_HEIGHT, backgroundColor: '#222', width: WINDOW_WIDTH }}>
      <Svg height={GRAPH_HEIGHT} width={WINDOW_WIDTH}>
        {/* A. The "Target Tunnel" (Green Zone) */}
        <Rect
          x="0"
          y={zoneTop}
          width={WINDOW_WIDTH}
          height={zoneHeight}
          fill="rgba(0, 255, 157, 0.2)" // Transparent Green
        />
        
        {/* B. The Center Line (Target) */}
        <Line
          x1="0"
          y1={getY(targetForce)}
          x2={WINDOW_WIDTH}
          y2={getY(targetForce)}
          stroke="rgba(0, 255, 157, 0.5)"
          strokeWidth="1"
          strokeDasharray="5, 5"
        />

        {/* C. The Live Force Line (White) */}
        <Polyline
          points={pointsString}
          fill="none"
          stroke="white"
          strokeWidth="3"
        />
      </Svg>
    </View>
  );
};