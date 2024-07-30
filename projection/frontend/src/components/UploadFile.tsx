import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import {
    DialogClose,
  } from "@/components/ui/dialog"
import AWS from 'aws-sdk';
import { useUser } from '@clerk/clerk-react';

const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET;
const REGION = process.env.NEXT_PUBLIC_REGION;
const ACCESS_KEY = process.env.NEXT_PUBLIC_ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.NEXT_PUBLIC_SECRET_ACCESS_KEY;

AWS.config.update({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
});

const s3 = new AWS.S3();


const FileUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useUser();
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
      setUploadProgress(0); // Reset progress bar
      simulateProgress();
    }
  }, []);

  const simulateProgress = () => {
    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + 10;
      });
    }, 100);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsUploading(true);

    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      const openaiResponse = response.data.openai_response;
      const s3Link = `https://${S3_BUCKET}.s3.${REGION}.amazonaws.com/uploads/${user.id}/${selectedFile.name}`;
      console.log(openaiResponse)
      await axios.post('http://127.0.0.1:8080/api/v1/file-upload', {
        userId: user.id,
        userName: user.fullName,
        fileName: selectedFile.name,
        s3Link,
        fileData: openaiResponse
      });

      console.log("Put into database")

      // Show toast notification
      toast({
        variant: "success",
        title: "File Uploaded",
        description: selectedFile.name
      });

      

      // Reset states after successful upload
      setSelectedFile(null);
      setUploadProgress(0);

      <DialogClose/>


    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer w-full ${
          isDragActive ? 'border-blue-500' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center h-40">
          <div className="text-blue-500 text-6xl mb-4">&#8593;</div>
          <p className="text-lg">
            Drag and Drop file here or <span className="text-blue-500">Choose file</span>
          </p>
          <p className="text-sm text-gray-500">Supported formats: PDF, DOC</p>
          <p className="text-sm text-gray-500">Maximum size: 25MB</p>
        </div>
      </div>
      {selectedFile && (
        <div className="mt-4 w-full">
          <div className="p-4 border rounded-lg mb-2 bg-gray-100">
            <p>{selectedFile.name} - {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${uploadProgress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
              <p className="text-right text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
          <div className="flex justify-end">
          <DialogClose asChild>
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-blue-500 text-white rounded"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
            </DialogClose>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUpload;
