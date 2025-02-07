import { Helmet } from "react-helmet";
import Home1Column from "./Home1Column";
import { Heading, Menubar, MenubarContent, MenubarMenu, MenubarTrigger } from "components/ui";
import React from "react";

export default function Home1Page() {
  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col gap-[2.38rem] bg-gradient">
        {/* Header Section */}
        <div className="flex items-center justify-center bg-black-900 py-[1.75rem] sm:py-[1.25rem]">
          <div className="mx-auto flex w-full max-w-[85.50rem] items-center justify-between gap-[1.25rem] md:px-[1.25rem]">
            <Heading as="h4" className="text-[1.50rem] font-semibold !text-gray-100_02 md:text-[1.38rem]">
              Welcome Back: Attiki Odos
            </Heading>

            <Menubar className="flex flex-wrap gap-[0.63rem] border-none">
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading size="headingxs" as="h5" className="text-[1.25rem] font-semibold !text-gray-100_02">
                    Log
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading size="headingxs" as="h5" className="text-[1.25rem] font-semibold !text-gray-100_02">
                    Out
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>

        {/* Main Content */}
        <Home1Column />
      </div>
    </>
  );
}