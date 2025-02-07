import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import { Img } from "components/ui";
import React from "react";

export default function InteractiveMapPage() {
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
          <Img src="images/img_i_3_2.png" alt="I3one" className="h-[13.50rem] w-[42%] object-contain" />
        </div>
      </div>
    </>
  );
}