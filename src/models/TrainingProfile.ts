export enum HandType {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  BOTH = 'BOTH'
}

export enum GripType {
  HALF_CRIMP = 'HALF CRIMP',
  OPEN_HAND = 'OPEN HAND',
  FULL_CRIMP = 'FULL CRIMP'
}

// The Data Key (ID) will be a string combination: "BOTH_HALF_CRIMP_20mm"
export interface ExerciseStats {
  maxForce: number;      // Your MVC for this specific setup
  lastTestedDate: number; // Timestamp
  trainingVolume: number; // Total impulse (health bar)
}

export interface TrainingContext {
  hand: HandType;
  grip: GripType;
  holdName: string; // User typed: "20mm Edge", "Beastmaker Middle", "Doorframe"
}