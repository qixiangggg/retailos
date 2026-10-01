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
    <form onSubmit={(e) =>{e.preventDefault(); props.onSubmit(formProductInfo)}} className="flex flex-col justify-center h-screen">
        <label htmlFor="barcode">Barcode: </label>
        <input type="text" name="barcode" id="barcode" value={formProductInfo.barcode} readOnly/>
        <label htmlFor="product-name">Product Name: </label>
        <input type="text" name="product-name" id="product-name" readOnly={props.productName != ""} value={formProductInfo.productName}  onChange={(e) => setFormProductInfo(prev => ({...prev, "productName": e.target.value}))}/>
        <label htmlFor="expiry-date">Expiry Date: </label>
        <input type="date" name="expiry-date" id="date" value={formProductInfo.expiryDate} onChange={(e) => setFormProductInfo(prev => ({...prev, "expiryDate": e.target.value}))}/>
        <label htmlFor="quantity">Quantity: </label>
        <input type="number" name="quantity" id="quantity" value={formProductInfo.quantity} onChange={(e) => setFormProductInfo(prev => ({...prev, "quantity": Number(e.target.value) || 0}))}/>
        <button type="button" onClick={props.onCancel} disabled={props.isSubmitting}>Cancel</button>
        <input type="submit" disabled={props.isSubmitting}/>
    </form>
    )
}