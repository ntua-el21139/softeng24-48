import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { Button, Heading, Img } from "../../components/ui";
import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

export default function ImportTollDataPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    navigate('/');
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateCSVContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim()); // Remove empty lines
        
        // Check if file is empty
        if (lines.length < 2) {
          reject('❌ File is empty');
          return;
        }

        // Check header - case insensitive comparison
        const header = lines[0].trim().toLowerCase();
        const expectedHeaders = ['timestamp', 'tollid', 'tagref', 'taghomeid', 'charge'];
        const actualHeaders = header.split(',').map(h => h.trim().toLowerCase());
        
        // Check if all required headers are present, regardless of order
        const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));
        if (missingHeaders.length > 0) {
          reject(`❌ Invalid CSV format. Missing columns: ${missingHeaders.join(', ')}`);
          return;
        }

        // Get column indices for validation
        const timestampIndex = actualHeaders.indexOf('timestamp');
        const chargeIndex = actualHeaders.indexOf('charge');

        // Validate each row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue; // Skip empty lines
          
          const values = line.split(',').map(v => v.trim());
          
          // Check if row has correct number of columns
          if (values.length !== expectedHeaders.length) {
            reject(`❌ Row ${i} has incorrect number of columns`);
            return;
          }

          // Validate timestamp format more flexibly
          const timestamp = values[timestampIndex];
          try {
            // Split into date and time parts, handling both space and 'T' separators
            const [datePart, timePart] = timestamp.split(/[\sT]/);
            
            // Handle different date separators (/ or -)
            const dateParts = datePart.split(/[-\/]/);
            const timeParts = timePart.split(':');
            
            if (dateParts.length !== 3 || timeParts.length < 2) {
              throw new Error('Invalid format');
            }

            // Extract date parts - support both d/m/y and y/m/d formats
            let day, month, year;
            if (dateParts[0].length === 4) {
              // y/m/d format
              [year, month, day] = dateParts;
              // Convert year to yy format if it's yyyy
              year = year.length === 4 ? year.slice(2) : year;
            } else {
              // d/m/y format
              [day, month, year] = dateParts;
              // Convert year to yy format if it's yyyy
              year = year.length === 4 ? year.slice(2) : year;
            }

            const [hour, minute] = timeParts;
            
            // Convert to numbers and do basic range validation
            const d = parseInt(day), m = parseInt(month), y = parseInt(year);
            const h = parseInt(hour), min = parseInt(minute);
            
            if (isNaN(d) || isNaN(m) || isNaN(y) || isNaN(h) || isNaN(min) ||
                d < 1 || d > 31 || m < 1 || m > 12 ||
                h < 0 || h > 23 || min < 0 || min > 59) {
              throw new Error('Invalid date values');
            }
          } catch (e) {
            reject(`❌ Invalid timestamp in row ${i}. Expected format: d/m/yy HH:MM or yyyy-mm-dd HH:MM`);
            return;
          }

          // Validate charge is a valid number
          const charge = values[chargeIndex];
          if (isNaN(parseFloat(charge)) || !isFinite(charge)) {
            reject(`❌ Invalid charge value in row ${i}. Must be a number`);
            return;
          }
        }
        
        resolve(true);
      };
      
      reader.onerror = () => reject('❌ Error reading file');
      reader.readAsText(file);
    });
  };

  const preprocessCSV = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target.result;
          const lines = text.split('\n').filter(line => line.trim());
          
          // Get header and find timestamp index
          const header = lines[0].trim();
          const headers = header.split(',').map(h => h.trim());
          const timestampIndex = headers.findIndex(h => h.toLowerCase() === 'timestamp');
          
          // Process the CSV content
          const processedLines = lines.map((line, index) => {
            if (index === 0) return line; // Return header as is
            
            const values = line.split(',').map(v => v.trim());
            if (values.length !== headers.length) return line; // Return invalid lines as is
            
            try {
              // Convert timestamp from "d/m/yy HH:MM" to "YYYY-MM-DD HH:mm:ss"
              const timestamp = values[timestampIndex];
              const [datePart, timePart] = timestamp.split(' ');
              const [day, month, year] = datePart.split('/');
              
              // Convert 2-digit year to 4-digit year (assuming 20xx)
              const fullYear = year.length === 2 ? `20${year}` : year;
              
              // Create the new timestamp in the required format
              const formattedDate = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              const formattedTime = `${timePart}:00`; // Add seconds
              values[timestampIndex] = `${formattedDate} ${formattedTime}`;
              
              return values.join(',');
            } catch (e) {
              return line; // Return original line if conversion fails
            }
          });
          
          // Create a new Blob with the processed content
          const processedContent = processedLines.join('\n');
          const processedBlob = new Blob([processedContent], { type: 'text/csv' });
          
          // Create a File object from the Blob
          const processedFile = new File([processedBlob], file.name, { type: 'text/csv' });
          resolve(processedFile);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('❌ Invalid format. Format must be CSV');
      }
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        alert('❌ Invalid format. Format must be CSV');
      }
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      alert('❌ Please select a file first');
      return;
    }

    try {
      // First validate the CSV content
      await validateCSVContent(selectedFile);
      
      // Then preprocess the file to convert timestamps
      const processedFile = await preprocessCSV(selectedFile);

      // Create FormData with the processed file
      const formData = new FormData();
      formData.append('file', processedFile);

      const response = await api.post('/admin/addpasses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('Upload response:', response.data);
      setUploadSuccess(true);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = typeof error === 'string' 
        ? error 
        : error.response?.data?.info || error.response?.data?.message || 'Error uploading file';
      alert(errorMessage);
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
              className={`mt-4 flex flex-col items-center gap-6 rounded-[16px] border-2 border-dashed ${
                isDragging ? 'border-[#2D7EFF] bg-[#4A4A9A]/90' : 'border-gray-900_75 bg-[#4A4A9A]'
              } px-8 py-12 shadow-xs cursor-pointer transition-all duration-200 hover:border-[#2D7EFF] w-[300px] h-[354px] mx-auto md:w-full md:h-[300px]`}
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
                className="h-20 w-20 object-contain"
              />

              <div className="flex flex-col items-center gap-2">
                <Heading
                  size="headingmd"
                  as="h1"
                  className="text-2xl md:text-3xl font-semibold text-white text-center"
                >
                  {selectedFile ? selectedFile.name : "Drag and drop or click here"}
                </Heading>
                <Heading 
                  size="headingxs" 
                  as="h2" 
                  className="text-lg md:text-xl font-semibold text-white text-center"
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