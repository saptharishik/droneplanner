import React, { useState, useEffect } from 'react';
import { Battery, AlertTriangle, Settings, User, Compass } from 'lucide-react';

const DroneMissionPlanner = () => {
  const [connected, setConnected] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [batteryVolts, setBatteryVolts] = useState(18.89);
  const [droneData, setDroneData] = useState({
    xAxis: 24.8,
    yAxis: 14.6,
    velocity: 20.4,
    altitude: 197,
    disarmed: true,
    pitch: 10,
    yaw: 330,
    roll: 0,
    flightMode: 'Stabilize'
  });

  const flightModes = ['Land', 'Stabilize', 'AltHold', 'FlowHold'];

  // Simulate connection
  useEffect(() => {
    setTimeout(() => {
      setConnected(true);
    }, 2000);
  }, []);

  // Get rotation style for camera view based on roll, pitch, yaw
  const getRotationStyle = () => {
    return {
      transform: `perspective(1000px) rotateX(${-droneData.pitch}deg) rotateY(${droneData.roll}deg) rotateZ(${-droneData.yaw+180}deg)`
    };
  };
  
  const toggleArm = () => {
    setDroneData({...droneData, disarmed: !droneData.disarmed});
  };
  
  const changeFlightMode = (mode) => {
    setDroneData({...droneData, flightMode: mode});
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 sm:w-[1920px] w-full">
      {/* Header/Nav Bar with Battery */}
      <div className="bg-blue-900 py-2 px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-100">Drone Mission Planner</h1>
          <div className={`px-3 py-1 text-sm rounded-md ${connected ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          <div className="flex items-center gap-2 bg-blue-800 px-3 py-1 rounded-md">
            <Battery size={20} className={batteryLevel > 20 ? "text-green-400" : "text-red-400"} />
            <span className={`font-bold ${batteryLevel > 20 ? "text-green-400" : "text-red-400"}`}>
              {batteryLevel}%
            </span>
            <span className="text-sm text-white">{batteryVolts}v</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Settings size={20} className="text-blue-200 cursor-pointer" />
          <User size={20} className="text-blue-200 cursor-pointer" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 p-4 gap-4">
        {/* Camera Feed with HUD */}
        <div className="w-2/3 bg-blue-900 bg-opacity-20 rounded-lg relative overflow-hidden">
          {/* Sky and Ground Background with rotation */}
          <div className="absolute inset-0" style={getRotationStyle()}>
            <div className="w-full h-1/2 bg-blue-700 opacity-50"></div>
            <div className="w-full h-1/2 bg-green-800 opacity-50 absolute bottom-0"></div>
            
            {/* Artificial horizon lines */}
            <div className="absolute left-0 right-0 top-1/2 h-1 bg-yellow-500"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-yellow-500"></div>
            
            {/* Grid lines for better orientation */}
            <div className="grid grid-cols-12 h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-r border-white border-opacity-20 h-full"></div>
              ))}
            </div>
            <div className="grid grid-rows-12 w-full h-full">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border-b border-white border-opacity-20 w-full"></div>
              ))}
            </div>
          </div>
          
          {/* HUD Elements - These stay fixed regardless of rotation */}
          <div className="absolute inset-0 p-4">
            {/* Top Bar - Compass */}
            <div className="w-full flex justify-center">
              <div className="bg-blue-900 bg-opacity-60 px-4 py-1 rounded-lg flex items-center gap-2">
                <div className="text-blue-200 text-sm">
                  <span className="font-bold">{droneData.yaw}°</span>
                </div>
                <Compass size={16} className="text-blue-300" />
              </div>
            </div>

            {/* Center - Fixed Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64">
                {/* Center reticle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-16 h-8">
                    <div className="w-4 h-1 bg-red-500 absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                    <div className="w-4 h-1 bg-red-500 absolute top-1/2 right-0 transform -translate-y-1/2"></div>
                    <div className="w-3 h-3 border-2 border-red-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Position data */}
            <div className="absolute top-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-white flex flex-col gap-1">
              <div>X: <span className="text-green-400">{droneData.xAxis}</span></div>
              <div>Y: <span className="text-green-400">{droneData.yAxis}</span></div>
            </div>

            {/* Mode indicator */}
            <div className="absolute top-3 right-3 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-white">
              {droneData.flightMode}
            </div>

            {/* Attitude indicators */}
            <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 px-3 py-1 rounded-lg text-white flex flex-col gap-1">
              <div>Pitch: <span className="text-green-400">{droneData.pitch}°</span></div>
              <div>Roll: <span className="text-green-400">{droneData.roll}°</span></div>
            </div>

            {/* Low battery alert - conditional */}
            {batteryLevel < 30 && (
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-800 px-3 py-1 rounded-lg text-yellow-300 flex items-center gap-2">
                <AlertTriangle size={20} />
                <div>Low Battery! Return to home recommended</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Panel - Data and Controls */}
        <div className="w-1/3 flex flex-col gap-4">
          {/* Primary Flight Data */}
          <div className="grid grid-cols-2 gap-3">
            <DataTile title="X Axis" value={droneData.xAxis} unit="" />
            <DataTile title="Y Axis" value={droneData.yAxis} unit="" />
            <DataTile title="Height" value={droneData.altitude} unit="m" />
            <DataTile title="Velocity" value={droneData.velocity} unit="m/s" />
          </div>
          
          {/* Attitude Data */}
          <div className="grid grid-cols-3 gap-3">
            <DataTile title="Roll" value={droneData.roll} unit="°" />
            <DataTile title="Pitch" value={droneData.pitch} unit="°" />
            <DataTile title="Yaw" value={droneData.yaw} unit="°" />
          </div>
          
          {/* Flight Controls */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <div className="text-blue-300 text-sm mb-1">Flight Mode</div>
              <select 
                className="bg-blue-700 text-white w-full py-2 px-2 rounded"
                value={droneData.flightMode}
                onChange={(e) => changeFlightMode(e.target.value)}
              >
                {flightModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <div className="text-blue-300 text-sm mb-1">Arm/Disarm</div>
              <button 
                className={`${droneData.disarmed ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white w-full py-2 rounded font-semibold`}
                onClick={toggleArm}
              >
                {droneData.disarmed ? 'Arm' : 'Disarm'}
              </button>
            </div>
          </div>
          
          {/* Attitude Controls */}
          <div className="mt-2 grid grid-cols-1 gap-3">
            <div>
              <div className="text-blue-300 text-sm mb-1">Test Attitude Controls</div>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, pitch: droneData.pitch + 5})}
                >
                  Pitch +5°
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, pitch: droneData.pitch - 5})}
                >
                  Pitch -5°
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, pitch: 0})}
                >
                  Reset Pitch
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, roll: droneData.roll + 5})}
                >
                  Roll +5°
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, roll: droneData.roll - 5})}
                >
                  Roll -5°
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded" 
                  onClick={() => setDroneData({...droneData, roll: 0})}
                >
                  Reset Roll
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, yaw: (droneData.yaw + 10) % 360})}
                >
                  Yaw +10°
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, yaw: (droneData.yaw - 10 + 360) % 360})}
                >
                  Yaw -10°
                </button>
                <button
                  className="bg-blue-700 hover:bg-blue-600 text-white py-1 rounded"
                  onClick={() => setDroneData({...droneData, yaw: 0})}
                >
                  Reset Yaw
                </button>
              </div>
            </div>
          </div>
          
          {/* Alert Messages Panel */}
          <div className="bg-gray-800 rounded-lg p-3 flex-1">
            <div className="text-blue-300 font-semibold mb-2">Alert Messages</div>
            <div className="bg-gray-700 p-2 rounded text-yellow-300 text-sm">
              {batteryLevel < 30 ? (
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-1" />
                  <div>Low battery warning. Current level: {batteryLevel}%</div>
                </div>
              ) : (
                <div className="text-gray-400">No alerts</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Data Display Component
const DataTile = ({ title, value, unit }) => (
  <div className="bg-gray-800 rounded-lg p-3 text-blue-300">
    <div className="font-semibold text-sm mb-1">{title}</div>
    <div className="text-xl font-bold text-green-400">
      {value}{unit}
    </div>
  </div>
);

export default DroneMissionPlanner;