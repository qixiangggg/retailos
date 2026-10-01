import { useCallback, useEffect, useState} from "react"
import Modal from "./Modal"
import { API_URL } from "./config"

export type DashboardRow = {
    id: string,
    productName: string,
    expiryDate: string,
    remainingQuantity: number
}
type UrgencySection = {
    urgency: string,
    count: number,
    dashboardRowList: DashboardRow[]
}

function Dashboard(props: {goHomeScreen: () => void}){
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("")
    const [urgencySection, setUrgencySection] = useState<UrgencySection[]>([]);
    const visibleUrgencySection = urgencySection.filter(elem => elem.count > 0)
    const [selectedRow, setSelectedRow] = useState<DashboardRow|null>(null);
    const fetchDashboard = useCallback(async(isPageLoading: boolean) => {
        if(isPageLoading){
            setLoading(true);
        }
        try{
            const response = await fetch(`${API_URL}/api/v1/expiry-records/dashboard`);
            const data = await response.json().catch(() => null);
            if(!response.ok){
                throw new Error(data?.message || "Unable to fetch dashboard.")
            }else if(!Array.isArray(data)){
                throw new Error("Unexpected dashboard response.")
            }
            setUrgencySection(data);
            setErrorMessage("");
            setLoading(false);
        }catch(error){
            setErrorMessage(error instanceof Error ? error.message : String(error));
            setLoading(false)
        }
    },[])
    
    useEffect(
        () => {
            fetchDashboard(true);
        },[fetchDashboard]
    )
    
    return(
        <>
        <button type="button" onClick={props.goHomeScreen} className="border-black border-2 p-4 rounded-full">&lt;back</button>
        <div className="flex flex-col gap-5">
        {visibleUrgencySection.length > 0 && urgencySection
            .filter(elem => elem.count > 0)
            .map((elem:UrgencySection) => 
            {return (
            <div className="flex flex-col items-center" key={elem.urgency}>
                <h1 className="underline">{elem.urgency}</h1>
                    {elem.dashboardRowList.map(dashboardRow => 
                        <div role="button" className="border-sky-600 border-3 cursor-pointer p-4" key={dashboardRow.id} onClick={() => setSelectedRow(dashboardRow)}>
                            <p>product Name: {dashboardRow.productName}</p>
                            <p>expiry date: {dashboardRow.expiryDate}</p>
                            <p>remainingQuantity: {dashboardRow.remainingQuantity}</p>
                        </div>
                )}
            </div>)
            })
        }
        </div>
        {!loading && !errorMessage && visibleUrgencySection.length === 0 && <p>No expiry records to display.</p>}
        {loading && <p>Loading....</p>}
        {errorMessage && <p>{errorMessage}</p>}
        {selectedRow &&  <Modal selectedRow={selectedRow} setSelectedRow={setSelectedRow} fetchDashboard={fetchDashboard}/>}
        </>
    )
}

export default Dashboard