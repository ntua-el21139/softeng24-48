import { Heading, Img } from "components/ui";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ImportTollDataColumn({
  importIcon = "images/img_icloud_and_arrow_up_fill.svg",
  importTitle = "Import Toll Data",
  iconSize = "h-24 w-24",
  ...props
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (importTitle === "Import Toll Data") {
      navigate('/importtolldata');
    } else if (importTitle === "View Debts") {
      navigate('/viewdebts');
    } else if (importTitle === "Statistics") {
      navigate('/statistics');
    } else if (importTitle === "Interactive Map") {
      navigate('/interactivemap');
    }
  };

  return (
    <div
      {...props}
      onClick={handleClick}
      className={`${props.className} flex flex-col h-auto min-h-[238px] w-full max-w-[226px] px-4 md:px-6 py-6 md:py-8 bg-[#4A4A9A] rounded-[16px] hover:scale-105 transition-transform shadow-lg relative cursor-pointer`}
    >
      <div className="flex flex-col items-center h-full">
        <div className="flex-1 flex items-center">
          <Img
            src={importIcon}
            alt="Import Toll"
            className={`${iconSize} object-contain`}
          />
        </div>
        <div>
          <Heading
            as="h4"
            className="text-lg md:text-xl font-medium tracking-[0.00rem] text-white text-center"
          >
            {importTitle}
          </Heading>
        </div>
      </div>
    </div>
  );
}