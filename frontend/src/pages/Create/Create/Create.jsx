import LandscapeImg from "assets/landscape.png";
import LandscapeImg2 from "assets/presetImg.png";
import { FileUpload } from "components/FileUpload/FileUpload";
import { CREATE_PAGE_ACTIONS } from "CONSTANTS";
import { useCreatePageContext } from "context/CreateContext";
import { IoCloseCircle } from "react-icons/io5";
import { RiInformationFill } from "react-icons/ri";
import { FILE_TYPES } from "context/CreateContext";
import { useGetPresetImages } from "services/query.hook";
import Loader from "components/loader.component/Loader";
export const Create = () => {
  const { state, dispatch } = useCreatePageContext();
  const { uploadedImgUrl } = state;
  const {
    data: presetImages,
    isLoading,
    isError,
    isSuccess,
  } = useGetPresetImages();
  if (isLoading && !uploadedImgUrl)
    return (
      <div className=" w-96">
        <Loader />
      </div>
    );

  return (
    <div className="">
      <div className="flex bg-[#F8F8F8] mb-4 rounded-lg items-center gap-2 p-2 sm:px-4 px-2 w-full sm:w-fit">
        <RiInformationFill color="#AAAAAA" className=" sm:text-[18px] text-[40px]"/>
        <div className="flex flex-col ">
          <p className="text-[14px]">
            Upload an image from your computer or get started with one of the
            templates
          </p>
          <p className="text-gray-400 text-[14px]">Image formats: JPEG, PNG</p>
        </div>
      </div>
      {uploadedImgUrl ? (
        <div className="relative  md:h-[600px] mt-4 w-fit">
          <img
            className="md:h-[600px]  rounded-lg shadow-lg"
            src={uploadedImgUrl}
            alt="custom image"
          ></img>
          <div className="flex gap-1 absolute top-2 right-2 bg-black rounded-md items-center px-3 py-1">
            <p className="text-white font-semibold"> Image uploaded </p>
            <IoCloseCircle
              size={20}
              color="white"
              className="hover:cursor-pointer"
              onClick={() =>
                dispatch({
                  type: CREATE_PAGE_ACTIONS.CLEAR_FILE,
                })
              }
            />
          </div>
        </div>
      ) : (
        <div className="flex gap-5 flex-col lg:flex-row sm:items-center items-start lg:items-stretch ">
          <FileUpload
            onUpload={(file) =>
              dispatch({
                type: CREATE_PAGE_ACTIONS.Upload_FILE,
                file: file,
              })
            }
          />

          <div className=" max-h-[40vh] overflow-y-auto  md:py-10 py-7 md:px-10  flex flex-col items-center  gap-7 border border-gray-300 rounded-lg shadow-sm md:w-[400px] w-full  ">
            <div>
              <p className="font-bold text-lg text-center">
                Don't have an image?
              </p>
              <p className="text-md text-center">Use an example</p>
            </div>
            <div className="flex flex-wrap md:gap-x-0 gap-x-5 justify-around md:gap-y-24 gap-y-12 w-full">
              {isSuccess &&
                presetImages.map((preset) => (
                 
                    <img
                      key={preset?.preset_image_id}
                      src={`${preset?.image_url}?cache=false`}
                      alt="Landscape Image"
                      className="border-2 border-black rounded-lg cursor-pointer object-cover h-[99px] w-[118px]"
                      onClick={() =>
                        dispatch({
                          type: CREATE_PAGE_ACTIONS.Upload_FILE,
                          file: preset?.image_url,
                          fileType: FILE_TYPES.Is_Preset_Image,
                          fileId: preset?.preset_image_id,
                        })
                      }
                    />
                
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
