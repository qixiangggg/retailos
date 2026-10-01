import type { Screen } from "./App"

function Home(props:{selectScreen: (selectedScreen: Screen) => void}){
    return(
    <div className="flex flex-col gap-3 p-3 justify-center h-screen text-center">
        <button type="button" className="border-black border-2 cursor-pointer" onClick={() => props.selectScreen("LOG")}>Log stock</button>
        <button type="button" className="border-black border-2 cursor-pointer" onClick={() => props.selectScreen("DASHBOARD")}>View Dashboard</button>
    </div>
    )
}

export default Home