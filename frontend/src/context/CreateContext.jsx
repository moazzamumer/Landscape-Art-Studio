import { createContext, useContext, useState, useReducer } from "react";
import { act } from "react-dom/test-utils";
import { CREATE_PAGE_ACTIONS, GENERATED_DATA_ACTIONS } from "CONSTANTS";
const CreatePageContext = createContext(null);

export const FILE_TYPES = {
  Is_Preset_Image: "Is_Preset_Image",
  Is_Output_Image: "Is_Output_Image",
};
export const useCreatePageContext = () => useContext(CreatePageContext);

const initialState = {
  activeIndex: 0,
  totalComponents: 4,
  isFirstPage: true,
  isLastPage: false,
  uploadedImgUrl: "",
  croppedImgUrl: "",
  maskImage: "",
  message: "",
  Is_Preset_Image: 0,
  Is_Output_Image: 0,
  Style_ID: -1,
  AI_Creativity: 23,
  Number_of_Designs: 1,
  AI_Instructions: "",
  generated_data: []
};

export const NextPageValidation = (state, page) => {
  switch (page) {
    case 0: {
      return {
        isValid: !!state.uploadedImgUrl,
        message: "Please upload or select an image",
      };
    }
    case 1: {
      return {
        isValid:
          !!state.croppedImgUrl && state.uploadedImgUrl !== state.croppedImgUrl,
        message: "Please highlight the area to be designed by AI",
      };
    }
    case 2: {
      return {
        isValid: state.Style_ID > -1 && !!state.AI_Instructions,
        message:  !(state.Style_ID > -1) ? "Please select a style for your landscape": "Please enter AI instructions",
      };
    }
    default: {
      return { isValid: true, message: "Go Ahead" };
    }
  }
};
const reducer = (state, action) => {
  switch (action.type) {
    case CREATE_PAGE_ACTIONS.NEXT_PAGE: {
      const { isValid, message } = NextPageValidation(state, state.activeIndex);

      if (!isValid) return { ...state, message };

      let newIndex = state.activeIndex;
      if (newIndex < state.totalComponents - 1) newIndex += 1;

      let isFirstPage = newIndex === 0;
      let isLastPage = newIndex === state.totalComponents - 1;
      return {
        ...state,
        activeIndex: newIndex,
        isFirstPage,
        isLastPage,
        message: "",
      };
    }
    case CREATE_PAGE_ACTIONS.PREV_PAGE: {
      if (state.isLastPage) return initialState
      let newIndex = state.activeIndex;
      if (newIndex > 0) newIndex -= 1;
      let isFirstPage = newIndex === 0;
      let isLastPage = newIndex === state.totalComponents - 1;
      return {
        ...state,
        activeIndex: newIndex,
        isFirstPage,
        isLastPage,
        message: "",
      };
    }
    case CREATE_PAGE_ACTIONS.Upload_FILE: {
      let filePath = action.file;
      let fileType = action.fileType;
      let fileId = action.fileId;
      if (Array.isArray(action.file))
        filePath = URL.createObjectURL(filePath[0]) || null;

      const returnState = {
        ...state,
        uploadedImgUrl: filePath,
        message: "",

      }
      if (!!fileType) {
        returnState[fileType] = fileId;
      }
      return returnState;
    }
    case CREATE_PAGE_ACTIONS.UPDATE_STATE_ITEM: {
      const { key, value } = action.payload;
      return { ...state, [key]: value };
    }
    case CREATE_PAGE_ACTIONS.STATE_REINITIAZED: {
      return {
        ...state,
        activeIndex: 0,
        activeIndex: 0,
        totalComponents: 4,
        isFirstPage: true,
        isLastPage: false,
        uploadedImgUrl: "",
        croppedImgUrl: "",
        maskImage: "",
        message: "",
        Is_Preset_Image: 0,
        Is_Output_Image: 0,
        Style_ID: -1,
        AI_Creativity: 23,
        Number_of_Designs: 1,
        AI_Instructions: "",
      };
    }
    case CREATE_PAGE_ACTIONS.UPDATE_IMAGE_URL: {
      const { key, value } = action.payload;
      return {
        ...state,
        [key]: [value],
        Is_Preset_Image: true,
      };
    }
    case CREATE_PAGE_ACTIONS.CLEAR_FILE: {
      return {
        ...state,
        uploadedImgUrl: "",
        croppedImgUrl: "",
        maskImage: "",
        Is_Preset_Image: 0,
        Is_Output_Image: 0,
      };
    }
    case GENERATED_DATA_ACTIONS.SAVE_GENERATED_DATA: {
      const data = action.data
      let generated_data = [];
      // Determine the maximum length of arrays within the data object
      const maxLength = Math.max(...Object.values(data).map(arr => arr.length));
      
      
      // Loop through each index
      for (let index = 0; index < maxLength; index++) {
          // Initialize an object for the current index
          let obj = {};
          // Iterate over each key in the data object
          for (let key in data) {
              // If the index is valid for the current key's array, assign the value
              if (data[key]?.[index] !== undefined) {
                  obj[key.slice(0, -1)] = data[key][index];
              }
          }
          // Push the object to the generated_data array
          generated_data.push(obj);
      }
      
      return {
        ...state,
        generated_data
      }
    }
    case GENERATED_DATA_ACTIONS.CHANGE_IMAGE_FEEDBACK: {
      const generated_data = state?.generated_data?.map((image_data) => {
        if (image_data.output_id === action?.payload?.output_id) {
          return { ...image_data, Feedback: action?.payload?.Feedback }
        }
        return image_data
      })
      return {
        ...state,
        generated_data
      }
    }
    case GENERATED_DATA_ACTIONS.SAVE_IMAGE: {
      const generated_data = state?.generated_data?.map((image_data) => {
        if (image_data.output_id === action?.payload?.output_id) {
          return { ...image_data, is_saved: action?.payload?.saveImage }
        }
        return image_data
      })
      return {
        ...state,
        generated_data
      }
    }
  }
};

export const CreatePageContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CreatePageContext.Provider value={{ state, dispatch }}>
      {children}
    </CreatePageContext.Provider>
  );
};
