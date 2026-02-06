
export enum GameState {
  INITIAL = 'INITIAL',
  ROTATING = 'ROTATING',
  DESCENDING = 'DESCENDING',
  SUCCESS = 'SUCCESS'
}

export interface Telemetry {
  currentAngle: number;
  targetAngle: number;
  velocity: number;
  isAligned: boolean;
  status: string;
}
