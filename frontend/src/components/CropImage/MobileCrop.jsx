import React, { useRef, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Loader from "components/loader.component/Loader";
import { useCreatePageContext } from "context/CreateContext";
import { twMerge } from "tailwind-merge";
export const MobileCropCanvas = ({
  imageData,
  maskImageData,
  onCrop,
  onReset,
  showReset = false,
}) => {
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef(null);
  const maskCanvasRef = useRef(null);
  const isMouseDownRef = useRef(false);
  const pointsRef = useRef([]);
  const [reseting, setReseting] = useState(false);
  const [closedRegions, setClosedRegions] = useState([]);
  const { state, dispatch } = useCreatePageContext();
  const { Is_Preset_Image, Is_Output_Image } = state;
  const drawBackgroundImage = (context, image, canvas) => {
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  };

  const drawCanvasBoundaries = (context, canvas) => {
    context.strokeStyle = "#136DF4";
    context.lineWidth = 5;
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
    if (url.startsWith("http")) {
      // Check if the URL is an HTTP URL
      const timestamp = new Date().getTime();
      return url.includes("?")
        ? `${url}&nocache=${timestamp}`
        : `${url}?nocache=${timestamp}`;
    }
    return url; // Return the original URL if it's a data URL
  };

  const resetMask = () => {
    const maskCanvas = maskCanvasRef.current;
    const context = maskCanvas.getContext("2d");
    context.fillStyle = "black";
    context.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
  };
  const generateMask = (canvas, color) => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    context.fillStyle = color;
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

    const maskDataURL = canvas.toDataURL("image/png");
  };






  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const draw = (event) => {
        event.preventDefault(); // Prevent default touch behavior
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        if (isMouseDownRef.current) {
          const prevPoint = pointsRef.current[pointsRef.current.length - 1];
          if (prevPoint && (prevPoint.x !== x || prevPoint.y !== y)) {
            pointsRef.current.push({ x, y });
            context.beginPath();
            context.moveTo(prevPoint.x, prevPoint.y);
            context.lineTo(x, y);
            context.strokeStyle = "#136DF4";
            context.lineWidth = 12;
            context.stroke();
            context.closePath();
          }
        }
      };
    const handleMouseDown = (event) => {
      event.preventDefault();
      isMouseDownRef.current = true;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      context.beginPath();
      context.moveTo(x, y);
      pointsRef.current.push({ x, y });
    };

    const handleMouseUp = (event) => {
      event.preventDefault();
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

    //   setClosedRegions([...closedRegions, pointsRef.current]);
      const maskCanvas = maskCanvasRef.current;
      const canvas = canvasRef.current;
      generateMask(maskCanvas, 'white');
      generateMask(canvas, "rgba(0, 100, 255, 0.5)");
      handleCropUpdate();
      pointsRef.current = [];
    };

    // Add event listeners for mouse down, move, and up
    canvas.addEventListener("touchstart", handleMouseDown);
    canvas.addEventListener("touchmove", draw);
    canvas.addEventListener("touchend", handleMouseUp);

    return () => {
      canvas.removeEventListener("touchstart", handleMouseDown);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (imageData) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = () => {
        const canvas = canvasRef.current;
        if(!canvas) return ;
        const context = canvas.getContext("2d");
        const aspectRatio =
          image.naturalWidth / image.naturalHeight;
        const screenWidth = window.innerWidth;
        const canvasWidth = screenWidth;
        canvas.width = canvasWidth;
        canvas.height = canvasWidth / aspectRatio;
        context.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
        drawBackgroundImage(context, image, canvas);
        setLoading(false);
        setReseting(false);

        const maskCanvas = maskCanvasRef.current;
        const maskContext = maskCanvas.getContext("2d");
        if (maskCanvas.width !== canvas.width) {
          maskCanvas.width = canvas.width;
          maskCanvas.height = canvas.height;
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
            maskContext.fillRect(
              0,
              0,
              maskCanvas.width,
              maskCanvas.height
            );
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
  }, [imageData, maskImageData]);

  return (
    <>
      <canvas ref={maskCanvasRef} className="hidden" />
      <div className="mt-2 w-fit relative group">
        <canvas ref={canvasRef} className="w-full sm:w-fit rounded-lg"/>
        {loading && <div className=" absolute top-5 left-1/6"><Loader/></div>}
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
