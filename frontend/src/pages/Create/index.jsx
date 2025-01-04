import Stepper from "components/Stepper/Stepper";
import { CREATE_PAGE_ACTIONS, GENERATED_DATA_ACTIONS } from "CONSTANTS";
import { useCreatePageContext, NextPageValidation } from "context/CreateContext";
import { MdErrorOutline } from "react-icons/md";
import { twMerge } from "tailwind-merge";
import { Create } from "./Create/Create";
import { Crop } from "./Crop/Crop";
import { Review } from "./Review/Review";
import { Style } from "./Style/Style";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { dataUrlToFile,blobUrlToFile } from "utils/utility";
import {useGenerateOutputDesigns} from "services/query.hook";
import Loader from "components/loader.component/LoaderComponent";
const COMPONENTS = [<Create />, <Crop />, <Style />, <Review />];

const CreatePage = () => {
  const { state, dispatch } = useCreatePageContext();
  const {mutate:generateOutputDesignsMutation, isPending} = useGenerateOutputDesigns();

  const { activeIndex, isFirstPage, isLastPage, totalComponents, message, Style_ID, AI_Creativity, Number_of_Designs, AI_Instructions, Is_Preset_Image, uploadedImgUrl, Is_Output_Image, croppedImgUrl, maskImage } =
    state;
    const handleNextClick = async () => {
      if (activeIndex === 2) {  // Check if the current step is the Style component
        const { isValid, message } = NextPageValidation(state, activeIndex);

      if (!isValid) {
        toast.dismiss();
        toast.error(message, { autoClose: 3000 });
        setTimeout(() => {
          dispatch({ type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM, payload: { key: 'message', value: '' } });
        }, 4000);
        return;
      }
        const payload = {
          style_id: Style_ID,
          ai_creativity: AI_Creativity,
          number_of_designs: Number_of_Designs,
          ai_instruction: AI_Instructions,
          mask: dataUrlToFile(maskImage, "mask.png")
        };
        // Conditionally add preset_id and output_id if they are greater than 0
        if (Is_Preset_Image > 0) {
          payload.preset_id = Is_Preset_Image;
        }
        if (Is_Output_Image > 0) {
          payload.output_id = Is_Output_Image;
        }
        // Conditionally add input_image1 if both preset_id and output_id are 0
        if (Is_Preset_Image === 0 && Is_Output_Image === 0) {
          payload.input_image1 = await blobUrlToFile(uploadedImgUrl, "input_image1.png");
        }
        generateOutputDesignsMutation(payload, {
          onSuccess: (data) => {
            dispatch({ type: GENERATED_DATA_ACTIONS.SAVE_GENERATED_DATA, data})
            dispatch({ type: CREATE_PAGE_ACTIONS.NEXT_PAGE });
          },
          onError: (error) => {
            toast.error("Failed to generate designs. Please try again.");
          }
        });
      } else {
        dispatch({ type: CREATE_PAGE_ACTIONS.NEXT_PAGE });
      }
    };

    const handleOverlayClicked = ()=>{
      toast.dismiss();
      toast.info('Please wait for the generation of designs');
    }
  useEffect(() => {
    if (message) {
      toast.dismiss();
      toast.error(message, {autoClose: 3000});
      setTimeout(()=>{dispatch({type: CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM, payload:{key:'message', value:''}})}, 4000);
    }
  }, [message])
  if (isPending) {
    return (<div className="flex items-center justify-center h-[100vh]">
    <Loader />
    <div className="fixed top-0 left-0 w-screen h-screen z-[1000]" onClick={handleOverlayClicked}></div>
  </div>
  );}
  return (
    <div className="ps-3.5 pe-3.5 sm:p-10">
      <h1 className=" font-bold text-4xl">Create</h1>
      <Stepper currentStep={activeIndex} numberOfSteps={COMPONENTS.length} />
      {COMPONENTS[activeIndex]}

      {/* <div className="flex gap-1 h-6 items-center">
        {!!message && <MdErrorOutline color="red" />}
        {!!message && <p className="text-red-500 text-sm">{message}</p>}
      </div> */}
      <div className="flex gap-3 mt-4">
        {(!isFirstPage || uploadedImgUrl) && (
          <button
            className={"py-1 px-5 shadow-md rounded-md border sm:mb-0 mb-3 border-gray-100"}
            onClick={() => 
              dispatch({ type: isFirstPage ? CREATE_PAGE_ACTIONS.STATE_REINITIAZED :CREATE_PAGE_ACTIONS.PREV_PAGE })
            }
          >
            Back
          </button>
        )}
        {!isLastPage && (<button
          className={"py-1 px-5 shadow-md rounded-md bg-[#51BD94] text-white sm:mb-0 mb-3"}
          onClick={handleNextClick}
        >
            {activeIndex === 2 ? 'Generate' : 'Next'}
        </button>)}
      </div>
    </div>
  );
};

export default CreatePage;
