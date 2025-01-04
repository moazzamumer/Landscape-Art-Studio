import queryString from "query-string";

const BASE_URL = 'http://100.25.153.104:8000'

export const getDesignStyles = async () => {
  const response = await fetch(`${BASE_URL}/Get_Design_Styles`);
  if (!response.ok) {
    throw new Error('Something went wrong')
  }
  const data = await response.json();
  return data;
}

export const saveOutputImage = async (output_id) => {
  const params = queryString.stringify(output_id);
  const response = await fetch(`${BASE_URL}/Save_Output_Image?${params}`, {
    method: "POST",
  });
  if (!response.ok) {
    throw new Error('Something went wrong')
  }
  const data = await response.json();
  return data;
}

export const getSavedImages = async () => {
  const response = await fetch(`${BASE_URL}/Get_Saved_Images`);
  if (!response.ok) {
    throw new Error('Something went wrong while fetching the saved images. Please try again later')
  }
  const data = await response.json();
  return data;
};

export const deleteSavedImages = async (payload) => {
  const params = queryString.stringify(payload);
  const response = await fetch(`${BASE_URL}/Delete_Saved_Image?${params}`, {
    method: "POST",
  });
  const data = await response.json();
  return data;
};

export const saveAlgorithmFeedback = async (payload) => {
  const params = queryString.stringify(payload);
  const response = await fetch(`${BASE_URL}/Save_Algorithm_Feedback?${params}`, {
    method: "PUT",
  });
  const data = await response.json();
  return data;
};

export const getPresetImages = async () => {
  const response = await fetch(`${BASE_URL}/Get_Preset_Input_Images`)
  const data = await response.json();
  return data.preset_images;
};

// services/index.js
export const generateOutputDesigns = async ({ style_id, ai_creativity, number_of_designs, ai_instruction, preset_id, output_id, input_image1, mask }) => {
  const queryParams = new URLSearchParams({
    style_id,
    ai_creativity,
    number_of_designs
  });

  if (ai_instruction) {
    queryParams.append("ai_instruction", ai_instruction);
  }
  if (preset_id) {
    queryParams.append("preset_id", preset_id);
  }
  if (output_id) {
    queryParams.append("output_id", output_id);
  }

  const formData = new FormData();
  if (input_image1) {
    formData.append("input_image1", input_image1);
  }
  formData.append("mask", mask);

  const response = await fetch(`${BASE_URL}/Generate_Output_Designs?${queryParams.toString()}`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error('Something went wrong');
  }
  const data = await response.json();
  return data;
};

