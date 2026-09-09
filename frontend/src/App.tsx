import { useState, useEffect, useRef} from "react";
import {Html5QrcodeScanner, Html5QrcodeSupportedFormats} from "html5-qrcode";
import './App.css'
import ExpiryForm, { type FormProductInfoType } from "./ExpiryForm";

export enum Status{
  Scanning = "SCANNING",
  Form = "FORM",
  LookingUp = "LOOKING_UP",
  Error = "ERROR"
}
function App() {
  const [appStatus, setAppStatus] = useState<Status>(Status.Scanning);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(formProductInfo: FormProductInfoType){
      if (isSubmitting) return;
      setErrorMessage("")
      setIsSubmitting(true);
      try{
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

      if(!response.ok){
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Unable to confirm the save.")
      }
      setAppStatus(Status.Scanning);
    }catch(error){
      setErrorMessage(error instanceof Error ? error.message : String(error))
    } finally{
      setIsSubmitting(false);
    }
  }
  function handleCancel(){
    setErrorMessage("");
    setAppStatus(Status.Scanning);
  }
  const [scanningProductInfo, setScanningProductInfo] = useState({
    "barcode": "",
    "productName": ""
  });
  const cleanUpPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const getProductByBarcode = async(barcode: string) => {
    setErrorMessage("")
    setAppStatus(Status.LookingUp)
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
        setScanningProductInfo({
          "barcode": barcode,
          "productName":""
        })
        setAppStatus(Status.Form)
      }else{
        setErrorMessage(data?.message || "Unable to lookup product. Please scan again.")
        setAppStatus(Status.Error)
      }
    }catch(error){
      setAppStatus(Status.Error)
      setErrorMessage(String(error));
    }
  }
  useEffect(() => {
    let cancelled: boolean = false;
    let scanner: Html5QrcodeScanner | null = null
    
    const startScanner = async() => {
      await cleanUpPromiseRef.current;

      if (cancelled || appStatus !== Status.Scanning){
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
          if(cancelled) return;
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
        error => setErrorMessage("Failed to clear scanner: " + error)
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
      <div>{appStatus === Status.Form && 
        <ExpiryForm  key={scanningProductInfo.barcode} barcode={scanningProductInfo.barcode} productName={scanningProductInfo.productName} onSubmit={handleSubmit} isSubmitting={isSubmitting} onCancel={handleCancel} />}
      </div>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {appStatus === Status.Error && 
        <button onClick={() => {setAppStatus(Status.Scanning); setErrorMessage("")}}>Scan Again</button>
      }
    </>
  )
}

export default App
