import { useState, useEffect, useRef } from "react";
import {Html5QrcodeScanner, Html5QrcodeSupportedFormats} from "html5-qrcode";
import './App.css'
import ExpiryForm, { type FormProductInfoType } from "./ExpiryForm";

export enum Status{
  Scanning = "SCANNING",
  Form = "FORM"
}
function App() {
  const [appStatus, setAppStatus] = useState<Status>(Status.Scanning);
  async function handleSubmit(formProductInfo: FormProductInfoType){
    
    const response = await fetch("http://localhost:8080/api/v1/expiry-records",{
      method: 'POST',
      headers:{
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        barcode: formProductInfo.barcode,
        productName: formProductInfo.productName,
        expiryDate: formProductInfo.expiryDate,
        quantity: formProductInfo.quantity
      })
    })

    const data = await response.json();
    if(response.status === 200){
      setAppStatus(Status.Scanning);
    } else if(response.status === 400){
      alert(data.message)
    }
  }
  function handleCancel(){
    setAppStatus(Status.Scanning);
  }
  const [scanningProductInfo, setScanningProductInfo] = useState({
    "barcode": "",
    "productName": ""
  });
  const cleanUpPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const getProductByBarcode = async(barcode: string) => {
    try{
      const response = await fetch(`http://localhost:8080/api/v1/products/barcode/${barcode}`);
      const data = await response.json()
      if(response.status === 200){
        setScanningProductInfo({
          "barcode": barcode,
          "productName": data.name
        })
        setAppStatus(Status.Form)
      }else if (response.status === 404){
        setScanningProductInfo(prev => ({
          ...prev,
          "barcode": barcode
        }))
        setAppStatus(Status.Form)
      }else{
        throw new Error("Failed to fetch product")
      }
      
      
      
    }catch(error){
      console.error(error);
    }
  }
  useEffect(() => {
    let cancelled: boolean = false;
    let scanner: Html5QrcodeScanner | null = null
    
    const startScanner = async() => {
      await cleanUpPromiseRef.current;

      if (cancelled || appStatus == Status.Form){
        return;
      }

      console.log("Creating scanner");

      let config = {
        fps: 10,
        qrbox: {width: 360, height: 200},
        rememberLastUsedCamera: true,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13, 
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128
        ]
      };

      scanner = new Html5QrcodeScanner(
        "reader", 
        config, 
        /* verbose= */ false
      );
      scanner.render(
        (decodedText) => {
          getProductByBarcode(decodedText);
          clearScanner();
        }, 
        () => {}
      )
    };
    
    const clearScanner = async () => {
      console.log("Clearing scanner");
      cancelled = true;

      if(!scanner){
        return;
      }

      const scannerToClear = scanner;

      scanner = null;

      cleanUpPromiseRef.current = scannerToClear.clear().catch(
        error => console.error("Failed to clear scanner: ", error)
      )
    }

    startScanner();

    return () => {
      cancelled = true;
      clearScanner();
    }
  }, [appStatus])
  return (
    <>
      <div id="reader"></div>
      <div>{appStatus === Status.Form && <ExpiryForm  key={scanningProductInfo.barcode} barcode={scanningProductInfo.barcode} productName={scanningProductInfo.productName} onSubmit={handleSubmit} onCancel={handleCancel}/>}</div>
    </>
  )
}

export default App
