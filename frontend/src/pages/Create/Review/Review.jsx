import { saveAs } from 'file-saver'
import { toast } from "react-toastify";

import { useSaveAlgorithmFeedbackMutation, useSaveOutputImage } from "services/query.hook";
import { useCreatePageContext } from "context/CreateContext";

import Export2Icon from "assets/export2.svg";
import SaveIcon from "assets/save.svg";
import like from "assets/like.svg";
import unlike from "assets/unlike.svg";
import Loader from "components/loader.component/LoaderComponent";
import { GENERATED_DATA_ACTIONS } from 'CONSTANTS';


const ButtonWithIcon = ({ icon, text, onClick, ...rest }) => {
  return (
    <button
      href="#"
      className="flex bg-black rounded-md text-white gap-1.5 justify-center items-center basis-[49%] h-10"
      onClick={onClick}
      {...rest}
    >
      <img className="" src={icon} width={13} height={13} alt="icon" />
      <p className="text-white leading-[11px] text-[10px] font-bold lg:inline sm:hidden">{text}</p>
    </button>
  );
};

const handleOverlayClicked = () => {
  toast.dismiss();
  toast.info('Please wait for the generation of designs');
}

export const Review = () => {
  const { state, dispatch } = useCreatePageContext();
  const { generated_data } = state;

  const { mutate: saveAlgorithmFeedback } = useSaveAlgorithmFeedbackMutation();
  const { mutate: saveOutputImage } = useSaveOutputImage();



  const handleFeedback = (Output_ID, Feedback, image) => {
    if (Feedback === image.Feedback) return;
    saveAlgorithmFeedback({ output_id: Output_ID, feedback: Feedback }, {
      onSuccess: () => {
        dispatch({ type: GENERATED_DATA_ACTIONS.CHANGE_IMAGE_FEEDBACK, payload: { output_id: Output_ID, Feedback } })
      },
      onError: () => {
        toast.success('Something went wrong. Unable to save feedback')
      }
    });
  }

  const handleSaveImage = (output_id, is_saved) => {
    if (!is_saved) {
      saveOutputImage({ output_id }, {
        onSuccess: () => {
          dispatch({ type: GENERATED_DATA_ACTIONS.SAVE_IMAGE, payload: { output_id, saveImage: true } })
          toast.success('Image saved successfully')
        },
        onError: () => {
          toast.error('Something went wrong. Unable to save image')
        },
      })
    }
  }

  const exportImage = (imageUrl) => {
    saveAs(imageUrl, 'image.jpg')
  }


  return (
    <div className="border border-[#D9D9D9] p-4 sm:p-7 max-w-[850px] rounded-md">
      <p className="text-[16px] font-bold leading-[18.96px] mb-4">
        Generated Images
      </p>
      <div className="flex items-center flex-wrap gap-3">
        {(generated_data && generated_data.length === 0) ?
          <div>No Generated Image Found</div>
          :
          generated_data?.map((image) => (
            <div
              key={image.output_image_id}
              className="flex flex-col basis-full sm:basis-[48%] items-center justify-between border border-[#D9D9D9] rounded-md p-3 gap-2 h-[355px]"
            >
              <img
                src={image.image_link}
                width={'100%'}
                className="rounded-md object-cover h-[280px]"
                alt='Generated'
              />

              <div className={`flex justify-center items-center gap-2 w-full`}>
                <div className='flex gap-2 basis-[60%] lg:basis-[60%]'>
                  <ButtonWithIcon
                    icon={SaveIcon}
                    text={image?.is_saved ? "Saved" : "Save"}
                    onClick={() => handleSaveImage(image.output_id, !!image?.is_saved)}
                    disabled={!!image?.is_saved}
                  />
                  <ButtonWithIcon
                    icon={Export2Icon}
                    text={"Export"}
                    onClick={() => exportImage(image.image_link)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 items-center flex-grow h-full justify-center">
                  <p className="leading-[11px] text-[9px] lg:text-[11px] font-bold  md:inline">
                    Algorithm feedback
                  </p>
                  <div className="flex gap-1.5 w-full">
                    <div
                      className={`flex justify-center items-center rounded-lg py-0.5 basis-[49%] ${image?.Feedback === "Good"
                        ? "bg-[#51BD94]"
                        : "bg-white cursor-pointer"
                        } border-2 border-black`}
                      onClick={() => handleFeedback(image.output_id, 'Good', image)}
                    >
                      <img src={like} height={14} width={14} alt='Like Icon' />
                    </div>
                    <div
                      className={`flex justify-center items-center rounded-lg py-0.5 basis-[49%] ${image?.Feedback === "Bad"
                        ? "bg-[#D2A5FF]"
                        : "bg-white cursor-pointer"
                        } border-2 border-black`}
                      onClick={() => handleFeedback(image.output_id, 'Bad', image)}
                    >
                      <img src={unlike} height={14} width={14} alt='Dislike Icon' />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
