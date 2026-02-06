import React from 'react';
import { GameState, Telemetry } from '../types';

interface HUDProps {
  telemetry: Telemetry;
  gameState: GameState;
}

const HUD: React.FC<HUDProps> = ({ telemetry, gameState }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-4 md:p-8 font-mono select-none overflow-hidden">
      
      {/* Top Section */}
      <div className="flex justify-between items-start gap-2">
        {/* Expanded max-width and removed truncation to show full game name */}
        <div className="bg-white/70 border-l-4 border-blue-600 p-2 md:p-4 backdrop-blur-md shadow-sm border border-slate-200 max-w-[65%] md:max-w-md">
          <h1 className="text-[10px] sm:text-sm md:text-xl font-bold tracking-tighter text-slate-900 font['Orbitron'] leading-tight">
            <span className="text-blue-600">LIGHTHOUSE</span> PRECISION ROTATION
          </h1>
          <div className="text-[8px] md:text-[10px] text-slate-500 mt-0.5 md:mt-1 uppercase tracking-widest flex items-center gap-1 md:gap-2">
            <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${gameState === GameState.SUCCESS ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></span>
            <span className="truncate">Status: {telemetry.status}</span>
          </div>
        </div>

        <div className="bg-white/70 border-r-4 border-blue-600 p-2 md:p-4 text-right backdrop-blur-md shadow-sm border border-slate-200 max-w-[35%] shrink-0">
          <div className="text-[8px] md:text-xs text-slate-400 truncate uppercase">INTEGRITY</div>
          <div className="text-sm md:text-2xl font-bold text-slate-900 leading-none">100.0%</div>
        </div>
      </div>

      {/* Middle Feedback */}
      <div className="flex flex-1 items-center justify-center p-4">
        {telemetry.isAligned && gameState === GameState.ROTATING && (
          <div className="animate-bounce bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 md:px-8 py-2 md:py-4 rounded shadow-lg backdrop-blur-xl text-center max-w-sm">
            <p className="text-sm md:text-2xl font-bold tracking-tight">ALIGNMENT ACHIEVED</p>
            <p className="text-[10px] md:text-sm mt-1 font-bold">PRESS [SPACE] TO LAND</p>
          </div>
        )}
        
        {gameState === GameState.SUCCESS && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 md:px-8 py-3 md:py-6 rounded shadow-2xl backdrop-blur-xl text-center max-w-sm">
            <p className="text-lg md:text-3xl font-bold tracking-tight">INSTALLED</p>
            <p className="text-[10px] md:text-sm mt-2 font-semibold uppercase">Verification complete. Resetting...</p>
          </div>
        )}
      </div>

      {/* Bottom Telemetry */}
      <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-6 items-stretch md:items-end">
        
        {/* Controls */}
        <div className="hidden md:block col-span-3 bg-white/80 border border-slate-200 p-4 backdrop-blur-md shadow-sm rounded-sm">
          <h3 className="text-xs font-bold text-slate-400 mb-2 border-b border-slate-100 pb-1 uppercase">Controls</h3>
          <ul className="text-[11px] space-y-2">
            <li className="flex justify-between">
              <span className="text-blue-600 font-bold">[←] [→]</span>
              <span className="text-slate-600 uppercase">Rotate</span>
            </li>
            <li className="flex justify-between">
              <span className="text-blue-600 font-bold">[SPACE]</span>
              <span className="text-slate-600 uppercase">Install</span>
            </li>
          </ul>
        </div>

        {/* Center Readout */}
        <div className="col-span-12 md:col-span-6 bg-white/90 border-t-2 border-blue-600 p-3 md:p-6 backdrop-blur-xl shadow-xl flex justify-around items-center rounded-lg md:rounded-t-lg md:rounded-b-none border border-slate-200">
          <div className="text-center px-2 md:px-4 border-r border-slate-100 shrink-0">
            <div className="text-[8px] md:text-[10px] text-slate-400 uppercase">Current</div>
            <div className="text-lg md:text-3xl font-bold text-slate-900 leading-none py-1 md:py-2">
              {Math.abs(telemetry.currentAngle).toFixed(1)}°
            </div>
          </div>

          <div className="flex-1 px-3 md:px-8">
             <div className="text-[8px] md:text-[10px] text-slate-400 flex justify-between mb-1 font-bold">
               <span className="hidden sm:inline">SYNC</span>
               <span className={telemetry.isAligned ? 'text-emerald-600' : 'text-blue-600'}>
                {Math.max(0, 100 - Math.abs(telemetry.currentAngle - telemetry.targetAngle) * 2).toFixed(0)}%
               </span>
             </div>
             <div className="h-1 md:h-1.5 bg-slate-100 w-full relative overflow-hidden rounded-full">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${telemetry.isAligned ? 'bg-emerald-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.max(0, 100 - Math.abs(telemetry.currentAngle - telemetry.targetAngle) * 2)}%` }}
                />
             </div>
          </div>

          <div className="text-center px-2 md:px-4 border-l border-slate-100 shrink-0">
            <div className="text-[8px] md:text-[10px] text-slate-400 uppercase">Target</div>
            <div className="text-lg md:text-3xl font-bold text-emerald-600 leading-none py-1 md:py-2">
              {telemetry.targetAngle.toFixed(1)}°
            </div>
          </div>
        </div>

        {/* Momentum Gauge */}
        <div className="col-span-12 md:col-span-3 bg-white/80 border border-slate-200 p-3 md:p-4 backdrop-blur-md shadow-sm rounded-lg md:rounded-sm">
          <h3 className="hidden md:block text-xs font-bold text-slate-400 mb-2 border-b border-slate-100 pb-1 uppercase">Momentum</h3>
          <div className="flex md:block items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] text-slate-500 uppercase">Velocity</span>
              <span className="text-xs md:text-sm text-blue-600 font-bold">{Math.abs(telemetry.velocity).toFixed(2)} RPM</span>
            </div>
            <div className="flex-1 md:w-full bg-slate-100 h-1 md:h-1.5 mt-0 md:mt-2 overflow-hidden rounded-full">
               <div 
                 className="h-full bg-blue-500/30 transition-all rounded-full"
                 style={{ width: `${Math.min(100, Math.abs(telemetry.velocity) * 4)}%` }}
               />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HUD;