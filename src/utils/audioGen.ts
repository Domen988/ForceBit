import { Platform } from 'react-native';

/**
 * Generates a Base64 encoded WAV file URI (Data URI) for a specific frequency.
 * * @param frequency Hz (e.g., 440 for A4)
 * @param durationSeconds Duration of the beep (e.g., 0.2)
 * @param volume 0.0 to 1.0
 * @returns string "data:audio/wav;base64,..."
 */
export const generateTone = (frequency: number, durationSeconds: number, volume: number = 0.5): string => {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  
  // 1. HEADER: 44 bytes for standard PCM WAV
  const headerSize = 44;
  const dataSize = numSamples * 2; // 16-bit = 2 bytes per sample
  const fileSize = headerSize + dataSize;
  
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // --- RIFF CHUNK ---
  writeString(view, 0, 'RIFF');
  view.setUint32(4, fileSize - 8, true); // File size - 8
  writeString(view, 8, 'WAVE');

  // --- FMT CHUNK ---
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);       // Chunk size (16 for PCM)
  view.setUint16(20, 1, true);        // Audio format (1 = PCM)
  view.setUint16(22, 1, true);        // Num channels (1 = Mono)
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * 2, true); // Byte rate (SampleRate * BlockAlign)
  view.setUint16(32, 2, true);        // Block align (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true);       // Bits per sample

  // --- DATA CHUNK ---
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // 2. PCM DATA GENERATION (Sine Wave)
  const amplitude = volume * 0x7FFF; // Max amplitude for 16-bit (32767)
  
  for (let i = 0; i < numSamples; i++) {
    const offset = 44 + i * 2;
    // Math: Amplitude * sin( 2 * PI * Frequency * (CurrentSample / SampleRate) )
    const sample = amplitude * Math.sin(2 * Math.PI * frequency * (i / sampleRate));
    
    // Write 16-bit integer (Little Endian)
    view.setInt16(offset, sample < 0 ? Math.max(sample, -0x8000) : Math.min(sample, 0x7FFF), true);
  }

  // 3. CONVERT TO BASE64
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  const base64 = btoa(binary);

  return `data:audio/wav;base64,${base64}`;
};

// Helper to write ASCII strings to the DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Polyfill btoa if not available (Standard in React Native, but safe to have)
const btoa = (input: string) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input;
  let output = '';

  for (let block = 0, charCode, i = 0, map = chars;
  str.charAt(i | 0) || (map = '=', i % 1);
  output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

    charCode = str.charCodeAt(i += 3/4);

    if (charCode > 0xFF) {
      throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
    }
    
    block = block << 8 | charCode;
  }

  return output;
};