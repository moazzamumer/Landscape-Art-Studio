import { generateOutputDesigns,getSavedImages, getDesignStyles, deleteSavedImages, saveAlgorithmFeedback, getPresetImages, saveOutputImage } from "services";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const useGetSavedImagesQuery = () => {
  return useQuery({ queryKey: ['savedImages'], queryFn: getSavedImages })
}

const useGetDesignStyles = () => {
  return useQuery({
    queryKey: ['getDesignStyles'],
    queryFn: getDesignStyles,
  })
}

const useSaveOutputImage = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveOutputImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedImages'] })
    },
  })
}

const useDeleteSavedImagesMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSavedImages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedImages'] })
    },
  })
}

const useSaveAlgorithmFeedbackMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveAlgorithmFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedImages'] })
    },
  })
}

const useGetPresetImages = () => {
  return useQuery({ queryKey: ['getPresetImages'], queryFn: getPresetImages })
}

const useGenerateOutputDesigns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateOutputDesigns,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedImages'] });
    },
  });
};

export {
  useDeleteSavedImagesMutation, useGetSavedImagesQuery, useSaveAlgorithmFeedbackMutation, useGetPresetImages,
  useSaveOutputImage, useGetDesignStyles, useGenerateOutputDesigns
}

