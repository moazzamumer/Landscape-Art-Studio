import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import animationData from "assets/Loader.json";
import { BeatLoader } from "react-spinners";
const Loader = () => {

  const messages = [
    "Please wait. Landscape AI is doing its magic.",
    "Just a moment, we're almost done",
  ];

  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextIndex = (messageIndex + 1) % messages.length;
      if (nextIndex < messages.length - 1) {
        // Check if the next index is not the last message
        setMessageIndex(nextIndex);
        setCurrentMessage(messages[nextIndex]);
      } else {
        // Set last message and clear interval
        setCurrentMessage(messages[messages.length - 1]);
        clearInterval(intervalId);
      }
    }, 10000); // Change message every 8000 milliseconds (8 seconds)

    return () => clearInterval(intervalId); // Clear the interval when the component unmounts
  }, [messageIndex, messages]);

  return (
    <div className="flex flex-col items-center justify-center">
      <BeatLoader color="#05DDB3" speedMultiplier={0.6} className=" mb-4"/>
      <p className="text-gray-600">{currentMessage}</p>
    </div>
  );
};

export default Loader;
