import { useState, type Dispatch, type SetStateAction } from "react";
import type { DashboardRow } from "./Dashboard";
import { API_URL } from "./config";

export default function Modal(props: {
    selectedRow: DashboardRow, 
    setSelectedRow: Dispatch<SetStateAction<DashboardRow|null>>,
    fetchDashboard: (isPageLoading: boolean) => Promise<void>
}){
    type WriteoffReason = "EXPIRED" | "DAMAGED" | "STAFF_MEAL";

    const [writeoffQuantity, setWriteoffQuantity] = useState(1);
    const [writeoffReason, setWriteoffReason] = useState<WriteoffReason>("EXPIRED");
    const [modalError, setModalError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);

    function closeWriteoffModal(){
        if(isSubmitting)return;
        props.setSelectedRow(null);
    }

    async function submitWriteoff(){
        if(isSubmitting || !props.selectedRow)return;
        if(!Number.isInteger(writeoffQuantity) || writeoffQuantity < 1){
            setModalError("Quantity must be a positive whole number.")
            return;
        }
        if(writeoffQuantity > props.selectedRow.remainingQuantity){
            setModalError("Quantity must not be greater than remaining quantity.")
            return;
        }
        setModalError("");
        setIsSubmitting(true);
        try{
            const response = await fetch(
                `${API_URL}/api/v1/writeoffs`,
                {
                    method: 'POST',
                    headers:{
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        expiryRecordId: props.selectedRow.id,
                        quantity: writeoffQuantity,
                        reason: writeoffReason
                    })
                }
            )

            if(!response.ok){
                const data = await response.json().catch(() => null);
                throw new Error(data?.message || "Unable to create writeoff.")
            }
            props.setSelectedRow(null);
            setModalError("");
            await props.fetchDashboard(false);
        }catch(error){
            setModalError(error instanceof Error ? error.message : String(error))
        }finally{
            setIsSubmitting(false);
        }
    }

    return(
        (
            <div className="fixed top-0 left-0 flex flex-col justify-center w-screen h-screen items-center bg-black/50">     
                <div className="bg-white flex flex-col justify-center items-center p-4">
                    {modalError && <p>{modalError}</p>}
                    <p>product name: {props.selectedRow.productName}</p>
                    <p>remaining quantity: {props.selectedRow.remainingQuantity}</p>
                    <p>expiry date: {props.selectedRow.expiryDate}</p>
                    <form onSubmit={(e) => {e.preventDefault(); submitWriteoff()}} className="flex flex-col items-center border-t-2 border-blue-600 w-screen pt-4 mt-4 gap-4">
                        <label htmlFor="writeoff-quantity">
                            Writeoff Quantity: 
                            <input type="number" 
                                id="writeoff-quantity" 
                                name="writeoff-quantity" 
                                value={writeoffQuantity} 
                                onChange={(e)=>setWriteoffQuantity(Number(e.target.value))} 
                                min={1} max={props.selectedRow.remainingQuantity} 
                                disabled={isSubmitting}
                                className="border-purple-600 border-2"
                            />
                        </label>
                        
                        <label htmlFor="writeoff-reason">
                            Writeoff Reason: 
                            <select id="writeoff-reason" 
                                name="writeoff-reason" 
                                value={writeoffReason} 
                                onChange={(e) => setWriteoffReason(e.target.value as WriteoffReason)} 
                                disabled={isSubmitting}
                                className="border-purple-600 border-2">
                                <option value="EXPIRED">expired</option>
                                <option value="DAMAGED">damaged</option>
                                <option value="STAFF_MEAL">staff meal</option>
                            </select>
                        </label>
                        <button type="submit" className="cursor-pointer border-green-500 border-2 p-4" disabled={isSubmitting}>{isSubmitting? "Saving..." :"Submit"}</button>
                    </form>
                    <button onClick={closeWriteoffModal} className="cursor-pointer border-yellow-500 border-2 p-4 mt-4" disabled={isSubmitting}>Close</button>
                </div>
            </div>
        )
    )
}