import { useState, type Dispatch, type SetStateAction } from "react";
import type { DashboardRow } from "./Dashboard";

export default function Modal(props: {
    selectedRow: DashboardRow, 
    setSelectedRow: Dispatch<SetStateAction<DashboardRow|null>>,
    fetchDashboard: (isPageLoading: boolean) => void
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
                "http://localhost:8080/api/v1/writeoffs",
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
                <div className="bg-white">
                    {modalError && <p>{modalError}</p>}
                    <p>{props.selectedRow.productName}</p>
                    <p>{props.selectedRow.remainingQuantity}</p>
                    <p>{props.selectedRow.expiryDate}</p>
                    <form onSubmit={(e) => {e.preventDefault(); submitWriteoff()}}>
                        <label htmlFor="writeoff-quantity">Writeoff Quantity: </label>
                        <input type="number" id="writeoff-quantity" name="writeoff-quantity" value={writeoffQuantity} onChange={(e)=>setWriteoffQuantity(Number(e.target.value))} min={1} max={props.selectedRow.remainingQuantity} disabled={isSubmitting}/>
                        <label htmlFor="writeoff-reason">Writeoff Reason: </label>
                        <select id="writeoff-reason" name="writeoff-reason" value={writeoffReason} onChange={(e) => setWriteoffReason(e.target.value as WriteoffReason)} disabled={isSubmitting}>
                            <option value="EXPIRED">expired</option>
                            <option value="DAMAGED">damaged</option>
                            <option value="STAFF_MEAL">staff meal</option>
                        </select>
                        <button type="submit" className="cursor-pointer">Submit</button>
                    </form>
                    <button onClick={closeWriteoffModal} className="cursor-pointer">Close</button>
                </div>
            </div>
        )
    )
}