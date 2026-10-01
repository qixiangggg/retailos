import { useState, useEffect, useRef} from "react";
import {Html5QrcodeScanner, Html5QrcodeSupportedFormats} from "html5-qrcode";
import ExpiryForm, { type FormProductInfoType } from "./ExpiryForm";
import { API_URL } from "./config";


type Status = "SCANNING" | "FORM" | "LOOKING_UP" | "ERROR";
function LogScreen(props: {goHomeScreen: () => void}) {
  const [appStatus, setAppStatus] = useState<Status>("SCANNING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  async function handleSubmit(formProductInfo: FormProductInfoType){
      if (isSubmitting) return;
      setErrorMessage("")
      setIsSubmitting(true);
      try{
      const response = await fetch(`${API_URL}/api/v1/expiry-records`,{
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
      setAppStatus("SCANNING");
    }catch(error){
      setErrorMessage(error instanceof Error ? error.message : String(error))
    } finally{
      setIsSubmitting(false);
    }
  }
  function handleCancel(){
    setErrorMessage("");
    setAppStatus("SCANNING");
  }
  const [scanningProductInfo, setScanningProductInfo] = useState({
    "barcode": "",
    "productName": ""
  });
  const cleanUpPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const getProductByBarcode = async(barcode: string) => {
    setErrorMessage("")
    setAppStatus("LOOKING_UP")
    try{
      const response = await fetch(`${API_URL}/api/v1/products/barcode/${barcode}`);
      const data = await response.json()
      if(response.status === 200){
        setScanningProductInfo({
          "barcode": barcode,
          "productName": data.name
        })
        setAppStatus("FORM")
      }else if (response.status === 404){
        setScanningProductInfo({
          "barcode": barcode,
          "productName":""
        })
        setAppStatus("FORM")
      }else{
        setErrorMessage(data?.message || "Unable to lookup product. Please scan again.")
        setAppStatus("ERROR")
      }
    }catch(error){
      setAppStatus("ERROR")
      setErrorMessage(String(error));
    }
  }
  useEffect(() => {
    let cancelled: boolean = false;
    let scanner: Html5QrcodeScanner | null = null
    
    const startScanner = async() => {
      await cleanUpPromiseRef.current;

      if (cancelled || appStatus !== "SCANNING"){
        return;
      }

      console.log("Creating scanner");

      let config = {
        fps: 15,
        videoConstraints:{
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        rememberLastUsedCamera: true,
        experimentalFeatures: { useBarCodeDetectorIfSupported: false },
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
    <button type="button" onClick={props.goHomeScreen} disabled={isSubmitting} className="border-black border-2 p-4 rounded-full">&lt;Back</button>
      <div id="reader" className={`flex flex-col justify-center items-center ${appStatus === "SCANNING" && "h-screen"}`}></div>
      
      <div>{appStatus === "FORM" && 
        <ExpiryForm  key={scanningProductInfo.barcode} barcode={scanningProductInfo.barcode} productName={scanningProductInfo.productName} onSubmit={handleSubmit} isSubmitting={isSubmitting} onCancel={handleCancel} />}
      </div>
      {errorMessage && <p role="alert">{errorMessage}</p>}
      {appStatus === "ERROR"&& 
        <button onClick={() => {setAppStatus("SCANNING"); setErrorMessage("")}}>Scan Again</button>
      }
      
    </>
  )
}

export default LogScreen
