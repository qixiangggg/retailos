import { useEffect, useState } from "react"

type DashboardRow = {
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
    useEffect(
        () => {
        async function fetchDashboard(){
            try{
                const response = await fetch("http://localhost:8080/api/v1/expiry-records/dashboard");
                const data = await response.json().catch(() => null);
                if(!response.ok){
                    throw new Error(data?.message || "Unable to fetch dashboard.")
                }
                setUrgencySection(data);
                setLoading(false);
            }catch(error){
                setErrorMessage(error instanceof Error ? error.message : String(error));
                setLoading(false)
            }
        }
        fetchDashboard()
        },[]
    )
    
    return(
        <>
        <div className="flex flex-col gap-5">
        {urgencySection.length > 0 && urgencySection
            .filter(elem => elem.count > 0)
            .map((elem:UrgencySection) => 
            {return (
            <div className="border-black border-2 flex flex-col items-center" key={elem.urgency}>
                <h1>{elem.urgency}</h1>
                    {elem.dashboardRowList.map(dashboardRow => 
                        <div className="border-sky-600 border-3" key={dashboardRow.id}>
                            <p>product Name: {dashboardRow.productName}</p>
                            <p>expiry date: {dashboardRow.expiryDate}</p>
                            <p>remainingQuantity: {dashboardRow.remainingQuantity}</p>
                        </div>
                )}
            </div>
        )})}
        </div>
        {loading && <p>Loading....</p>}
        {errorMessage && <p>{errorMessage}</p>}
        <button type="button" onClick={props.goHomeScreen}>back</button>
        </>
    )
}

export default Dashboard