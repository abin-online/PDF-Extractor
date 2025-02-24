import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import SideBar from "./SideBar";
import { FaCircleCheck } from "react-icons/fa6";
import { GrView } from "react-icons/gr";
import {
    FaWindowClose,
    FaChevronCircleRight,
    FaChevronCircleLeft,
} from "react-icons/fa";
import axios from "axios";
import Loader from "./Loader";



interface PdfPageProps {
    pdfPath: string;
}

const PdfPage: React.FC<PdfPageProps> = ({ pdfPath }) => {
    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string[] | null>(null);
    const [generatedPdfLink, setGeneratedPdfLink] = useState<string | null>(null);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState<number>(0);
    const [totalPdfPage, setTotalPdfPage] = useState(0);
    const generatePdf = (selectedPages: string) => {
        axios
            .post(`${import.meta.env.VITE_BACKEND}/generatepdf`, {
                selectedPages,
                pdfPath,
            })
            .then((res) => {
                if (res.data) {
                    setGeneratedPdfLink(res.data.generatedDownloadLink);
                }
            });
    };

    const inputChange = (input: string) => {
        const numArr = input.split(",");
        setSelectedPages([]);
        for (const str of numArr) {
            if (str.includes("-")) {
                const arr = str.split("-");
                for (let i = Number(arr[0]); i <= Number(arr[1]); i++) {
                    setSelectedPages((prevSelectedPages) => [...prevSelectedPages, i]);
                }
            } else {
                setSelectedPages((prevSelectedPages) => [
                    ...prevSelectedPages,
                    Number(str),
                ]);
            }
        }
    };

    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleImageSelection = (image: string, index: number) => {
        setSelectedImage((prev) => {
            if (prev?.includes(image)) {
                return prev.filter((img) => img !== image)
            } else {
                return [...(prev || []), image]
            }
        }
        );

        setSelectedPages((prev) =>
            prev.includes(index + 1)
                ? prev.filter((num) => num !== index + 1)
                : [...prev, index + 1]
        );
    };

    useEffect(() => {
        const loadPdf = async () => {
            try {
                console.log(`PDF.js version: ${pdfjsLib.version}`);
                pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.js`;
                console.log(pdfPath)
                console.log(`Worker source: ${pdfjsLib.GlobalWorkerOptions.workerSrc}`);
                const loadingTask = pdfjsLib.getDocument(pdfPath);
                console.log(loadingTask)
                const pdfDoc = await loadingTask.promise;
                console.log(pdfDoc);
                const numPages = pdfDoc.numPages;

                const pageImages = [];
                const pageWidthsArray = [];
                for (let i = 1; i <= numPages; i++) {
                    const page = await pdfDoc.getPage(i);
                    const totalPages = pdfDoc.numPages;
                    setTotalPdfPage(totalPages);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const width = viewport.width;
                    pageWidthsArray.push(width);
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");
                    if (!context) {
                        console.error("Failed to get 2D context");
                        continue;
                    }
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };
                    const renderTask = page.render(renderContext);

                    await renderTask.promise;

                    const imageDataUrl = canvas.toDataURL("image/png");
                    pageImages.push(imageDataUrl);
                }
                setImages(pageImages);
            } catch (error) {
                console.log(error);
            }
        };

        loadPdf();
    }, [pdfPath]);

    return (
<>
<div className="flex flex-col sm:flex-row min-h-screen">

    {/* Selection Panel */}
    <div className="w-full sm:w-3/4 md:w-1/3 overflow-y-auto p-6 flex flex-wrap justify-center bg-gray-900 rounded-lg shadow-lg">
      <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
        Select Pages
      </h1>
      {images && images.length ? (
        <div className="flex gap-4 flex-wrap justify-center">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative cursor-pointer group"
              onClick={() => handleImageSelection(image, index)}
            >
              <img
                className={`w-28 h-36 rounded-lg transition-all duration-300 shadow-md ${
                  selectedPages.includes(index + 1)
                    ? "border-4 border-green-500 scale-105"
                    : "hover:border-4 hover:border-gray-500 hover:scale-105"
                }`}
                src={image}
                alt={`Page ${index + 1}`}
              />
              {selectedPages.includes(index + 1) && (
                <FaCircleCheck
                  color="green"
                  className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full shadow-md"
                />
              )}
              <p className="text-white mt-2 text-sm text-center font-semibold">
                Page {index + 1}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen h-full p-10">
          <Loader />
          <h1 className="text-lg text-white mt-5">Loading Pages...</h1>
        </div>
      )}
    </div>

    {/* Preview Section */}
    <div className="hidden sm:flex sm:w-1/4 md:w-1/2 bg-gray-800 flex-col items-center p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl md:text-3xl font-semibold text-white mb-4">Preview</h1>
      {selectedImage && (
        <div className="flex items-center space-x-5 justify-center p-4">
          {selectedPreviewImage > 0 && (
            <FaChevronCircleLeft
              className="hover:cursor-pointer text-white hover:text-gray-400 transition-all duration-300"
              size={30}
              onClick={() => setSelectedPreviewImage((prev) => prev - 1)}
            />
          )}
          <img
            src={selectedImage[selectedPreviewImage]}
            alt="image preview"
            className="max-h-[60vh] w-auto rounded-lg shadow-lg"
          />
          {selectedImage.length > 1 && selectedPreviewImage + 1 < selectedImage.length && (
            <FaChevronCircleRight
              className="hover:cursor-pointer text-white hover:text-gray-400 transition-all duration-300"
              size={30}
              onClick={() => setSelectedPreviewImage((prev) => prev + 1)}
            />
          )}
        </div>
      )}
    </div>

    {/* Mobile Preview Button */}
    {selectedImage && (
      <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-1/3 bg-red-500 text-white py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg"
        >
          <GrView className="text-xl" />
          Preview
        </button>
      </div>
    )}

    {/* Modal Preview */}
    {isModalOpen && selectedImage && (
      <div className="fixed inset-0 z-[100] bg-black bg-opacity-90 flex items-center justify-center p-4 sm:hidden">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors z-[110]"
        >
          <FaWindowClose className="text-red-500" size={30} />
        </button>
        <div className="relative w-full max-w-md flex items-center justify-center">
          {selectedPreviewImage > 0 && (
            <FaChevronCircleLeft
              className="absolute left-4 hover:cursor-pointer text-white hover:text-gray-400 transition-all duration-300 z-[110]"
              size={30}
              onClick={() => setSelectedPreviewImage((prev) => prev - 1)}
            />
          )}
          <img
            src={selectedImage[selectedPreviewImage]}
            alt="Full Preview"
            className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
          {selectedImage.length > 1 && selectedPreviewImage + 1 < selectedImage.length && (
            <FaChevronCircleRight
              className="absolute right-4 hover:cursor-pointer text-white hover:text-gray-400 transition-all duration-300 z-[110]"
              size={30}
              onClick={() => setSelectedPreviewImage((prev) => prev + 1)}
            />
          )}
        </div>
      </div>
    )}

    {/* Sidebar */}
    <SideBar
      onGeneratePDF={generatePdf}
      onPageSelect={selectedPages}
      downloadLink={generatedPdfLink}
      onInputChange={inputChange}
      totalPages={totalPdfPage}
    />
  </div>
</>

    );
};

export default PdfPage;
