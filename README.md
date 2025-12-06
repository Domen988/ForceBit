# ForceBit: Connected Force Dynamometer

ForceBit is a specialized React Native application designed to interface with custom Bluetooth Load Cells (Smart Dynamometers). It is built for climbers, physical therapists, and athletes to measure isometric strength, track peak force, and train at specific intensity zones.

## 🚀 Features

### 1. Configuration Management
* **Custom Setups:** Create specific contexts for every test (e.g., *"Left Hand - 20mm Edge"*, *"Right Hand - Pinch"*).
* **Persistent Storage:** All setups and history are saved locally using AsyncStorage.

### 2. Max Force Testing Engine
* **Automated Workflow:** A precise state machine handles the testing process:
    * **Idle:** Setup and calibration.
    * **Countdown:** 5-second audio-visual preparation (3... 2... 1...).
    * **Pull:** 5-second active measurement window.
    * **Result:** Peak force capture and auto-save options.
* **Audio Feedback:** Real-time, in-memory generated PCM WAV tones (no external assets required).

### 3. Interactive Training Mode
* **"The Tunnel" Visualization:** A reactive visual bio-feedback bar.
* **Target Zones:** Automatically calculates target force based on a percentage of your stored Max Force.
* **Live Feedback:** Visual indicators turn green when the user is within the target intensity zone (+/- 5%).

### 4. Analytics & History
* **Progression Charts:** Visualize strength gains over time using interactive line charts.
* **Smart Filtering:** Automatically handles data scaling to keep graphs readable.

---

## 🛠 Tech Stack

* **Framework:** React Native (Expo SDK 52+)
* **Language:** TypeScript
* **State Management:** Zustand (with JSON Storage persistence)
* **Navigation:** React Navigation (Native Stack)
* **Visualization:** React Native Chart Kit, Custom SVG/View rendering
* **Audio:** Expo AV with algorithmic sound generation (Base64 WAV)
* **Storage:** AsyncStorage

---

## 📸 Screenshots

| Home & Config | Max Test | Training Tunnel | History |
|:---:|:---:|:---:|:---:|
| *(Place screenshot here)* | *(Place screenshot here)* | *(Place screenshot here)* | *(Place screenshot here)* |

---

## 🏁 Getting Started

### Prerequisites
* Node.js (LTS)
* Expo Go app on your physical device (iOS/Android) OR a Simulator.

### Installation

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/ForceBit.git](https://github.com/YOUR_USERNAME/ForceBit.git)
    cd ForceBit
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npx expo start -c
    ```

4.  **Run on device**
    * Scan the QR code with your phone (using Expo Go).
    * Or press `i` for iOS Simulator / `a` for Android Emulator.

---

## 🧪 Simulation Mode (Debug)

Currently, the Bluetooth implementation is mocked for development purposes.
* **Max Test:** The app simulates random force input during the "PULL" phase.
* **Training Mode:** A "Debug Slider" is provided at the bottom of the screen to manually simulate sensor load and test the visual feedback loop.

---

## 🧩 Architecture Overview

### The Store (`forceStore.ts`)
The app uses a relational data model within a global Zustand store.
* **Setups:** `{ id, hand, grip, holdName }`
* **Results:** `{ id, setupId, peakForce, date }`
* Selectors are used to make UI components reactive. For example, the Training Screen auto-updates the "Target" immediately after a new Max Test is saved.

### The Hook (`useMaxTest.ts`)
Logic is decoupled from the UI using a custom hook. This hook manages:
* The 5s/5s Timer Logic.
* High-frequency sensor updates (using `useRef` to prevent re-render lag).
* Audio generation and playback.

---

## 🗺 Roadmap

* [ ] **Audio Bio-Feedback:** Dynamic pitch shifting during training (higher pitch = closer to target).
* [ ] **Interval Timers:** Support for "Repeaters" (e.g., 7s on / 3s off).
* [ ] **Bluetooth Integration:** Replace simulation with `react-native-ble-plx` for ESP32/nRF52 hardware.
* [ ] **Training Journal:** A log for completed workouts (volume/time), separate from Max Testing.
* [ ] **Unit Conversion:** Global toggle for kg/lbs.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any features or bug fixes.

## 📄 License

This project is licensed under the MIT License.