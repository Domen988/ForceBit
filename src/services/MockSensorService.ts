import { ISensorService } from "./ISensorService";
import { ForceData } from "../models/ForceData";

export class MockSensorService implements ISensorService {
  private intervalId: NodeJS.Timeout | null = null;
  private currentOffset: number = 0;
  private isConnected: boolean = false;
  public manualOverride: number | null = null;

  async connect(): Promise<void> {
    console.log("Mock Sensor Connecting...");
    return new Promise((resolve) => setTimeout(() => {
        this.isConnected = true;
        resolve();
    }, 1000)); // Fake 1s delay
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.stopStreaming();
  }

  startStreaming(callback: (data: ForceData) => void): void {
    if (this.intervalId) return;
  
    this.intervalId = setInterval(() => {
      let finalForce = 0;
  
      // CHECK FOR OVERRIDE
      if (this.manualOverride !== null) {
        // Add a tiny bit of noise so it looks like a real sensor
        finalForce = this.manualOverride + (Math.random() * 0.2); 
      } else {
        // ... keep your existing Sine Wave logic here as the 'else' ...
        let rawVal = Math.random() * 0.2;
        const timeFactor = (Date.now() / 1000) % 10; 
        if (timeFactor > 2 && timeFactor < 8) {
            rawVal += Math.sin((timeFactor - 2) * (Math.PI / 6)) * 45;
        }
        finalForce = rawVal;
      }
  
      // Apply offset (Tare)
      finalForce = Math.max(0, finalForce - this.currentOffset);
  
      callback({
        timestamp: Date.now(),
        forceKg: parseFloat(finalForce.toFixed(2))
      });
    }, 50); 
  }

  // Add a helper to set the override
  setSimulatedValue(val: number | null) {
    this.manualOverride = val;
  }

  stopStreaming(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  tare(): void {
    // In a real app, we'd average the last few frames. 
    // Here we just zero out the sine wave logic essentially (simplified)
    console.log("Tare command received");
  }
}