import { Button, Heading, Img } from "components/ui";
import React from "react";

export default function StatisticsColumn() {
  return (
    <div className="mb-[0.25rem] flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        
        {/* Header Image */}
        <Img src="images/img_i_3_2.png" alt="I3one" className="h-[13.50rem] w-[42%] object-contain" />

        {/* Selection Controls */}
        <div className="mt-[1.00rem] flex w-[86%] justify-center md:w-full md:flex-col">
          
          {/* Data Selection */}
          <div className="flex items-start gap-[0.38rem] rounded-[16px] border border-solid border-gray-900_75 bg-gray-100_5b p-[0.50rem] shadow-xs sm:flex-col">
            <Heading
              size="headingmd"
              as="h1"
              className="self-center text-[2.00rem] font-semibold md:text-[1.88rem] sm:text-[1.75rem]"
            >
              Select the data to be displayed
            </Heading>
            <Img src="images/img_arrow_right.svg" alt="Arrowright" className="mt-[0.50rem] h-[1.50rem] sm:w-full" />
          </div>

          {/* Time Period Selection */}
          <div className="relative h-[4.13rem] w-[48%] px-[0.63rem] md:w-full">
            <div className="absolute inset-0 m-auto h-[3.75rem] flex-1 rounded-[16px] border border-solid border-gray-900_75 bg-gray-100_5b shadow-xs" />
            <div className="absolute inset-0 m-auto flex h-max flex-1 items-start justify-center gap-[0.38rem] px-[0.88rem] sm:relative sm:flex-col">
              <Heading
                size="headingmd"
                as="h2"
                className="self-center text-[2.00rem] font-semibold md:text-[1.88rem] sm:text-[1.75rem]"
              >
                Select the desired time period
              </Heading>
              <Img
                src="images/img_arrow_right.svg"
                alt="Arrowright"
                className="mt-[0.50rem] h-[1.50rem] sm:mt-0 sm:w-full"
              />
            </div>
          </div>
        </div>

        {/* Statistics Display */}
        <div className="ml-[13.13rem] mr-[10.25rem] mt-[2.38rem] flex w-[80%] flex-col items-center gap-[2.38rem] md:mx-0 md:w-full">
          <div className="flex h-[25.38rem] items-start justify-center self-stretch bg-[url(/public/images/img_group_1_gray_100.svg)] bg-cover bg-no-repeat px-[3.50rem] py-[9.63rem] md:h-auto md:p-[1.25rem]">
            <Heading
              size="headingmd"
              as="h3"
              className="mb-[3.00rem] text-[2.00rem] font-semibold md:text-[1.88rem] sm:text-[1.75rem]"
            >
              Relevant statistics will be shown here.
            </Heading>
          </div>

          {/* Download Button */}
          <Button
            shape="round"
            className="w-full min-w-[15.88rem] max-w-[15.88rem] rounded-[24px] px-[2.13rem] sm:px-[1.25rem]"
          >
            Download the chart
          </Button>
        </div>
      </div>
    </div>
  );
}