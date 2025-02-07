import { Button, Heading, Img } from "components/ui";
import React from "react";

export default function StatisticsColumn() {
  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        {/* Selection Controls */}
        <div className="flex gap-4 justify-between w-[600px]">
          {/* Data Selection */}
          <button className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-[298px] h-[48px]">
            <span className="text-base font-medium whitespace-nowrap">Select the data to be displayed</span>
            <span className="text-xl ml-2">›</span>
          </button>

          {/* Time Period Selection */}
          <button className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-[298px] h-[48px]">
            <span className="text-base font-medium whitespace-nowrap">Select the desired time period</span>
            <span className="text-xl ml-2">›</span>
          </button>
        </div>

        {/* Statistics Display */}
        <div className="w-[600px] mt-6">
          <div className="flex h-[250px] items-center justify-center bg-[#4A4A9A] rounded-[16px]">
            <span className="text-white text-lg">
              Relevant statistics will be shown here.
            </span>
          </div>

          {/* Download Button */}
          <div className="flex justify-center mt-4">
            <Button
              shape="round"
              className="bg-[#2D7EFF] text-white px-6 py-2 rounded-full hover:bg-[#2D7EFF]/90 transition-colors"
            >
              Download the chart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}