import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import PdfPage from "./Components/PdfPage";

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [serverPdfFile, setServerPdfFile] = useState<string | null>(null);

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type !== "application/pdf") {
        alert("valid only pdf!");
        return;
      }
      setPdfFile(file);
    }
  };

  useEffect(() => {
    if (!pdfFile) return;

    const formData = new FormData();
    formData.append("file", pdfFile);
    try {
      axios
        .post(`${import.meta.env.VITE_BACKEND}/uploadpdf`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          console.log(res.data.filePath)
          setServerPdfFile(res.data.filePath);
        });
    } catch (error) {
      console.error("error while uploading pdf", error);
    }
  }, [pdfFile]);

  return (
<>
    <div className="h-screen flex items-center justify-center bg-gray-900">
      {!serverPdfFile ? (
        <div className="space-y-6 px-6 w-full max-w-lg text-center">
          <h1 className="font-extrabold text-3xl sm:text-5xl text-red-500 drop-shadow-lg">
            Online PDF Extraction
          </h1>
          <p className="text-white text-base sm:text-lg mt-3">
            Instantly extract the pages you need from your PDF.
          </p>
          <input
            id="fileupload"
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
            required
          />
          <button
            className="bg-red-600 hover:bg-red-700 text-white text-sm sm:text-lg px-6 py-3 rounded-lg mt-5 shadow-md transition-transform transform hover:scale-105"
            onClick={handleButtonClick}
          >
            Upload PDF
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full p-6">
          <h2 className="text-xl text-white font-semibold mb-4">Preview & Extract</h2>
          <div className="border border-gray-700 p-4 rounded-lg bg-gray-800 shadow-lg">
            <PdfPage pdfPath={serverPdfFile} />
          </div>
        </div>
      )}
    </div>
</>

  );
};

export default App;
