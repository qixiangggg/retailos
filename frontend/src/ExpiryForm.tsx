import { useState } from "react";

export default function ExpiryForm(props:{barcode: string, productName: string}){
    const [formProductInfo, setFormProductInfo] = useState({
        "barcode": props.barcode,
        "productName": props.productName,
        "expiryDate": new Date().toISOString().split('T')[0],
        "quantity" : 0
    })
    return(
    <form>
        <label htmlFor="barcode">Barcode: </label>
        <input type="text" name="barcode" id="barcode" value={formProductInfo.barcode} readOnly/>
        <label htmlFor="product-name">Product Name: </label>
        <input type="text" name="product-name" id="product-name" readOnly={formProductInfo.productName != ""} value={formProductInfo.productName}  onChange={(e) => setFormProductInfo(prev => ({...prev, "productName": e.target.value}))}/>
        <label htmlFor="expiry-date">Expiry Date: </label>
        <input type="date" name="expiry-date" id="date" value={formProductInfo.expiryDate} onChange={(e) => setFormProductInfo(prev => ({...prev, "expiryDate": e.target.value}))}/>
        <label htmlFor="quantity">Quantity: </label>
        <input type="number" name="quantity" id="quantity" value={formProductInfo.quantity} onChange={(e) => setFormProductInfo(prev => ({...prev, "quantity": parseInt(e.target.value) || 0}))}/>
        <input type="submit"/>
    </form>
    )
}