import { useState } from "react";

export interface FormProductInfoType{
    barcode: string,
    productName: string,
    expiryDate: string,
    quantity: number
}
export default function ExpiryForm(props:{barcode: string, productName: string, onSubmit: (formProductInfo: FormProductInfoType) => Promise<void>, isSubmitting: boolean, onCancel: () => void}){
    const [formProductInfo, setFormProductInfo] = useState<FormProductInfoType>({
        "barcode": props.barcode,
        "productName": props.productName,
        "expiryDate": new Date().toISOString().split('T')[0],
        "quantity" : 0
    })
    
    return(
    <form onSubmit={(e) =>{e.preventDefault(); props.onSubmit(formProductInfo)}} className="flex flex-col justify-center h-screen items-center gap-4">
        <label htmlFor="barcode">
            Barcode:
            <input type="text" name="barcode" id="barcode" value={formProductInfo.barcode} readOnly className="border-purple-600 border-2"/> 
        </label>
        <label htmlFor="product-name">
            Product Name: 
            <input type="text" name="product-name" id="product-name" readOnly={props.productName != ""} value={formProductInfo.productName}  onChange={(e) => setFormProductInfo(prev => ({...prev, "productName": e.target.value}))} className="border-purple-600 border-2"/>
        </label>
        <label htmlFor="expiry-date">
            Expiry Date: 
            <input type="date" name="expiry-date" id="date" value={formProductInfo.expiryDate} onChange={(e) => setFormProductInfo(prev => ({...prev, "expiryDate": e.target.value}))} className="border-purple-600 border-2"/>
        </label>
        <label htmlFor="quantity">
            Quantity: 
            <input type="number" name="quantity" id="quantity" value={formProductInfo.quantity} onChange={(e) => setFormProductInfo(prev => ({...prev, "quantity": Number(e.target.value) || 0}))} className="border-purple-600 border-2"/>
        </label>
        <button type="button" onClick={props.onCancel} disabled={props.isSubmitting} className="cursor-pointer border-yellow-500 border-2 p-4">Cancel</button>
        <input type="submit" disabled={props.isSubmitting} className="cursor-pointer border-green-500 border-2 p-4"/>
    </form>
    )
}