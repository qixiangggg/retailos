import { useState } from 'react'
import './App.css'
import Home from './Home'
import LogScreen from './LogScreen';
import Dashboard from './Dashboard';

export enum Screen{
  Home = "HOME",
  Log = "LOG",
  Dashboard = "DASHBOARD"
}
function App(){
  const [screen, setScreen] = useState(Screen.Home)
  function selectScreen(selectedScreen: Screen){
    setScreen(selectedScreen);
  }
  function getCurrentScreen(){
    switch (screen){
      case Screen.Home:
        return <Home selectScreen={selectScreen}/>;
      case Screen.Log:
        return <LogScreen goHomeScreen={()=>selectScreen(Screen.Home)}/>
      case Screen.Dashboard:
        return <Dashboard goHomeScreen={()=>selectScreen(Screen.Home)}/>
    }
  }
  return(
    <>
      {getCurrentScreen()}
    </>
  )
}

export default App