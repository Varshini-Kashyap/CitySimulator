import React from "react";
import CitySimulation from "./components/CitySimulation";
import "@fontsource/inter";

function App() {
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#1a1a1a'
    }}>
      <CitySimulation />
    </div>
  );
}

export default App;
