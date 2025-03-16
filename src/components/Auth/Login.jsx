import React, { useState, useEffect, useCallback } from 'react';
import { 
  Battery, 
  AlertTriangle, 
  Settings, 
  User, 
  Compass, 
  ChevronRight,
  X,
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
  
  // Camera view controls
  const [cameraView, setCameraView] = useState('side-by-side'); // 'side-by-side', 'live', 'orientation'
  
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
    opticalX: 0.02,
    opticalY: -0.03
  });

  const flightModes = ['Land', 'Stabilize', 'AltHold', 'FlowHold', 'Loiter', 'RTL', 'Auto'];

  // Direction control handler
  const handleDirection = useCallback((direction) => {
    switch(direction) {
      case 'forward':
        setDroneData(prev => ({...prev, pitch: ((prev.pitch - 5) % 360 + 360) % 360}));
        break;
      case 'backward':
        setDroneData(prev => ({...prev, pitch: ((prev.pitch + 5) % 360 + 360) % 360}));
        break;
      case 'left':
        setDroneData(prev => ({...prev, roll: ((prev.roll - 5) % 360 + 360) % 360}));
        break;
      case 'right':
        setDroneData(prev => ({...prev, roll: ((prev.roll + 5) % 360 + 360) % 360}));
        break;
      case 'reset':
        setDroneData(prev => ({...prev, pitch: 0, roll: 0}));
        break;
      default:
        break;
    }
  }, []);

  // Height and yaw control handler
  const handleHeightYaw = useCallback((action) => {
    switch(action) {
      case 'up':
        // Increase throttle by 5%, ensuring it doesn't exceed 100%
        setDroneData(prev => ({...prev, throttlePercent: Math.min(100, prev.throttlePercent + 5)}));
        break;
      case 'down':
        // Decrease throttle by 5%, ensuring it doesn't go below 0%
        setDroneData(prev => ({...prev, throttlePercent: Math.max(0, prev.throttlePercent - 5)}));
        break;
      case 'rotateLeft':
        setDroneData(prev => ({...prev, yaw: ((prev.yaw - 10) % 360 + 360) % 360}));
        break;
      case 'rotateRight':
        setDroneData(prev => ({...prev, yaw: (prev.yaw + 10) % 360}));
        break;
      case 'reset':
        setDroneData(prev => ({...prev, yaw: 0, throttlePercent: 45})); // Reset throttle to default
        break;
      default:
        break;
    }
  }, []);

  // Global reset handler
  const handleGlobalReset = useCallback(() => {
    handleDirection('reset');
    handleHeightYaw('reset');
  }, [handleDirection, handleHeightYaw]);

  // Keyboard control listener
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return; // Don't handle keys when user is typing in form elements
      }

      // Prevent default behavior for these keys to avoid scrolling etc.
      if (['w', 'a', 's', 'd', 'i', 'j', 'k', 'l', ' ', '8', '2', '4', '6'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      switch(e.key.toLowerCase()) {
        // Direction controls (WASD)
        case 'w':
          handleDirection('forward');
          break;
        case 's':
          handleDirection('backward');
          break;
        case 'a':
          handleDirection('left');
          break;
        case 'd':
          handleDirection('right');
          break;
          
        // Height/Yaw controls (IJKL and numeric pad)
        case 'i':
        case '8':
          handleHeightYaw('up');
          break;
        case 'k':
        case '2':
          handleHeightYaw('down');
          break;
        case 'j':
        case '4':
          handleHeightYaw('rotateLeft');
          break;
        case 'l':
        case '6':
          handleHeightYaw('rotateRight');
          break;
        
        // Space for global reset
        case ' ':
          handleGlobalReset();
          break;
        
        default:
          break;
      }
    };

    window.addEventListener('keydown', keyHandler);
    return () => {
      window.removeEventListener('keydown', keyHandler);
    };
  }, [handleDirection, handleHeightYaw, handleGlobalReset]);

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
    // Simulate data updates from "backend"
const dataUpdateInterval = setInterval(() => {
  if (connected && !droneData.disarmed) {
    // Only update if connected and armed
    setDroneData(prev => {
      // Calculate altitude change based on throttle
      // When throttle is at 50%, the drone maintains altitude
      // When above 50%, it rises; when below 50%, it falls
      const altitudeChangeRate = (prev.throttlePercent - 50) / 25; // Roughly -2 to +2 range
      
      return {
        ...prev,
        // Altitude now responds directly to throttle setting
        altitude: prev.altitude + altitudeChangeRate + (Math.random() * 0.2 - 0.1),
        velocity: Math.max(0, prev.velocity + (Math.random() * 0.6 - 0.3)),
        xAxis: prev.xAxis + (Math.random() * 0.2 - 0.1),
        yAxis: prev.yAxis + (Math.random() * 0.2 - 0.1),
        // Rest remains the same
        pitch: ((prev.pitch + (Math.random() * 0.1 - 0.05)) % 360 + 360) % 360,
        roll: ((prev.roll + (Math.random() * 0.1 - 0.05)) % 360 + 360) % 360,
        yaw: ((prev.yaw + (Math.random() * 0.2 - 0.1)) % 360 + 360) % 360,
        heading: ((prev.heading + (Math.random() * 0.2 - 0.1)) % 360 + 360) % 360,
        throttlePercent: Math.min(100, Math.max(0, prev.throttlePercent + (Math.random() * 0.5 - 0.25))), // Less random drift
        opticalX: prev.opticalX + (Math.random() * 0.02 - 0.01),
        opticalY: prev.opticalY + (Math.random() * 0.02 - 0.01)
      };
    });
    
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
    // Ensure yaw, pitch, and roll are properly bounded for smooth visualization
    const normalizedYaw = ((droneData.yaw % 360) + 360) % 360;
    const normalizedPitch = ((droneData.pitch % 360) + 360) % 360;
    const normalizedRoll = ((droneData.roll % 360) + 360) % 360;
    
    // Note: Using positive yaw value for correct rotation direction
    return {
      transform: `perspective(1000px) rotateX(${-normalizedPitch}deg) rotateY(${normalizedRoll}deg) rotateZ(${normalizedYaw}deg)`
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

      {/* Main Content with Camera Feeds */}
      <div className="flex flex-1 p-4 gap-4 overflow-hidden">
        {/* Camera View Controls */}
        <div className={`${cameraView === 'side-by-side' ? 'w-3/5' : 'w-4/5'} flex flex-col gap-4`}>
          {/* Camera View Switcher */}
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-blue-400">Camera Feeds</h2>
            <div className="flex gap-2">
              <button 
                className={`px-3 py-1 rounded-lg text-sm font-medium ${cameraView === 'side-by-side' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setCameraView('side-by-side')}
              >
                Side by Side
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm font-medium ${cameraView === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setCameraView('live')}
              >
                Live Feed Only
              </button>
              <button 
                className={`px-3 py-1 rounded-lg text-sm font-medium ${cameraView === 'orientation' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                onClick={() => setCameraView('orientation')}
              >
                Orientation Only
              </button>
            </div>
          </div>

          {/* Camera Feeds - Adjusts based on selected view */}
          {(cameraView === 'side-by-side' || cameraView === 'live') && (
            <div className={`${cameraView === 'side-by-side' ? 'h-1/2' : 'h-full'} bg-black rounded-lg relative overflow-hidden border border-gray-700`}>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Placeholder for actual camera feed from drone */}
                <div className="text-gray-500">Live Camera Feed</div>
                
                {/* Overlay HUD elements */}
                <div className="absolute inset-0">
                  {/* Camera switcher controls */}
                  {cameraView !== 'side-by-side' && (
                    <div className="absolute top-1/2 left-3 transform -translate-y-1/2 z-10">
                      <button 
                        className="bg-black bg-opacity-60 p-2 rounded-full text-white hover:bg-opacity-80"
                        onClick={() => setCameraView('orientation')}
                        title="Switch to Orientation View"
                      >
                        <Compass size={20} className="text-blue-300" />
                      </button>
                    </div>
                  )}
                  
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
          )}
          
          {/* Enhanced Orientation Visualization */}
          {(cameraView === 'side-by-side' || cameraView === 'orientation') && (
            <div className={`${cameraView === 'side-by-side' ? 'h-1/2' : 'h-full'} bg-gray-800 rounded-lg relative overflow-hidden border border-gray-700`}>
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
                {/* Camera switcher controls */}
                {cameraView !== 'side-by-side' && (
                  <div className="absolute top-1/2 left-3 transform -translate-y-1/2 z-10">
                    <button 
                      className="bg-black bg-opacity-60 p-2 rounded-full text-white hover:bg-opacity-80"
                      onClick={() => setCameraView('live')}
                      title="Switch to Live Camera"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300" width="20" height="20">
                        <path d="M23 7l-7 5 7 5V7z"/>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                      </svg>
                    </button>
                  </div>
                )}
              
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
          )}
        </div>
        
        {/* Right Column - Enhanced Data and Controls - dynamically adjust width */}
        <div className={`${cameraView === 'side-by-side' ? 'w-2/5' : 'w-1/5'} flex flex-col gap-4 overflow-auto`}>
          {/* Status Panel */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h2 className="text-lg font-bold text-blue-400 mb-2">Drone Status</h2>
            
            {/* Status Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Arm/Disarm Control */}
              <div className="col-span-2">
                <ArmDisarmButton 
                  isDisarmed={droneData.disarmed} 
                  onToggle={toggleArm} 
                />
              </div>
              
              {/* Flight Mode Selection with improved styling */}
              <div className="col-span-2">
                <FlightModeSelector 
                  currentMode={droneData.flightMode}
                  modes={flightModes}
                  onChange={changeFlightMode}
                />
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
              <DataTile title="Optical X" value={droneData.opticalX.toFixed(3)} unit="m/s" />
              <DataTile title="Optical Y" value={droneData.opticalY.toFixed(3)} unit="m/s" />
            </div>
          </div>
          

          
          {/* Attitude Control Panel */}
          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <h2 className="text-lg font-bold text-blue-400 mb-2">Attitude Controls</h2>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Direction Controls */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-blue-300 text-sm mb-2 text-center font-medium group relative">
                  Direction
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none w-48 z-10">
                    <div className="flex justify-between mb-1">
                      <span>W - Forward</span>
                      <span>S - Backward</span>
                    </div>
                    <div className="flex justify-between">
                      <span>A - Left</span>
                      <span>D - Right</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {/* Top row (W) */}
                  <div className="w-full flex justify-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold"
                      onClick={(e) => {e.preventDefault(); handleDirection('forward');}}
                      title="W - Forward"
                    >
                      W
                    </button>
                  </div>
                  
                  {/* Middle row (A, RESET, D) */}
                  <div className="w-full flex justify-between items-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold"
                      onClick={(e) => {e.preventDefault(); handleDirection('left');}}
                      title="A - Left"
                    >
                      A
                    </button>
                    
                    <button 
                      className="bg-blue-800 hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-lg text-xs"
                      onClick={(e) => {e.preventDefault(); handleDirection('reset');}}
                      title="Reset Direction"
                    >
                      RESET
                    </button>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold"
                      onClick={(e) => {e.preventDefault(); handleDirection('right');}}
                      title="D - Right"
                    >
                      D
                    </button>
                  </div>
                  
                  {/* Bottom row (S) */}
                  <div className="w-full flex justify-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold"
                      onClick={(e) => {e.preventDefault(); handleDirection('backward');}}
                      title="S - Backward"
                    >
                      S
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Height & Yaw Controls */}
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-blue-300 text-sm mb-2 text-center font-medium group relative">
                  Throttle
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-24 left-1/2 transform -translate-x-1/2 pointer-events-none w-48 z-10">
                    <div className="flex justify-between mb-1">
                      <span>I/8 - Increase 5%</span>
                      <span>K/2 - Decrease 5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>J/4 - Rotate Left</span>
                      <span>L/6 - Rotate Right</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  {/* Top row (Up arrow) */}
                  <div className="w-full flex justify-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg"
                      onClick={(e) => {e.preventDefault(); handleHeightYaw('up');}}
                      title="I/8 - Up"
                    >
                      <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-white"></div>
                    </button>
                  </div>
                  
                  {/* Middle row (Left arrow, RESET, Right arrow) */}
                  <div className="w-full flex justify-between items-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg"
                      onClick={(e) => {e.preventDefault(); handleHeightYaw('rotateLeft');}}
                      title="J/4 - Rotate Left"
                    >
                      <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-r-[15px] border-t-transparent border-b-transparent border-r-white"></div>
                    </button>
                    
                    <button 
                      className="bg-blue-800 hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-lg text-xs"
                      onClick={(e) => {e.preventDefault(); handleHeightYaw('reset');}}
                      title="Reset Height/Yaw"
                    >
                      RESET
                    </button>
                    
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg"
                      onClick={(e) => {e.preventDefault(); handleHeightYaw('rotateRight');}}
                      title="L/6 - Rotate Right"
                    >
                      <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[15px] border-t-transparent border-b-transparent border-l-white"></div>
                    </button>
                  </div>
                  
                  {/* Bottom row (Down arrow) */}
                  <div className="w-full flex justify-center">
                    <button 
                      className="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg"
                      onClick={(e) => {e.preventDefault(); handleHeightYaw('down');}}
                      title="K/2 - Down"
                    >
                      <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[15px] border-l-transparent border-r-transparent border-t-white"></div>
                    </button>
                  </div>
                </div>
              </div>
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

// Flight Mode Selector Component
const FlightModeSelector = ({ currentMode, modes, onChange }) => {
  return (
    <div>
      <div className="text-blue-300 text-sm mb-1">Flight Mode</div>
      <select 
        className="bg-gray-700 border border-gray-600 text-white w-full py-2 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={currentMode}
        onChange={(e) => onChange(e.target.value)}
      >
        {modes.map(mode => (
          <option key={mode} value={mode}>{mode}</option>
        ))}
      </select>
    </div>
  );
};

// Arm/Disarm Button Component
const ArmDisarmButton = ({ isDisarmed, onToggle }) => {
  return (
    <button 
      className={`
        w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2
        ${isDisarmed 
          ? 'bg-green-600 hover:bg-green-700 text-white' 
          : 'bg-red-600 hover:bg-red-700 text-white'}
      `}
      onClick={onToggle}
    >
      <div className={`w-3 h-3 rounded-full ${isDisarmed ? 'bg-white' : 'bg-white animate-pulse'}`}></div>
      {isDisarmed ? 'ARM DRONE' : 'DISARM DRONE'}
    </button>
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