import { useState, useEffect, useRef } from "react";
import {Html5QrcodeScanner, Html5QrcodeSupportedFormats} from "html5-qrcode";
import './App.css'

function App() {
  const [barcodeValue, setBarcodeValue] = useState("");
  const cleanUpPromiseRef = useRef<Promise<void>>(Promise.resolve());

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
          console.log(decodedText);
          setBarcodeValue(decodedText);
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
      <div>{barcodeValue}</div>
    </>
  )
}

export default App
