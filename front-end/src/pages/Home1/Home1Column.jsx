import ImportTollDataColumn from "../../components/ImportTollDataColumn";
import { Img } from "components/ui";
import React, { Suspense } from "react";

const data = [
  { 
    importIcon: "images/img_icloud_and_arrow_up_fill.svg", 
    importTitle: "Import Toll Data",
    iconSize: "h-24 w-24"
  },
  { 
    importIcon: "images/img_creditcard_tria.svg", 
    importTitle: "View Debts", 
    iconSize: "h-28 w-28"
  },
  { 
    importIcon: "images/img_group.svg", 
    importTitle: "Statistics",
    iconSize: "h-20 w-20 mt-2"
  },
  { 
    importIcon: "images/img_group_indigo_50.svg", 
    importTitle: "Interactive Map",
    iconSize: "h-24 w-24"
  }
];

export default function Home1Column() {
  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        <div className="flex w-full justify-center gap-16 mt-16">
          <Suspense fallback={<div>Loading feed...</div>}>
            {data.map((d, index) => (
              <ImportTollDataColumn 
                {...d} 
                key={`home-${index}`} 
                className="transform hover:scale-105 transition-duration-300"
              />
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  );
}