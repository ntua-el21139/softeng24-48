import { Heading, Img } from "components/ui";
import React from "react";

export default function ImportTollDataColumn({
  importIcon = "images/img_icloud_and_arrow_up_fill.svg",
  importTitle = "Import Toll Data",
  ...props
}) {
  return (
    <div
      {...props}
      className={`${props.className} flex flex-col justify-center h-[15.13rem] w-[24%] md:w-full md:h-auto px-[1.88rem] py-[2.13rem] sm:p-[1.25rem] bg-cover bg-no-repeat`}
    >
      <div className="flex flex-col items-center gap-[2.25rem] self-stretch">
        <Img
          src={importIcon}
          alt="Import Toll"
          className="mx-[1.50rem] h-[6.25rem] w-full"
        />
        <Heading
          as="h4"
          className="text-[1.50rem] font-bold tracking-[0.00rem] !text-gray-100_01"
        >
          {importTitle}
        </Heading>
      </div>
    </div>
  );
}