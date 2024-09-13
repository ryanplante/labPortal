import { useRef, useEffect } from 'react';
import { Canvas } from 'react-native-canvas';
import JsBarcode from 'jsbarcode';

const BarcodeGenerator = ({ value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      JsBarcode(canvas, value, { format: "CODE128" });
    }
  }, [value]);

  return <Canvas ref={canvasRef} />;
};

export default BarcodeGenerator;
