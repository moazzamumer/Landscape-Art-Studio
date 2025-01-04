import { CropCanvas } from "components/CropImage/CropImage";
import { CREATE_PAGE_ACTIONS } from "CONSTANTS";
import { useCreatePageContext } from "context/CreateContext";
import { useEffect } from "react";
import { RiInformationFill } from "react-icons/ri";
import { MobileCropCanvas } from "components/CropImage/MobileCrop";
import { useIsMobile } from "hooks/useIsMobile";


export const Crop = () => {
  const { state, dispatch } = useCreatePageContext();
  const { uploadedImgUrl, croppedImgUrl, maskImage } = state;
  const isMobile = useIsMobile();

  const resetCropedImage = () =>
    dispatch({
      type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
      payload: { key: "croppedImgUrl", value: uploadedImgUrl },
    });
  useEffect(() => {
    dispatch({
      type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
      payload: { key: "croppedImgUrl", value: croppedImgUrl || uploadedImgUrl },
    });
  }, []);

  return (
    <div>
      <div className="flex bg-light mb-4 rounded-lg items-center gap-2 p-2 sm:px-4 px-2 w-full sm:w-fit">
        <RiInformationFill color="#AAAAAA" className=" sm:text-[18px] text-[35px]"/>
        <div className="flex flex-col">
          <p className="text-[14px]">
            Choose what parts of the image you want designed with the AI model
          </p>
        </div>
      </div>
      {!isMobile ? (<CropCanvas
        style={{}}
        showReset={croppedImgUrl !== uploadedImgUrl}
        onReset={resetCropedImage}
        imageData={croppedImgUrl}
        maskImageData={maskImage}
        onCrop={(dataUrl, maskDataUrl) => {
          dispatch({
            type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
            payload: { key: "croppedImgUrl", value: dataUrl },
          });
          dispatch({
            type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
            payload: { key: "maskImage", value: maskDataUrl },
          });
        }}
      />):(
      <MobileCropCanvas
        style={{}}
        showReset={croppedImgUrl !== uploadedImgUrl}
        onReset={resetCropedImage}
        imageData={croppedImgUrl}
        maskImageData={maskImage}
        onCrop={(dataUrl, maskDataUrl) => {
          dispatch({
            type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
            payload: { key: "croppedImgUrl", value: dataUrl },
          });
          dispatch({
            type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM,
            payload: { key: "maskImage", value: maskDataUrl },
          });
        }}
      />)}
    </div>
  );
};
