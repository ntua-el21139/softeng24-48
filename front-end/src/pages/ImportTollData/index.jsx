import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { Button, Heading, Img } from "../../components/ui";
import React, { useCallback, useState } from "react";

export default function ImportTollDataPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a CSV file');
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('http://localhost:9115/api/admin/addpasses', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Upload response:', data);
        setUploadSuccess(true);
        setSelectedFile(null);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error uploading file: ${error.message}`);
      }
    } else {
      alert('Please select a file first');
    }
  }, [selectedFile]);

  if (uploadSuccess) {
    return (
      <>
        <Helmet>
          <title>InterToll</title>
          <meta name="description" content="Web site created using create-react-app" />
        </Helmet>

        <div className="flex w-full flex-col items-center bg-gradient min-h-screen">
          <Header className="self-stretch" />

          {/* Logo Section */}
          <div className="flex justify-center items-center py-2 mt-8">
            <img 
              src="/images/logo.png" 
              alt="InterToll" 
              className="w-[300px] h-[124px] object-contain"
            />
          </div>

          {/* Main Content */}
          <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem] mt-4">
            <div className="flex w-[50%] flex-col items-center md:w-full">
              {/* Success Message */}
              <div className="mt-4 flex flex-col items-center gap-4 self-stretch rounded-[16px] bg-[#4A4A9A] px-[3.50rem] py-8 shadow-xs md:p-[1.25rem]">
                <div className="flex flex-col items-center gap-4">
                  <div className="mb-4">
                    <svg 
                      className="mx-auto h-20 w-[22%] text-green-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col items-center">
                    <Heading
                      size="headingmd"
                      as="h1"
                      className="text-[2.00rem] font-semibold text-white md:text-[1.88rem] sm:text-[1.75rem]"
                    >
                      The file was uploaded successfuly.
                    </Heading>
                  </div>
                </div>
              </div>

              {/* Upload Again Button */}
              <div className="flex justify-center mt-8">
                <Button
                  shape="round"
                  onClick={() => setUploadSuccess(false)}
                  className="w-32 rounded-[55px] bg-[#2D7EFF] py-2 text-white text-base font-medium shadow-lg hover:bg-[#2D7EFF]/90 focus:outline-none transition-colors"
                >
                  Upload Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col items-center bg-gradient min-h-screen">
        {/* Header Section */}
        <Header className="self-stretch" />

        {/* Logo Section */}
        <div className="flex justify-center items-center py-2 mt-8">
          <img 
            src="/images/logo.png" 
            alt="InterToll" 
            className="w-[300px] h-[124px] object-contain"
          />
        </div>

        {/* Main Content */}
        <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem] mt-4">
          <div className="flex w-[50%] flex-col items-center md:w-full">
            {/* Upload Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
              className={`mt-4 flex flex-col items-center gap-4 self-stretch rounded-[16px] border-2 border-dashed ${
                isDragging ? 'border-[#2D7EFF] bg-[#4A4A9A]/90' : 'border-gray-900_75 bg-[#4A4A9A]'
              } px-[3.50rem] py-8 shadow-xs md:p-[1.25rem] cursor-pointer transition-all duration-200 hover:border-[#2D7EFF]`}
            >
              <input
                type="file"
                id="fileInput"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Img
                src="/images/ img_group_indigo_50_100x114.svg"
                alt="Image"
                className="h-20 w-[22%] object-contain"
              />

              <div className="flex flex-col items-center">
                <Heading
                  size="headingmd"
                  as="h1"
                  className="text-[2.00rem] font-semibold text-white md:text-[1.88rem] sm:text-[1.75rem]"
                >
                  {selectedFile ? selectedFile.name : "Drag and drop or click here"}
                </Heading>
                <Heading 
                  size="headingxs" 
                  as="h2" 
                  className="text-[1.25rem] font-semibold text-white"
                >
                  {selectedFile ? "File selected" : "to upload your CSV file"}
                </Heading>
              </div>
            </div>

            {/* Upload Button */}
            <div className="flex justify-center mt-8">
              <Button
                shape="round"
                onClick={handleUpload}
                className="w-32 rounded-[55px] bg-[#2D7EFF] py-2 text-white text-base font-medium shadow-lg hover:bg-[#2D7EFF]/90 focus:outline-none transition-colors"
                disabled={!selectedFile}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}