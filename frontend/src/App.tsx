import { useState } from 'react'
import './App.css'
import Home from './Home'
import LogScreen from './LogScreen';
import Dashboard from './Dashboard';


export type Screen = "HOME" | "LOG" | "DASHBOARD"
function App(){
  const [screen, setScreen] = useState("HOME")
  function selectScreen(selectedScreen: Screen){
    setScreen(selectedScreen);
  }
  function getCurrentScreen(){
    switch (screen){
      case "HOME":
        return <Home selectScreen={selectScreen}/>;
      case "LOG":
        return <LogScreen goHomeScreen={()=>selectScreen("HOME")}/>
      case "DASHBOARD":
        return <Dashboard goHomeScreen={()=>selectScreen("HOME")}/>
    }
  }
  return(
    <>
      {getCurrentScreen()}
    </>
  )
}

export default App