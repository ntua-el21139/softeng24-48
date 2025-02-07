import ImportTollDataColumn from "../../components/ImportTollDataColumn";
import { Img } from "components/ui";
import React, { Suspense } from "react";

const data = [
  { importIcon: "images/img_icloud_and_arrow_up_fill.svg", importTitle: "Import Toll Data" },
  { importIcon: "images/img_creditcard_tria.svg", importTitle: "View Debts" },
  { importIcon: "images/img_group.svg", importTitle: "Statistics" },
  { importIcon: "images/img_group_indigo_50.svg", importTitle: "Interactive Map" },
];

export default function Home1Column() {
  return (
    <div className="mb-[0.25rem] flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center gap-[7.25rem] px-[3.50rem] md:gap-[5.44rem] md:px-[1.25rem] sm:gap-[3.63rem]">
        <Img src="images/img_i_3_2.png" alt="I3two" className="h-[13.50rem] w-[42%] object-contain" />

        <div className="flex w-[96%] gap-[6.50rem] md:w-full md:flex-col">
          <Suspense fallback={<div>Loading feed...</div>}>
            {data.map((d, index) => (
              <ImportTollDataColumn 
                {...d} 
                key={`home-${index}`} 
                className="bg-[url(/public/images/img_group_1.svg)]" 
              />
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  );
}