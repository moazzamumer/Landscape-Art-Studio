import React, { useState } from "react";
import { RiInformationFill } from "react-icons/ri";
import "./style.css";
import LandscapeImg from "assets/landscape.png";
import { useCreatePageContext } from "context/CreateContext";
import { CREATE_PAGE_ACTIONS } from "CONSTANTS";
import { useGetDesignStyles } from "../../../services/query.hook";
import Loader from "components/loader.component/Loader";

export const Style = () => {
  const { state, dispatch } = useCreatePageContext();
  const { Style_ID, AI_Creativity, Number_of_Designs, AI_Instructions,croppedImgUrl, presetID,uploadedImgUrl,outputID } = state;
  const { data, isLoading, isError } = useGetDesignStyles();
  const images = data?.images_with_names || [];
  if (isLoading) {
    return (<div className=" w-96">
    <Loader />
  </div>
  );}

  if (isError) {
    return <div>Error loading design styles</div>;
  }
  return (
    <div>
      <div className="flex bg-light mb-4 rounded-lg items-center gap-2 p-2 sm:px-4 px-2 w-full sm:w-fit">
        <RiInformationFill color="#AAAAAA" className=" sm:text-[18px] text-[35px]"/>
        <div>
          <p className="text-[14px]">
            Style your image with preset options or design your own using custom
            instructions
          </p>
        </div>
      </div>
      <div className="flex md:flex-row flex-col gap-4">
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md shadow-sm sm:p-7 p-10 justify-start pt-6 pb-2 max-h-[390px] overflow-y-auto sm::min-w-[490px] sm:w-fit w-full">
          <p className="font-bold text-md">Step 1: Style</p>
          <div className=" grid xl:grid-cols-4 sm:grid-cols-3 grid-cols-2 lg:gap-3 sm:gap-3 gap-1">
          {images.map((image) => (
              <div
                key={image.style_id}
                className={`image-container ${
                  Style_ID === image.style_id ? "!border-2 !border-[#136DF4]" : ""
                }`}
                onClick={() =>
                  dispatch({
                    type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
                    payload: { key: "Style_ID", value: image.style_id },
                  })
                }
              >
                <img
                  src={image.image_url}
                  alt={image.style_name}
                  // className="rounded-md"
                />
                <p className="text-center small-text mt-1">
                  {image.style_name.split(".")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 border border-gray-300 rounded-md shadow-sm pb-1 pt-6 pr-10 pl-9 h-[390px] w-full sm:w-[235px] ">
          <p className="font-bold text-md">Step 2: Customise</p>
          <p className="text-xs font-medium">Level of AI creativity</p>
          <div className="slider-container border border-gray-300 rounded-md p-2 pb-1 flex flex-col">
            <input
              type="range"
              min="15"
              max="31"
              value={AI_Creativity}
              onChange={(e) =>
                dispatch({
                  type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
                  payload: { key: "AI_Creativity", value: e.target.value },
                })
              }
              className="slider w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{fontSize:10}}>Low</span>
              <span className="text-xs" style={{fontSize:10}}>High</span>
            </div>
          </div>
          <p className="text-xs font-medium">Number of designs</p>
          <div className="slider-container-2 border border-gray-300 rounded-md p-2 pb-1 flex flex-col">
            <input
              type="range"
              min="1"
              max="4"
              value={Number_of_Designs}
              onChange={(e) =>{
                dispatch({
                  type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
                  payload: { key: "Number_of_Designs", value: e.target.value },
                })
              }}
              className="slider w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs" style={{fontSize:10}}>1</span>
              <span className="text-xs" style={{fontSize:10}}>4</span>
            </div>
          </div>
          <p className="text-xs font-medium">Custom AI Instructions (Required)</p>
          <textarea
            className="border border-gray-300 rounded-md p-2 h-[110px] text-xs font-medium"
            placeholder="e.g. Modern Australian design, stone pathway, variety of succulents"
            value={AI_Instructions}
            onChange={(e) =>
              dispatch({
                type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
                payload: { key: "AI_Instructions", value: e.target.value },
              })
            }
          ></textarea>
        </div>
      </div>
    </div>
  );
};
