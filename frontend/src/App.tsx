import { useState, useEffect, useRef } from "react";
import {Html5QrcodeScanner, Html5QrcodeSupportedFormats} from "html5-qrcode";
import './App.css'
import ExpiryForm from "./ExpiryForm";

function App() {
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
      }else if (response.status === 404){
        setScanningProductInfo(prev => ({
          ...prev,
          "barcode": barcode
        }))
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

      if (cancelled){
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
  }, [])
  return (
    <>
      <div id="reader"></div>
      <div>{scanningProductInfo.barcode != "" && <ExpiryForm  key={scanningProductInfo.barcode} barcode={scanningProductInfo.barcode} productName={scanningProductInfo.productName}/>}</div>
    </>
  )
}

export default App
