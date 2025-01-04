const processFileAndGetModifiedPath = (file) => {
  const reader = new FileReader();
  reader.onload = (event) => {
    const modifiedData = event.target.result;
  };
  reader.readAsDataURL(file);

  return null;
};
// utils/dataUrlToFile.js
export const dataUrlToFile = (dataUrl, filename) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};
// utils/blobUrlToFile.js
export const blobUrlToFile = async (blobUrl, filename) => {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

