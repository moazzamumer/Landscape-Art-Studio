import React, { useState, useEffect } from "react";
import Lottie from "react-lottie";
import { BeatLoader } from "react-spinners";
import secondLoader from 'assets/generic_loader.json'
const Loader = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: secondLoader,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };




  return (
    <BeatLoader color="#05DDB3" speedMultiplier={0.6} className=" mb-4 p-10"/>
  );
};

export default Loader;
