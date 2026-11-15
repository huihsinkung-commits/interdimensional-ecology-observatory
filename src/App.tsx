import { WorldProvider } from './context/WorldContext'
import GameNavigation from './components/GameNavigation'
import LumiaIsland from './components/LumiaIsland'
import WorldControls from './components/WorldControls'
import WorldEventPanel from './components/WorldEventPanel'
import MicroWorldExplorer from './components/MicroWorldExplorer'
import CreatureEncyclopedia from './components/CreatureEncyclopedia'
import CivilizationObservatory from './components/CivilizationObservatory'
import AnomalyExplorer from './components/AnomalyExplorer'
import ResearchArchive from './components/ResearchArchive'
import './App.css'

function App() {
  return (
    <WorldProvider>
      <div className="observatory-app">
        <GameNavigation />
        <LumiaIsland />
        <WorldControls />
        <WorldEventPanel />
        <MicroWorldExplorer />
        <CreatureEncyclopedia />
        <CivilizationObservatory />
        <AnomalyExplorer />
        <ResearchArchive />
      </div>
    </WorldProvider>
  )
}

export default App
