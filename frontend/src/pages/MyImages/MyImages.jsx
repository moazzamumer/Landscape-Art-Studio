import React, { useState } from 'react'
import { saveAs } from 'file-saver'
import { RxCross1 } from "react-icons/rx";
import view from 'assets/view.svg'
import Export from 'assets/export.svg'
import input from 'assets/input.svg'
import Delete from 'assets/delete.svg'
import like from 'assets/like.svg'
import unlike from 'assets/unlike.svg'
import {
    useDeleteSavedImagesMutation,
    useGetSavedImagesQuery,
    useSaveAlgorithmFeedbackMutation
} from 'services/query.hook';
import { BeatLoader } from 'react-spinners';
import { useCreatePageContext } from 'context/CreateContext';
import { useNavigate } from 'react-router-dom';
import { CREATE_PAGE_ACTIONS } from 'CONSTANTS';
import { FILE_TYPES } from 'context/CreateContext';


const MyImages = () => {
    const navigate = useNavigate();
    const { state, dispatch } = useCreatePageContext();
    const [modalImage, setModalImage] = useState(null);
    const deleteSavedImage = useDeleteSavedImagesMutation();
    const { mutate: saveAlgorithmFeedback } = useSaveAlgorithmFeedbackMutation();
    const { data: images, isLoading, isError, error: fetchError } = useGetSavedImagesQuery();

    const handleDelete = (Saved_Output_ID) => {
        deleteSavedImage.mutate({ saved_output_id: Saved_Output_ID });
    }

    const handleFeedback = (Output_ID, Feedback, image) => {
        if (Feedback === image.Feedback) return;
        saveAlgorithmFeedback({ output_id: Output_ID, feedback: Feedback });
    }

    const downloadImage = (imageUrl) => {
        saveAs(imageUrl, 'image.jpg')
    }

    const openModal = (imageUrl) => {
        setModalImage(imageUrl);
    }

    const closeModal = () => {
        setModalImage(null);
    }

    const handleUseAsInput = (imageUrl, Output_ID) => {
        dispatch({ type: 'reinitialize_state' })
        dispatch({
            type: CREATE_PAGE_ACTIONS.Upload_FILE,
            file: imageUrl, fileType: FILE_TYPES.Is_Output_Image, fileId: Output_ID
        })
        navigate('/create')
    }
        return (
        <div className='flex flex-col p-5 sm:p-10 gap-5 '>
            <h1 className="font-bold text-4xl">My images</h1>
            {isLoading ? (
                <div className=" w-full h-[80vh] flex justify-center items-center">
                    <BeatLoader color="#05DDB3" speedMultiplier={0.6}  />
                </div>
            ) : ( isError ? <p className="text-red-500">{fetchError.message}</p> :
                <>
                    {!Array.isArray(images) ? (
                        <p className="text-gray-500">No images found</p>
                    ) : (
                        <div className="border border-[#D9D9D9] p-4 sm:p-7 rounded-md max-w-[1184px]">
                            <div className="flex items-center flex-wrap gap-3">
                                {images.map((image) => (
                                    <div key={image.Saved_Output_ID} className="flex flex-col basis-full sm:basis-[48%] xl:basis-[32%] items-center justify-between border border-[#D9D9D9] rounded-md gap-2 p-3  h-[320px]">
                                        <div className='w-full h-full flex flex-col justify-between'>
                                            <div className="relative h-[83%]">
                                                <img alt="image" src={image.Image_URL} width={'100%'} className="rounded-md object-fill h-[100%]" />
                                                <div className="absolute flex gap-1.5 top-2 right-2">
                                                    <div
                                                        className={`flex justify-center items-center rounded-lg py-0.5 px-4 ${image.Feedback === 'Good' ? 'bg-[#51BD94]' : 'bg-white cursor-pointer'} border-2 border-black`}
                                                        onClick={() => handleFeedback(image.Output_ID, 'Good', image)}
                                                    >
                                                        <img src={like} height={14} width={14} alt="like" />
                                                    </div>
                                                    <div
                                                        className={`flex justify-center items-center rounded-lg py-0.5 px-4 ${image.Feedback === 'Bad' ? 'bg-[#D2A5FF]' : 'bg-white cursor-pointer'} border-2 border-black`}
                                                        onClick={() => handleFeedback(image.Output_ID, 'Bad', image)}
                                                    >
                                                        <img src={unlike} height={14} width={14} alt="dislike" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-center items-center gap-2">
                                                <button
                                                    className="flex flex-col bg-black rounded-md text-white gap-1.5 justify-center items-center basis-[24%] h-10"
                                                    onClick={() => openModal(image.Image_URL)}
                                                >
                                                    <img src={view} width={11} height={11} alt="view" />
                                                    <p className="text-white leading-[11px] text-[9px] font-bold sm:hidden lg:inline">View</p>
                                                </button>
                                                <button
                                                    className="flex flex-col bg-black rounded-md text-white gap-1.5 justify-center items-center basis-[24%] h-10"
                                                    onClick={() => downloadImage(image.Image_URL)}
                                                >
                                                    <img src={Export} width={11} height={11} alt="export" />
                                                    <p className="text-white leading-[11px] text-[9px] font-bold sm:hidden lg:inline">Export</p>
                                                </button>
                                                <button
                                                    className="flex flex-col bg-black rounded-md text-white  gap-1.5 justify-center items-center basis-[24%] h-10"
                                                    onClick={() => handleUseAsInput(image.Image_URL, image.Output_ID)}
                                                >
                                                    <img src={input} width={14} height={11} alt="input" />
                                                    <p className="text-white leading-[11px] text-[9px] font-bold sm:hidden lg:inline">Use as input</p>
                                                </button>
                                                <button
                                                    className="flex flex-col bg-black rounded-md text-white gap-1.5 justify-center items-center basis-[24%] h-10"
                                                    onClick={() => handleDelete(image.Saved_Output_ID)}
                                                >
                                                    <img src={Delete} width={11} height={6} alt="delete" />
                                                    <p className="text-white leading-[11px] text-[9px] font-bold sm:hidden lg:inlinehidden lg:inline">Delete</p>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
            {modalImage && (
                <div
                    className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-75 z-50"
                    onClick={() => closeModal()}
                >
                    <div className="relative w-full max-w-4xl max-h-full overflow-y-auto px-10">
                        <button className="absolute top-2 right-12" onClick={closeModal}>
                            <RxCross1 size={20} color="black" />
                        </button>
                        <img src={modalImage} alt="Full Screen" className="rounded-md h-full w-full" />
                    </div>
                </div>
            )}

        </div>
    )
}

export default MyImages