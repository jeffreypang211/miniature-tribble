import React, { useState, useCallback, useEffect } from 'react';
import GameScene from './components/GameScene';
import HUD from './components/HUD';
import { GameState, Telemetry } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.ROTATING);
  const [telemetry, setTelemetry] = useState<Telemetry>({
    currentAngle: 0,
    targetAngle: 0,
    velocity: 0,
    isAligned: false,
    status: 'SYSTEMS ONLINE'
  });

  const handleTelemetryUpdate = useCallback((data: Telemetry) => {
    setTelemetry(data);
  }, []);

  const handleStateChange = useCallback((newState: GameState) => {
    setGameState(newState);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-slate-50 overflow-hidden">
      {/* Scanline visual effect */}
      <div className="scanline pointer-events-none" />
      
      {/* 3D Scene Layer */}
      <GameScene 
        gameState={gameState} 
        onTelemetryUpdate={handleTelemetryUpdate}
        onStateChange={handleStateChange}
      />

      {/* UI/HUD Layer */}
      <HUD 
        telemetry={telemetry} 
        gameState={gameState}
      />

      {/* Ambient decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full border-[1px] border-slate-200 pointer-events-none z-40" />
      <div className="absolute bottom-4 left-4 text-[10px] text-slate-400 font-mono tracking-widest z-40 uppercase">
        LIGHTHOUSE PRECISION ROTATION // Rev 3.0
      </div>
    </div>
  );
};

export default App;