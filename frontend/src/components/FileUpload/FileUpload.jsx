import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ImageLogo from 'assets/imageLogo.svg';

export const FileUpload = ({ onUpload }) => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            console.log(acceptedFiles);
            setUploadedFiles(acceptedFiles);
            onUpload && onUpload(acceptedFiles);
        },
        multiple: false,
        accept: {
            'image/jpeg': [],
            'image/png': []
        },
        
    });

    return (
        <div
            {...getRootProps()}
            className='flex rounded-md items-center justify-center p-10 border border-gray-300 shadow-sm h-100 md:w-[500px] w-full cursor-pointer'
        >
            <input {...getInputProps()} />
            <div className='text-center'>
                <img src={ImageLogo} alt="Upload" height={255} width={255} className='m-auto' />
                {/* <p className='mt-3'>Drag and drop or click to browse</p> */}
            </div>
        </div>
    );
};
