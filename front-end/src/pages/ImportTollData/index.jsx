import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { Button, Heading, Img } from "components/ui";
import React from "react";

export default function ImportTollDataPage() {
  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col items-center gap-[2.38rem] bg-gradient">
        {/* Header Section */}
        <Header className="self-stretch" />

        {/* Main Content */}
        <div className="mx-auto mb-[0.25rem] flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
          <div className="flex w-[50%] flex-col items-center md:w-full">
            {/* Image Section */}
            <Img
              src="images/img_i_3_2.png"
              alt="I3one"
              className="mx-[3.25rem] h-[13.50rem] w-full object-cover md:mx-0 md:h-auto"
            />

            {/* Upload Box */}
            <div className="mt-[1.88rem] flex flex-col items-center gap-[1.38rem] self-stretch rounded-[16px] border border-solid border-gray-900_75 bg-gray-100_5b px-[3.50rem] py-[3.63rem] shadow-xs md:p-[1.25rem]">
              <Img
                src="images/img_group_indigo_50_100x114.svg"
                alt="Image"
                className="h-[6.25rem] w-[22%] object-contain"
              />

              <div className="mb-[3.13rem] flex flex-col items-center">
                <Heading
                  size="headingmd"
                  as="h1"
                  className="text-[2.00rem] font-semibold md:text-[1.88rem] sm:text-[1.75rem]"
                >
                  Drag and drop or click here
                </Heading>
                <Heading size="headingxs" as="h2" className="text-[1.25rem] font-semibold">
                  to upload your CSV file
                </Heading>
              </div>
            </div>

            {/* Upload Button */}
            <Button
              shape="round"
              className="mt-[3.13rem] w-full min-w-[15.88rem] max-w-[15.88rem] rounded-[24px] px-[2.13rem] sm:px-[1.25rem]"
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}