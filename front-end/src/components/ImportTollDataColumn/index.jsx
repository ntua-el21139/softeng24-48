import { Heading, Img } from "components/ui";
import React from "react";

export default function ImportTollDataColumn({
  importIcon = "images/img_icloud_and_arrow_up_fill.svg",
  importTitle = "Import Toll Data",
  iconSize = "h-24 w-24",
  ...props
}) {
  return (
    <div
      {...props}
      className={`${props.className} flex flex-col h-[238px] w-[226px] px-6 py-8 bg-[#4A4A9A] rounded-[16px] hover:scale-105 transition-transform shadow-lg relative`}
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
            className="text-xl font-medium tracking-[0.00rem] text-white text-center"
          >
            {importTitle}
          </Heading>
        </div>
      </div>
    </div>
  );
}