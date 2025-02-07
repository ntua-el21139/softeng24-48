import {
    Heading,
    Menubar,
    MenubarContent,
    MenubarMenu,
    MenubarTrigger
  } from "components/ui";
  import React from "react";
  
  export default function Header({ ...props }) {
    return (
      <div
        {...props}
        className={`${props.className} flex justify-center items-center py-[1.63rem] sm:py-[1.25rem] bg-black-900`}
      >
        <div className="mx-auto flex w-full max-w-[85.50rem] items-start justify-between gap-[1.25rem] md:flex-col md:px-[1.25rem]">
          <div className="flex self-center">
            <Menubar className="flex flex-wrap gap-[2.13rem] border-none">
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className="cursor-pointer text-[1.50rem] font-semibold !text-gray-100_02 hover:!text-light_blue-a700 md:text-[1.38rem]"
                  >
                    Home
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className="text-[1.50rem] font-semibold !text-light_blue-a700 md:text-[1.38rem]"
                  >
                    Import Toll Data
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className="cursor-pointer text-[1.50rem] font-semibold !text-gray-100_02 hover:!text-light_blue-a700 md:text-[1.38rem]"
                  >
                    View Debts
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className="cursor-pointer text-[1.50rem] font-semibold !text-gray-100_02 hover:!text-light_blue-a700 md:text-[1.38rem]"
                  >
                    Statistics
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className="cursor-pointer text-[1.50rem] font-semibold !text-gray-100_02 hover:!text-light_blue-a700 md:text-[1.38rem]"
                  >
                    Interactive Map
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
            </Menubar>
          </div>
  
          <Heading
            size="headingxs"
            as="h5"
            className="text-[1.25rem] font-semibold !text-gray-100_02"
          >
            Log Out
          </Heading>
        </div>
      </div>
    );
  }