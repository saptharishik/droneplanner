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
import { ref, onValue, update, set, get } from 'firebase/database';
import { database } from '../../config/firebase';

const DroneMissionPlanner = () => {
// Updated Firebase references for the new structure
const droneDataRef = ref(database, 'droneMissionPlanner/droneData');
const controlsRef = ref(database, 'droneMissionPlanner/controls');
const cameraViewRef = ref(database, 'droneMissionPlanner/cameraView');
const alertMessagesRef = ref(database, 'droneMissionPlanner/alertMessages');

// Local state
const [connected, setConnected] = useState(false);
const [batteryLevel, setBatteryLevel] = useState(84);
const [batteryVolts, setBatteryVolts] = useState(18.89);
const [cameraView, setCameraView] = useState('side-by-side'); // 'side-by-side', 'live', 'orientation'
const [alertMessages, setAlertMessages] = useState([]);
const [showAlertModal, setShowAlertModal] = useState(false);
const [showLowBatteryModal, setShowLowBatteryModal] = useState(false);
const [droneMode, setDroneMode] = useState('manual'); // 'auto' or 'manual'
const [droneData, setDroneData] = useState({
  xAxis: 0,
  yAxis: 0,
  velocityY: 0,
  velocityX: 0,
  disarmed: true,
  pitch: 0,
  yaw: 0,
  roll: 0,
  flightMode: 'Stabilize',
  throttlePercent: 0,
  heading: 0,
  homeDistance: 0,
  opticalX: 0,
  opticalY: 0,
  altitude: 0
});

const flightModes = ['Land', 'Stabilize', 'AltHold', 'FlowHold', 'Loiter', 'RTL', 'Auto'];

// Initialize Firebase data on component mount
useEffect(() => {
  const initializeFirebaseData = async () => {
    try {
      // Initialize camera view if it doesn't exist
      const cameraViewSnapshot = await get(cameraViewRef);
      if (!cameraViewSnapshot.exists()) {
        await set(cameraViewRef, 'side-by-side');
      }
      
      // Initialize alert messages if they don't exist
      const alertMessagesSnapshot = await get(alertMessagesRef);
      if (!alertMessagesSnapshot.exists()) {
        await set(alertMessagesRef, []);
      }
      
      // Initialize drone data if it doesn't exist
      const droneDataSnapshot = await get(droneDataRef);
      if (!droneDataSnapshot.exists()) {
        await set(droneDataRef, {
          battery: 84,
          batteryVolts: 18.89,
          altitude: 0,
          opticalX: 0,
          opticalY: 0,
          pitch: 0,
          roll: 0,
          throttle: 0,
          velocityX: 0,
          velocityY: 0,
          xAxis: 0,
          yAxis: 0,
          yaw: 0,
          heading: 0,
          homeDistance: 0,
          connected: false
        });
      }
      
      // Initialize controls if they don't exist
      const controlsSnapshot = await get(controlsRef);
      if (!controlsSnapshot.exists()) {
        await set(controlsRef, {
          disarm: true,
          flightMode: 'Stabilize',
          droneMode: 'manual'
        });
      }
    } catch (error) {
      console.error("Error initializing Firebase data:", error);
      // Add an alert for Firebase initialization error
      updateAlertMessages({
        id: Date.now(),
        type: 'error',
        message: 'Failed to initialize Firebase: ' + error.message,
        timestamp: new Date()
      });
    }
  };

  initializeFirebaseData();
}, []);

// Set up Firebase listeners for drone data
useEffect(() => {
  const droneDataListener = onValue(droneDataRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    
    // Update connected status
    if (data.connected !== undefined) {
      setConnected(data.connected);
    }
    
    // Update battery information
    if (data.battery !== undefined) {
      setBatteryLevel(data.battery);
    }
    
    if (data.batteryVolts !== undefined) {
      setBatteryVolts(data.batteryVolts);
    }
    
    // Update telemetry data
    setDroneData(prevData => ({
      ...prevData,
      xAxis: data.xAxis !== undefined ? data.xAxis : prevData.xAxis,
      yAxis: data.yAxis !== undefined ? data.yAxis : prevData.yAxis,
      velocityY: data.velocityY !== undefined ? data.velocityY : prevData.velocityY,
      velocityX: data.velocityX !== undefined ? data.velocityX : prevData.velocityX,
      pitch: data.pitch !== undefined ? data.pitch : prevData.pitch,
      yaw: data.yaw !== undefined ? data.yaw : prevData.yaw,
      roll: data.roll !== undefined ? data.roll : prevData.roll,
      throttlePercent: data.throttle !== undefined ? data.throttle : prevData.throttlePercent,
      heading: data.heading !== undefined ? data.heading : prevData.heading,
      homeDistance: data.homeDistance !== undefined ? data.homeDistance : prevData.homeDistance,
      opticalX: data.opticalX !== undefined ? data.opticalX : prevData.opticalX,
      opticalY: data.opticalY !== undefined ? data.opticalY : prevData.opticalY,
      altitude: data.altitude !== undefined ? data.altitude : prevData.altitude,
      flightMode: data.flightMode || prevData.flightMode, // Read flightMode from droneData instead of controls
      disarmed: data.disarmed !== undefined ? data.disarmed : prevData.disarmed
    }));
  });
  
  // Listen for camera view changes
  const cameraViewListener = onValue(cameraViewRef, (snapshot) => {
    const data = snapshot.val();
    if (data !== null) {
      setCameraView(data);
    }
  });
 
  
  // Listen for alert messages
  const alertMessagesListener = onValue(alertMessagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data !== null) {
      setAlertMessages(Array.isArray(data) ? data : Object.values(data));
    }
  });
  
  // Listen for control updates from other clients
  const controlsListener = onValue(controlsRef, (snapshot) => {
    const controlData = snapshot.val();
    if (!controlData) return;
    
    // Update local state to reflect control values
    // This helps synchronize the UI with control values set by other clients
    setDroneData(prevData => ({
      ...prevData,
      disarmed: controlData.disarm !== undefined ? controlData.disarm : prevData.disarmed
      // Removed flightMode from here since we now read it from droneData
    }));
    
    // Update drone mode (auto/manual)
    if (controlData.droneMode !== undefined) {
      setDroneMode(controlData.droneMode);
    }
  });

  // Cleanup listeners on component unmount
  return () => {
    droneDataListener();
    cameraViewListener();
    alertMessagesListener();
    controlsListener();
  };
}, []);

// Monitor battery level for low battery warning
useEffect(() => {
  if (batteryLevel <= 40 && batteryLevel > 0) {
    // Show low battery warning modal
    setShowLowBatteryModal(true);
    
    // No longer changing flight mode here since we're only displaying it
    
    // Add an alert
    updateAlertMessages({
      id: Date.now(),
      type: 'warning',
      message: `CRITICAL: Battery level at ${batteryLevel.toFixed(0)}%, initiating automatic landing`,
      timestamp: new Date()
    });
  }
}, [batteryLevel]);

// Function to update Firebase camera view
const updateFirebaseCameraView = (value) => {
  set(cameraViewRef, value);
};

// Function to update alert messages
const updateAlertMessages = (newAlert) => {
  // Create a new array with the new alert
  const updatedAlerts = [...alertMessages, newAlert];
  
  // Update local state
  setAlertMessages(updatedAlerts);
  
  // Update Firebase
  set(alertMessagesRef, updatedAlerts);
};

// Function to update control commands
const updateControls = (updates) => {
  // Update the controls in Firebase
  update(controlsRef, updates);
  
  // Optionally add a message about control updates
  if (Object.keys(updates).length > 0) {
    updateAlertMessages({
      id: Date.now(),
      type: 'info',
      message: `Control updated: ${Object.keys(updates).join(', ')}`,
      timestamp: new Date()
    });
  }
};

// Direction control handler - updated to directly update drone data in Firebase
const handleDirection = useCallback((direction) => {
  let updates = {};
  
  switch(direction) {
    case 'forward':
      updates.pitch = ((droneData.pitch - 5) % 360 + 360) % 360;
      break;
    case 'backward':
      updates.pitch = ((droneData.pitch + 5) % 360 + 360) % 360;
      break;
    case 'left':
      updates.roll = ((droneData.roll - 5) % 360 + 360) % 360;
      break;
    case 'right':
      updates.roll = ((droneData.roll + 5) % 360 + 360) % 360;
      break;
    case 'reset':
      updates.pitch = 0;
      updates.roll = 0;
      break;
    default:
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    // Update local state for immediate feedback
    setDroneData(prevData => ({
      ...prevData,
      ...updates
    }));
    
    // Update Firebase drone data directly
    update(droneDataRef, updates);
    
    // Add notification
    updateAlertMessages({
      id: Date.now(),
      type: 'info',
      message: `Direction updated: ${Object.keys(updates).join(', ')}`,
      timestamp: new Date()
    });
  }
}, [droneData]);

// Height control handler (removed yaw controls)
const handleHeight = useCallback((action) => {
  let updates = {};
  
  switch(action) {
    case 'up':
      // Increase throttle by 5%, ensuring it doesn't exceed 100%
      updates.throttle = Math.min(100, droneData.throttlePercent + 5);
      break;
    case 'down':
      // Decrease throttle by 5%, ensuring it doesn't go below 0%
      updates.throttle = Math.max(0, droneData.throttlePercent - 5);
      break;
    case 'reset':
      updates.throttle = 0; // Reset throttle to default
      break;
    default:
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    // Update local state for immediate feedback
    const localUpdates = {};
    if (updates.throttle !== undefined) {
      localUpdates.throttlePercent = updates.throttle;
    }
    
    setDroneData(prevData => ({
      ...prevData,
      ...localUpdates
    }));
    
    // Update Firebase drone data directly
    update(droneDataRef, updates);
    
    // Add notification
    updateAlertMessages({
      id: Date.now(),
      type: 'info',
      message: `Height updated: ${Object.keys(updates).join(', ')}`,
      timestamp: new Date()
    });
  }
}, [droneData]);

// Global reset handler - updated to directly update drone data in Firebase
const handleGlobalReset = useCallback(() => {
  // Create a reset data object with all values that should be reset
  const updates = {
    pitch: 0,
    roll: 0,
    throttle: 0
    // Removed yaw from reset
  };
  
  // Update local state first for immediate feedback
  setDroneData(prevData => ({
    ...prevData,
    pitch: 0,
    roll: 0,
    throttlePercent: 0
    // Removed yaw from reset
  }));
  
  // Update Firebase drone data directly
  update(droneDataRef, updates);
  
  // Add alert message
  updateAlertMessages({
    id: Date.now(),
    type: 'info',
    message: 'Controls reset to default position',
    timestamp: new Date()
  });
}, []);

// Keyboard control listener
useEffect(() => {
  const keyHandler = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return; // Don't handle keys when user is typing in form elements
    }

    // Don't process keyboard controls in AUTO mode
    if (droneMode === 'auto') return;

    // Prevent default behavior for these keys to avoid scrolling etc.
    if (['w', 'a', 's', 'd', 'i', 'k', ' ', '8', '2'].includes(e.key.toLowerCase())) {
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
        
      // Height controls only (no yaw controls)
      case 'i':
      case '8':
        handleHeight('up');
        break;
      case 'k':
      case '2':
        handleHeight('down');
        break;
      
      // Space for global reset - Handle more directly for reliability
      case ' ':
        console.log('Space key pressed - executing global reset');
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
}, [handleDirection, handleHeight, handleGlobalReset, droneMode]);

// Check for low battery and add warning
useEffect(() => {
  if (batteryLevel < 30 && batteryLevel > 29.9) {
    // Only add the warning once when dropping below 30%
    updateAlertMessages({
      id: Date.now(),
      type: 'warning',
      message: `Low battery warning: ${batteryLevel.toFixed(0)}%`,
      timestamp: new Date()
    });
  }
}, [batteryLevel]);

// Get rotation style for orientation visualization
const getRotationStyle = () => {
  // Ensure yaw, pitch, and roll are properly bounded for smooth visualization
  const normalizedYaw = 0;
  const normalizedPitch = ((droneData.pitch % 360) + 360) % 360;
  const normalizedRoll = ((droneData.roll % 360) + 360) % 360;
  
  // Note: Using positive yaw value for correct rotation direction
  return {
    transform: `perspective(1000px) rotateX(${-normalizedPitch}deg) rotateY(${normalizedRoll}deg) rotateZ(${normalizedYaw}deg)`
  };
};

// Update arm/disarm status
const toggleArm = () => {
  const newDisarmStatus = !droneData.disarmed;
  
  // Update local state for immediate feedback
  setDroneData(prevData => ({
    ...prevData,
    disarmed: newDisarmStatus
  }));
  
  // Update Firebase controls directly
  update(controlsRef, { disarm: newDisarmStatus });
  
  // Add alert message
  updateAlertMessages({
    id: Date.now(),
    type: 'info',
    message: newDisarmStatus ? 'Drone disarmed' : 'Drone armed',
    timestamp: new Date()
  });
};

// Flight Mode change function removed since we're only displaying now

// Toggle auto/manual mode
const toggleDroneMode = () => {
  const newMode = droneMode === 'manual' ? 'auto' : 'manual';
  
  // Update local state
  setDroneMode(newMode);
  
  // Update Firebase controls
  update(controlsRef, { droneMode: newMode });
  
  // Add alert message
  updateAlertMessages({
    id: Date.now(),
    type: 'info',
    message: `Drone mode changed to ${newMode}`,
    timestamp: new Date()
  });
};
const getActiveAlertCount = () => {
  return alertMessages.length;
};

return (
  <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
    {/* Enhanced Header/Nav Bar */}
    <div className="bg-gray-800 py-2 px-4 flex justify-between items-center border-b border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-blue-400">Drone Mission Planner</h1>
        <div className="flex gap-2">
          <div className={`px-3 py-1 text-sm rounded-md ${connected ? 'bg-green-600' : 'bg-red-600'} text-white flex items-center gap-2`}>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-300' : 'bg-red-300'}`}></div>
            {connected ? 'Connected' : 'Disconnected'}
          </div>
          <div 
            className={`px-3 py-1 text-sm rounded-md cursor-pointer ${droneMode === 'auto' ? 'bg-blue-600' : 'bg-orange-600'} text-white flex items-center gap-2`}
            onClick={toggleDroneMode}
            title="Click to toggle mode"
          >
            <div className={`w-2 h-2 rounded-full ${droneMode === 'auto' ? 'bg-blue-300' : 'bg-orange-300'}`}></div>
            {droneMode === 'auto' ? 'AUTO' : 'MANUAL'}
          </div>
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
              onClick={() => {
                setCameraView('side-by-side');
                updateFirebaseCameraView('side-by-side');
              }}
            >
              Side by Side
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-sm font-medium ${cameraView === 'live' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => {
                setCameraView('live');
                updateFirebaseCameraView('live');
              }}
            >
              Live Feed Only
            </button>
            <button 
              className={`px-3 py-1 rounded-lg text-sm font-medium ${cameraView === 'orientation' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              onClick={() => {
                setCameraView('orientation');
                updateFirebaseCameraView('orientation');
              }}
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
                      onClick={() => {
                        setCameraView('orientation');
                        updateFirebaseCameraView('orientation');
                      }}
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
                
                {/* Velocity X and Y */}
                <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 px-3 py-1 rounded">
                  <div className="text-xs text-green-400">
                    VX: {droneData.velocityX.toFixed(1)}m/s VY: {droneData.velocityY.toFixed(1)}m/s
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
                    onClick={() => {
                      setCameraView('live');
                      updateFirebaseCameraView('live');
                    }}
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
            
            {/* Flight Mode Display (read-only) - CHANGED HERE */}
            <div className="col-span-2">
              <FlightModeDisplay
                currentMode={droneData.flightMode}
              />
            </div>
            
            {/* Drone Mode (Auto/Manual) Selection */}
            <div className="col-span-2">
              <div className="text-blue-300 text-sm mb-1">Control Mode</div>
              <button 
                className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2
                  ${droneMode === 'auto' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-orange-600 hover:bg-orange-700 text-white'}`}
                onClick={toggleDroneMode}
              >
                <div className={`w-3 h-3 rounded-full ${droneMode === 'auto' ? 'bg-blue-300' : 'bg-orange-300'}`}></div>
                {droneMode === 'auto' ? 'AUTO MODE' : 'MANUAL MODE'}
              </button>
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
            <DataTile title="Velocity X" value={droneData.velocityX.toFixed(1)} unit="m/s" icon={<BarChart3 size={16} />} />
            <DataTile title="Velocity Y" value={droneData.velocityY.toFixed(1)} unit="m/s" icon={<Wind size={16} />} />
            <DataTile title="Altitude" value={droneData.altitude.toFixed(1)} unit="m" icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22v-4h4" /><path d="M20 22v-4h-4" /><path d="M2 8V6h20v2" /><path d="M6 18V6" /><path d="M18 18V6" /></svg>} />
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
                    className={`bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleDirection('forward');}}
                    title="W - Forward"
                    disabled={droneMode === 'auto'}
                  >
                    W
                  </button>
                </div>
                
                {/* Middle row (A, RESET, D) */}
                <div className="w-full flex justify-between items-center">
                  <button 
                    className={`bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleDirection('left');}}
                    title="A - Left"
                    disabled={droneMode === 'auto'}
                  >
                    A
                  </button>
                  
                  <button 
                    className={`bg-blue-800 hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-lg text-xs ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleDirection('reset');}}
                    title="Reset Direction"
                    disabled={droneMode === 'auto'}
                  >
                    RESET
                  </button>
                  
                  <button 
                    className={`bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleDirection('right');}}
                    title="D - Right"
                    disabled={droneMode === 'auto'}
                  >
                    D
                  </button>
                </div>
                
                {/* Bottom row (S) */}
                <div className="w-full flex justify-center">
                  <button 
                    className={`bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg font-bold ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleDirection('backward');}}
                    title="S - Backward"
                    disabled={droneMode === 'auto'}
                  >
                    S
                  </button>
                </div>
              </div>
            </div>
            
            {/* Height Controls (Removed Yaw) */}
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-blue-300 text-sm mb-2 text-center font-medium group relative">
                Throttle
                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-80 text-white text-xs rounded p-2 -bottom-16 left-1/2 transform -translate-x-1/2 pointer-events-none w-48 z-10">
                  <div className="flex justify-between mb-1">
                    <span>I/8 - Increase 5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>K/2 - Decrease 5%</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                {/* Top row (Up arrow) */}
                <div className="w-full flex justify-center">
                  <button 
                    className={`bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleHeight('up');}}
                    title="I/8 - Up"
                    disabled={droneMode === 'auto'}
                  >
                    <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-b-[15px] border-l-transparent border-r-transparent border-b-white"></div>
                  </button>
                </div>
                
                {/* Middle row (RESET only) */}
                <div className="w-full flex justify-center items-center">
                  <button 
                    className={`bg-blue-800 hover:bg-blue-700 text-white w-12 h-12 flex items-center justify-center rounded-lg text-xs ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleHeight('reset');}}
                    title="Reset Height"
                    disabled={droneMode === 'auto'}
                  >
                    RESET
                  </button>
                </div>
                
                {/* Bottom row (Down arrow) */}
                <div className="w-full flex justify-center">
                  <button 
                    className={`bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 flex items-center justify-center rounded-lg ${droneMode === 'auto' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={(e) => {e.preventDefault(); if(droneMode === 'manual') handleHeight('down');}}
                    title="K/2 - Down"
                    disabled={droneMode === 'auto'}
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
                        {alert.timestamp && new Date(alert.timestamp).toLocaleTimeString()}
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
    
    {/* Low Battery Modal */}
    {showLowBatteryModal && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border-2 border-red-500 animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle size={24} className="text-red-500" />
              LOW BATTERY WARNING
            </h2>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={() => setShowLowBatteryModal(false)}
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Battery size={32} className="text-red-500" />
              <div className="text-3xl font-bold text-red-500">{batteryLevel.toFixed(1)}%</div>
            </div>
            <p className="text-white text-lg mb-4">Battery level critical!</p>
            <div className="bg-red-900 bg-opacity-30 border border-red-700 p-3 rounded-lg">
              <p className="text-yellow-300 font-semibold">Land mode has been automatically initiated for safety.</p>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold"
              onClick={() => setShowLowBatteryModal(false)}
            >
              ACKNOWLEDGE
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

// Flight Mode Display Component (read-only) - NEW COMPONENT
const FlightModeDisplay = ({ currentMode }) => {
  return (
    <div>
      <div className="text-blue-300 text-sm mb-1">Flight Mode</div>
      <div className="bg-gray-700 border border-gray-600 text-white w-full py-2 px-4 rounded-lg flex items-center">
        <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
        <span>{currentMode}</span>
      </div>
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