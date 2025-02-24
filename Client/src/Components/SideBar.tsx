import React, { useEffect, useState } from "react";
import { RiFileSettingsLine } from "react-icons/ri"
import { FaWindowClose } from "react-icons/fa";
import { saveAs } from 'file-saver';

interface SideBarProps {
  onPageSelect: number[];
  onGeneratePDF: (selectedPages: string) => void;
  downloadLink: string | null;
  onInputChange: (input:string) => void;
  totalPages:number
}

const SideBar: React.FC<SideBarProps> = ({
  onPageSelect,
  onGeneratePDF,
  downloadLink,
  onInputChange,
  totalPages
}) => {
  const [pageValue, setPageValue] = useState<string>("");
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  const handleGeneratePDF = (pageValue: string) => {
    onGeneratePDF(pageValue)
  };

  const handleDownload = () => {
    if (downloadLink) {
      saveAs(downloadLink,`extractedPdf${new Date()}`)
    } else {
      console.error("Download link is not available.");
    }
  };
  

  const handleInputChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const userSelectedPages = val.split(/[, -]+/) 
    for(const num of userSelectedPages){
      if(Number(num) > totalPages ){        
        alert('exceeded the max page')
        return
      }
    }
    setPageValue(val)
    onInputChange(val)
  }

  useEffect(() => {
    const sortedPages = [...onPageSelect].sort((a, b) => a - b);
    if (sortedPages.length === 0) {
      setPageValue("");
      return;
    }
    const ranges = [];
    let start = sortedPages[0];
    let end = start;
    for (let i = 1; i < sortedPages.length; i++) {
      if (sortedPages[i] === end + 1) {
        end = sortedPages[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = sortedPages[i];
        end = start;
      }
    }

    ranges.push(start === end ? `${start}` : `${start}-${end}`);

    setPageValue(ranges.join(", "));
  }, [onPageSelect]);

  return (
<>
    <div className="sm:hidden">
      <button 
        onClick={() => setIsFullScreenOpen(true)}
        className="
          bg-red-500 
          text-white 
          p-4
          rounded-full 
          fixed 
          bottom-4 
          right-4 
          z-50 
          shadow-lg 
          hover:bg-red-600 
          transition-all 
          duration-300
        "
      >
        <RiFileSettingsLine className="text-3xl"/>
      </button>
    </div>

    {isFullScreenOpen && (
      <div 
        className="
          fixed 
          inset-0 
          z-[100] 
          bg-white 
          overflow-y-auto 
          animate-fade-in 
          sm:hidden
          p-6
        "
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-gray-800 text-xl font-semibold">
            PDF Options
          </h3>
          <button 
            onClick={() => setIsFullScreenOpen(false)}
            className="
              text-gray-700 
              hover:text-red-500 
              transition-all
              duration-300
            "
          >
            <FaWindowClose size={24}/>
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder={`Eg: 1-${totalPages}, 20`}
            value={pageValue}
            onChange={handleInputChange}
            className="
              w-full 
              p-4 
              text-base 
              border 
              border-gray-300 
              rounded-lg 
              focus:outline-none 
              focus:ring-2 
              focus:ring-red-500
              transition-all
              duration-300
            "
          />
          <p className="text-sm text-gray-500 mt-2 text-center">
            Total Pages: {totalPages}
          </p>
        </div>

        <div className="space-y-4">
          {!downloadLink ? (
            <button
              onClick={()=>handleGeneratePDF(pageValue)}
              className="
                flex 
                items-center 
                justify-center 
                gap-3 
                bg-red-500 
                text-white 
                py-4 
                rounded-lg 
                font-medium 
                w-full 
                transition-all 
                duration-300 
                hover:bg-red-600
              "
            >
              Generate PDF
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="
                flex 
                items-center 
                justify-center 
                gap-3 
                bg-green-500 
                text-white 
                py-4 
                rounded-lg 
                font-medium 
                w-full 
                transition-all 
                duration-300 
                hover:bg-green-600
              "
            >
              Download PDF
            </button>
          )}
        </div>
      </div>
    )}

    <div className="hidden sm:block w-full max-w-sm bg-gray-100 p-6 shadow-lg rounded-lg">
      <h3 className="text-center text-gray-800 text-lg sm:text-xl font-semibold mb-4">
        Choose Pages
      </h3>

      <div className="mb-5">
        <input
          type="text"
          placeholder={`Eg: 1-${totalPages}, 20`}
          value={pageValue}
          onChange={handleInputChange}
          className="
            w-full 
            p-3 
            text-sm 
            sm:text-base 
            border 
            border-gray-300 
            rounded-lg 
            focus:outline-none 
            focus:ring-2 
            focus:ring-red-500
            transition-all
            duration-300
          "
        />
        <p className="text-xs text-gray-500 mt-2">
          Total Pages: {totalPages}
        </p>
      </div>

      <div className="text-center">
        {!downloadLink ? (
          <button
            onClick={()=>handleGeneratePDF(pageValue)}
            className="
              flex 
              items-center 
              justify-center 
              gap-2 
              bg-red-500 
              text-white 
              py-2 
              px-4 
              sm:py-3 
              sm:px-6 
              rounded-lg 
              font-medium 
              w-full 
              transition-all 
              duration-300 
              hover:bg-red-600
            "
          >
            Generate PDF
          </button>
        ) : (
          <button
            onClick={handleDownload}
            className="
              flex 
              items-center 
              justify-center 
              gap-2 
              bg-green-500 
              text-white 
              py-2 
              px-4 
              sm:py-3 
              sm:px-6 
              rounded-lg 
              font-medium 
              w-full 
              transition-all 
              duration-300 
              hover:bg-green-600
            "
          >
            Download PDF
          </button>
        )}
      </div>
    </div>
  </>
  );
};

export default SideBar;
