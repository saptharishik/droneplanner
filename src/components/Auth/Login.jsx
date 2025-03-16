import React, { useState, useEffect } from 'react';
import { 
  Battery, 
  AlertTriangle, 
  Settings, 
  User, 
  Compass, 
  ChevronRight,
  X,
  ThermometerSun,
  MapPin,
  BarChart3,
  Wind
} from 'lucide-react';

const DroneMissionPlanner = () => {
  // Connection state
  const [connected, setConnected] = useState(false);
  
  // Battery data
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [batteryVolts, setBatteryVolts] = useState(18.89);
  
  // Alert system
  const [alertMessages, setAlertMessages] = useState([]);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // Drone telemetry data
  const [droneData, setDroneData] = useState({
    xAxis: 24.8,
    yAxis: 14.6,
    velocity: 20.4,
    altitude: 197,
    disarmed: true,
    pitch: 10,
    yaw: 330,
    roll: 0,
    flightMode: 'Stabilize',
    throttlePercent: 45,
    heading: 330,
    homeDistance: 125,
    gpsSignal: 8, // Number of satellites
    temperature: 28
  });

  const flightModes = ['Land', 'Stabilize', 'AltHold', 'FlowHold', 'Loiter', 'RTL', 'Auto'];

  // Simulate connection and data updates
  useEffect(() => {
    // Simulate connection
    const connectionTimer = setTimeout(() => {
      setConnected(true);
      
      // Add initial alert
      setAlertMessages([
        { id: 1, type: 'info', message: 'Drone connected successfully', timestamp: new Date() }
      ]);
      
      // Check battery level and add warning if low
      if (batteryLevel < 30) {
        setAlertMessages(prev => [
          ...prev,
          { 
            id: 2, 
            type: 'warning', 
            message: `Low battery warning: ${batteryLevel}%`, 
            timestamp: new Date() 
          }
        ]);
      }
    }, 2000);
    
    // Simulate data updates from "backend"
    const dataUpdateInterval = setInterval(() => {
      if (connected && !droneData.disarmed) {
        // Only update if connected and armed
        setDroneData(prev => ({
          ...prev,
          altitude: prev.altitude + (Math.random() * 0.4 - 0.2), // Small random changes
          velocity: Math.max(0, prev.velocity + (Math.random() * 0.6 - 0.3)),
          xAxis: prev.xAxis + (Math.random() * 0.2 - 0.1),
          yAxis: prev.yAxis + (Math.random() * 0.2 - 0.1),
          throttlePercent: Math.min(100, Math.max(0, prev.throttlePercent + (Math.random() * 2 - 1)))
        }));
        
        // Gradually decrease battery
        setBatteryLevel(prev => Math.max(0, prev - 0.01));
        setBatteryVolts(prev => Math.max(14, prev - 0.001));
      }
    }, 500);
    
    return () => {
      clearTimeout(connectionTimer);
      clearInterval(dataUpdateInterval);
    };
  }, [connected, droneData.disarmed, batteryLevel]);

  // Check for low battery and add warning
  useEffect(() => {
    if (batteryLevel < 30 && batteryLevel > 29.9) {
      // Only add the warning once when dropping below 30%
      setAlertMessages(prev => [
        ...prev,
        { 
          id: Date.now(), 
          type: 'warning', 
          message: `Low battery warning: ${batteryLevel.toFixed(0)}%`, 
          timestamp: new Date() 
        }
      ]);
    }
  }, [batteryLevel]);

  // Get rotation style for orientation visualization
  const getRotationStyle = () => {
    return {
      transform: `perspective(1000px) rotateX(${-droneData.pitch}deg) rotateY(${droneData.roll}deg) rotateZ(${-droneData.yaw+180}deg)`
    };
  };
  
  // Controls
  const toggleArm = () => {
    setDroneData({...droneData, disarmed: !droneData.disarmed});
    
    // Add alert message
    setAlertMessages(prev => [
      ...prev,
      { 
        id: Date.now(), 
        type: 'info', 
        message: droneData.disarmed ? 'Drone armed' : 'Drone disarmed', 
        timestamp: new Date() 
      }
    ]);
  };
  
  const changeFlightMode = (mode) => {
    setDroneData({...droneData, flightMode: mode});
    
    // Add alert message
    setAlertMessages(prev => [
      ...prev,
      { 
        id: Date.now(), 
        type: 'info', 
        message: `Flight mode changed to ${mode}`, 
        timestamp: new Date() 
      }
    ]);
  };
  
  // Get alert count for badge
  const getActiveAlertCount = () => {
    return alertMessages.length;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
      {/* Enhanced Header/Nav Bar */}
      <div className="bg-gray-800 py-2 px-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-blue-400">Drone Mission Planner</h1>
          <div className={`px-3 py-1 text-sm rounded-md ${connected ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-300' : 'bg-red-300'}`}></div>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Battery status with improved visualization */}
          <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 rounded-md">
            <Battery 
              size={20} 
              className={
                batteryLevel > 50 ? "text-green-400" : 
                batteryLevel > 20 ? "text-yellow-400" : 
                "text-red-400"
              } 
            />
            <span className={
              batteryLevel > 50 ? "font-bold text-green-400" : 
              batteryLevel > 20 ? "font-bold text-yellow-400" : 
              "font-bold text-red-400"
            }>
              {batteryLevel.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-300">{batteryVolts.toFixed(2)}v</span>
          </div>
          
          {/* Alert notifications with badge */}
          <div 
            className="relative cursor-pointer" 
            onClick={() => setShowAlertModal(true)}
          >
            <AlertTriangle size={22} className="text-yellow-400" />
            {getActiveAlertCount() > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveAlertCount()}
              </div>
            )}
          </div>
          
          <Settings size={22} className="text-blue-300 cursor-pointer" />
          <User size={22} className="text-blue-300 cursor-pointer" />
        </div>
      </div>

      {/* Main Content with Dual Camera Feeds */}
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Left Column - Camera Feeds */}
        <div className="w-3/5 flex flex-col gap-4">
          {/* Primary Camera Feed */}
          <div className="h-1/2 bg-black rounded-lg relative overflow-hidden border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Placeholder for actual camera feed from drone */}
              <div className="text-gray-500">Live Camera Feed</div>
              {/* Overlay HUD elements */}
              <div className="absolute inset-0">
                {/* Flight mode */}
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 px-3 py-1 rounded text-yellow-400">
                  {droneData.flightMode}
                </div>
                
                {/* Battery indicator */}
                <div className="absolute top-3 left-3 bg-black bg-opacity-60 px-3 py-1 rounded flex items-center gap-2">
                  <Battery 
                    size={16} 
                    className={
                      batteryLevel > 50 ? "text-green-400" : 
                      batteryLevel > 20 ? "text-yellow-400" : 
                      "text-red-400"
                    }
                  />
                  <span className={
                    batteryLevel > 50 ? "text-green-400" : 
                    batteryLevel > 20 ? "text-yellow-400" : 
                    "text-red-400"
                  }>
                    {batteryLevel.toFixed(0)}%
                  </span>
                </div>
                
                {/* Center reticle */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 relative">
                    <div className="w-4 h-1 bg-red-500 absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                    <div className="w-4 h-1 bg-red-500 absolute top-1/2 right-0 transform -translate-y-1/2"></div>
                    <div className="w-1 h-4 bg-red-500 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                    <div className="w-1 h-4 bg-red-500 absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                    <div className="w-3 h-3 border-2 border-red-500 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
                
                {/* Position */}
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 px-3 py-1 rounded">
                  <div className="text-xs text-green-400">
                    X: {droneData.xAxis.toFixed(1)} Y: {droneData.yAxis.toFixed(1)}
                  </div>
                </div>
                
                {/* Altitude and velocity */}
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 px-3 py-1 rounded">
                  <div className="text-xs text-green-400">
                    ALT: {droneData.altitude.toFixed(1)}m SPD: {droneData.velocity.toFixed(1)}m/s
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Orientation Visualization */}
          <div className="h-1/2 bg-gray-800 rounded-lg relative overflow-hidden border border-gray-700">
            {/* Sky and Ground with improved visualization */}
            <div className="absolute inset-0" style={getRotationStyle()}>
              {/* Gradient sky */}
              <div className="w-full h-1/2 bg-gradient-to-b from-blue-900 to-blue-600 opacity-80"></div>
              {/* Gradient ground with terrain texture */}
              <div className="w-full h-1/2 bg-gradient-to-b from-green-800 to-green-900 opacity-80 absolute bottom-0"></div>
              
              {/* Artificial horizon with improved visibility */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-yellow-400"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-yellow-400"></div>
              
              {/* Improved grid lines for better orientation */}
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
              
              {/* Compass markers */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-yellow-400 text-lg font-bold">N</div>
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-yellow-400 text-lg font-bold">S</div>
                <div className="absolute left-10 top-1/2 transform -translate-y-1/2 text-yellow-400 text-lg font-bold">W</div>
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-yellow-400 text-lg font-bold">E</div>
              </div>
              
              {/* Additional perspective lines */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative h-96 w-96">
                  <div className="absolute border-2 border-dashed border-white border-opacity-20 h-full w-full"></div>
                  <div className="absolute border-2 border-dashed border-white border-opacity-20 h-3/4 w-3/4 top-1/8 left-1/8"></div>
                  <div className="absolute border-2 border-dashed border-white border-opacity-20 h-1/2 w-1/2 top-1/4 left-1/4"></div>
                  <div className="absolute border-2 border-dashed border-white border-opacity-20 h-1/4 w-1/4 top-3/8 left-3/8"></div>
                </div>
              </div>
            </div>
            
            {/* Enhanced HUD Elements - Fixed overlay */}
            <div className="absolute inset-0 p-4">
              {/* Top Bar - Compass */}
              <div className="w-full flex justify-center">
                <div className="bg-black bg-opacity-60 px-4 py-1 rounded-lg flex items-center gap-2">
                  <div className="text-blue-300 text-sm">
                    Heading: <span className="font-bold text-blue-300">{droneData.yaw}°</span>
                  </div>
                  <Compass size={16} className="text-blue-300" />
                </div>
              </div>

              {/* Center - Enhanced Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-64 h-64">
                  {/* Center reticle with improved design */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-24 h-24 relative">
                      <div className="w-6 h-1 bg-yellow-400 absolute top-1/2 left-0 transform -translate-y-1/2"></div>
                      <div className="w-6 h-1 bg-yellow-400 absolute top-1/2 right-0 transform -translate-y-1/2"></div>
                      <div className="w-1 h-6 bg-yellow-400 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="w-1 h-6 bg-yellow-400 absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                      <div className="w-4 h-4 border-2 border-yellow-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="w-6 h-6 border border-yellow-400 border-dashed rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Improved attitude indicators */}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 px-3 py-2 rounded-lg flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-20">Roll:</div>
                  <div className="text-green-400">{droneData.roll.toFixed(1)}°</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20">Pitch:</div>
                  <div className="text-green-400">{droneData.pitch.toFixed(1)}°</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20">Yaw:</div>
                  <div className="text-green-400">{droneData.yaw.toFixed(1)}°</div>
                </div>
              </div>
              
              {/* Throttle indicator */}
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 px-3 py-2 rounded-lg">
                <div className="text-xs mb-1">Throttle</div>
                <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      droneData.throttlePercent > 80 ? 'bg-red-500' :
                      droneData.throttlePercent > 50 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${droneData.throttlePercent}%` }}
                  ></div>
                </div>
                <div className="text-xs mt-1 text-center">{droneData.throttlePercent.toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Enhanced Data and Controls */}
        <div className="w-2/5 flex flex-col gap-4 overflow-auto">
          {/* Status Panel */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h2 className="text-lg font-bold text-blue-400 mb-2">Drone Status</h2>
            
            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Arm/Disarm Control */}
              <div className="col-span-2">
                <button 
                  className={`
                    w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2
                    ${droneData.disarmed 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'}
                  `}
                  onClick={toggleArm}
                >
                  <div className={`w-3 h-3 rounded-full ${droneData.disarmed ? 'bg-white' : 'bg-white animate-pulse'}`}></div>
                  {droneData.disarmed ? 'ARM DRONE' : 'DISARM DRONE'}
                </button>
              </div>
              
              {/* Flight Mode Selection with improved styling */}
              <div className="col-span-2">
                <div className="text-blue-300 text-sm mb-1">Flight Mode</div>
                <select 
                  className="bg-gray-700 border border-gray-600 text-white w-full py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={droneData.flightMode}
                  onChange={(e) => changeFlightMode(e.target.value)}
                >
                  {flightModes.map(mode => (
                    <option key={mode} value={mode}>{mode}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Telemetry Data */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h2 className="text-lg font-bold text-blue-400 mb-2">Telemetry</h2>
            
            {/* Primary Flight Data */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <DataTile title="X Axis" value={droneData.xAxis.toFixed(1)} unit="" icon={<MapPin size={16} />} />
              <DataTile title="Y Axis" value={droneData.yAxis.toFixed(1)} unit="" icon={<MapPin size={16} />} />
              <DataTile title="Altitude" value={droneData.altitude.toFixed(1)} unit="m" icon={<BarChart3 size={16} />} />
              <DataTile title="Velocity" value={droneData.velocity.toFixed(1)} unit="m/s" icon={<Wind size={16} />} />
            </div>
            
            {/* Attitude Data */}
            <h3 className="text-md font-bold text-blue-300 mb-2">Attitude</h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <DataTile title="Roll" value={droneData.roll.toFixed(1)} unit="°" />
              <DataTile title="Pitch" value={droneData.pitch.toFixed(1)} unit="°" />
              <DataTile title="Yaw" value={droneData.yaw.toFixed(1)} unit="°" />
            </div>
            
            {/* Additional Data */}
            <h3 className="text-md font-bold text-blue-300 mb-2">System</h3>
            <div className="grid grid-cols-2 gap-3">
              <DataTile 
                title="Throttle" 
                value={droneData.throttlePercent.toFixed(0)} 
                unit="%" 
                progressBar={{
                  value: droneData.throttlePercent,
                  color: droneData.throttlePercent > 80 ? 'red' : 
                         droneData.throttlePercent > 50 ? 'yellow' : 
                         'green'
                }}
              />
              <DataTile 
                title="Battery" 
                value={batteryLevel.toFixed(1)} 
                unit="%" 
                progressBar={{
                  value: batteryLevel,
                  color: batteryLevel > 50 ? 'green' : 
                         batteryLevel > 20 ? 'yellow' : 
                         'red'
                }}
              />
              <DataTile title="GPS Signal" value={droneData.gpsSignal} unit=" sats" />
              <DataTile title="Temperature" value={droneData.temperature} unit="°C" icon={<ThermometerSun size={16} />} />
            </div>
          </div>
          
          {/* Attitude Control Panel */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h2 className="text-lg font-bold text-blue-400 mb-2">Attitude Controls</h2>
            
            <div className="grid grid-cols-3 gap-2">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, pitch: droneData.pitch + 5})}
              >
                Pitch +5°
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, pitch: droneData.pitch - 5})}
              >
                Pitch -5°
              </button>
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, pitch: 0})}
              >
                Reset Pitch
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, roll: droneData.roll + 5})}
              >
                Roll +5°
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, roll: droneData.roll - 5})}
              >
                Roll -5°
              </button>
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-1 rounded-lg" 
                onClick={() => setDroneData({...droneData, roll: 0})}
              >
                Reset Roll
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, yaw: (droneData.yaw + 10) % 360})}
              >
                Yaw +10°
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, yaw: (droneData.yaw - 10 + 360) % 360})}
              >
                Yaw -10°
              </button>
              <button
                className="bg-blue-800 hover:bg-blue-900 text-white py-2 px-1 rounded-lg"
                onClick={() => setDroneData({...droneData, yaw: 0})}
              >
                Reset Yaw
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full max-h-96 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
                <AlertTriangle size={20} className="text-yellow-400" />
                Alert Messages
              </h2>
              <button 
                className="text-gray-400 hover:text-white"
                onClick={() => setShowAlertModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 pr-2">
              {alertMessages.length > 0 ? (
                <div className="space-y-2">
                  {alertMessages.map(alert => (
                    <div 
                      key={alert.id} 
                      className={`p-2 rounded-lg flex items-start gap-2 ${
                        alert.type === 'warning' ? 'bg-yellow-900 bg-opacity-30 border border-yellow-700' : 
                        alert.type === 'error' ? 'bg-red-900 bg-opacity-30 border border-red-700' :
                        'bg-blue-900 bg-opacity-30 border border-blue-700'
                      }`}
                    >
                      <div>
                        {alert.type === 'warning' ? (
                          <AlertTriangle size={16} className="text-yellow-400 mt-1" />
                        ) : alert.type === 'error' ? (
                          <AlertTriangle size={16} className="text-red-400 mt-1" />
                        ) : (
                          <ChevronRight size={16} className="text-blue-400 mt-1" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm ${
                          alert.type === 'warning' ? 'text-yellow-300' : 
                          alert.type === 'error' ? 'text-red-300' :
                          'text-blue-300'
                        }`}>
                          {alert.message}
                        </div>
                        <div className="text-xs text-gray-400">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 text-center py-4">No alerts</div>
              )}
            </div>
            
            <div className="mt-4 flex justify-end">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                onClick={() => setShowAlertModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced Data Display Component with optional progress bar and icon
const DataTile = ({ title, value, unit, progressBar, icon }) => (
  <div className="bg-gray-700 rounded-lg p-3 text-blue-200">
    <div className="font-semibold text-xs mb-1 flex items-center gap-1">
      {icon && <span className="text-blue-300">{icon}</span>}
      {title}
    </div>
    
    <div className="text-xl font-bold text-green-400">
      {value}{unit}
    </div>
    
    {progressBar && (
      <div className="mt-1">
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${
              progressBar.color === 'red' ? 'bg-red-500' :
              progressBar.color === 'yellow' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${progressBar.value}%` }}
          ></div>
        </div>
      </div>
    )}
  </div>
);

export default DroneMissionPlanner;