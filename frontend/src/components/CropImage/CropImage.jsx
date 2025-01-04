import React, { useRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "components/loader.component/Loader";
import { useCreatePageContext } from "context/CreateContext";
export const CropCanvas = ({
  imageData,
  maskImageData,
  onCrop,
  onReset,
  showReset = false,
}) => {
  const [loading, setLoading]= useState(true)
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const [reseting, setReseting] = useState(false);
  const pointsRef = useRef([]);
  const [closedRegions, setClosedRegions] = useState([]);
  const {state, dispatch} = useCreatePageContext();
  const {Is_Preset_Image, Is_Output_Image} =state;

  const drawBackgroundImage = (context, image, canvas) => {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  const drawCanvasBoundaries = (context, canvas) => {
    context.strokeStyle = "#136DF4";
    context.lineWidth = 12;
    context.strokeRect(0, 0, canvas.width, canvas.height);
  };

  const handleCropUpdate = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");

    const maskCanvas = maskCanvasRef.current;
    const maskDataURL = maskCanvas.toDataURL("image/png");
    onCrop(dataURL, maskDataURL);
  };
  const getCacheBustedUrl = (url) => {
    if (url.startsWith('http')) { // Check if the URL is an HTTP URL
      const timestamp = new Date().getTime();
      return url.includes('?') ? `${url}&nocache=${timestamp}` : `${url}?nocache=${timestamp}`;
    }
    return url; // Return the original URL if it's a data URL
  };
  
  const resetMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const context = maskCanvas.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };
  const generateMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const context = maskCanvas.getContext("2d");
    context.fillStyle = "white";
    context.beginPath();
    pointsRef.current.forEach((point, index) => {
      if (index === 0) {
        context.moveTo(point.x, point.y);
      } else {
        context.lineTo(point.x, point.y);
      }
    });
    context.closePath();
    context.fill();

    const maskDataURL = maskCanvas.toDataURL("image/png");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const draw = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (isMouseDownRef.current) {
        const prevPoint = pointsRef.current[pointsRef.current.length - 1];
        if (prevPoint && (prevPoint.x !== x || prevPoint.y !== y)) {
          pointsRef.current.push({ x, y });
          context.lineTo(x, y);
          context.strokeStyle = "#136DF4";
          context.lineWidth = 17;
          context.stroke();
        }
      }
    };
    const handleMouseDown = (event) => {
      isMouseDownRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      context.beginPath();
      context.moveTo(x, y);
      pointsRef.current.push({ x, y });
    };

    const handleMouseUp = (event) => {
      isMouseDownRef.current = false;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.closePath();
      context.fillStyle = "rgba(0, 100, 255, 0.5)";
      context.fill();
      checkClosedRegions();
    };

    const checkClosedRegions = () => {
      // Store the closed region if the path is closed
      const firstPoint = pointsRef.current[0];
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      const distance = Math.sqrt(
        Math.pow(lastPoint?.x - firstPoint?.x, 2) +
          Math.pow(lastPoint?.y - firstPoint?.y, 2)
      );
      setClosedRegions([...closedRegions, pointsRef.current]);
      generateMask();
      handleCropUpdate();
      pointsRef.current = [];
    };

    const cursorCanvas = document.createElement('canvas');
    cursorCanvas.width = 64;
    cursorCanvas.height = 64;
    const ctx = cursorCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(32, 32, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#136DF4';
    ctx.fill();

    const cursorURL = cursorCanvas.toDataURL('image/png');
    canvas.style.cursor = `url(${cursorURL}) 16 16, auto`;

    // Add event listeners for mouse down, move, and up
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", handleMouseUp);

    // Draw boundaries around the canvas
    // drawCanvasBoundaries(context, canvas);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
  if (imageData) {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.onload = () => {
      const canvas = canvasRef.current;
      if(!canvas) return ;
      const maxScreenWidth = window.innerWidth * 0.8;
      const context = canvas.getContext("2d");
      canvas.height = 650;
      const aspectRatio = image.naturalHeight / image.naturalWidth;
      let canvasWidth = canvas.height / aspectRatio;
      canvas.width = Math.min(canvasWidth, maxScreenWidth);
      console.log(canvas.width , canvasWidth, maxScreenWidth)
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawBackgroundImage(context, image, canvas);
      setLoading(false);
      setReseting(false);

      const maskCanvas = maskCanvasRef.current;
      const maskContext = maskCanvas.getContext("2d");
      if (maskCanvas.width != 680) {
        maskCanvas.height = 680;
        maskCanvas.width = maskCanvas.height / aspectRatio;
        if (maskImageData) {
          const maskImage = new Image();
          maskImage.crossOrigin = "Anonymous";
          maskImage.onload = () => {
            maskContext.drawImage(
              maskImage,
              0,
              0,
              maskCanvas.width,
              maskCanvas.height
            );
          };
          maskImage.src = maskImageData;
        } else {
          maskContext.fillStyle = "black";
          maskContext.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        }
      }
    };
    image.onerror = (e) => {
      console.error("Failed to load image:", image.src);
      console.error("Error details:", e);
      toast.error("Failed to load image");
    };
    image.src = getCacheBustedUrl(imageData);

  }
}, [imageData]);


  return (
    <>
      <canvas ref={maskCanvasRef} className="hidden" />
      <div className="mt-2 w-fit relative group">
        <canvas ref={canvasRef} className=" rounded-lg" />
        {(!loading && !showReset && !closedRegions.length) && (
          <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-[#136DF466] text-white group-hover:hidden">
            <p className=" font-bold text-lg">Hover to use cropping tool</p>
          </div>
        )}
          {loading && <div className=" absolute top-0 left-1/6"><Loader/></div>}
        {(showReset || reseting) && (
          <button
            onClick={() => {
              setReseting(true);
              resetMask();
              onReset();
            }}
            disabled={reseting}
            className="bg-black rounded-lg px-3 py-1 absolute z-[100000000] top-2 right-3 text-white border border-white hover:cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </>
  );
};
