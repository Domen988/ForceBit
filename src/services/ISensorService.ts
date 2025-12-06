import { ForceData } from "../models/ForceData";

export interface ISensorService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  startStreaming(callback: (data: ForceData) => void): void;
  stopStreaming(): void;
  tare(): void;
}