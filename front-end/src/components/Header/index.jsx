import {
    Heading,
    Menubar,
    MenubarContent,
    MenubarMenu,
    MenubarTrigger
  } from "components/ui";
  import React from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  
  export default function Header({ ...props }) {
    const navigate = useNavigate();
    const location = useLocation();
  
    const handleHome = () => {
      navigate('/home1');
    };

    const handleLogout = () => {
      navigate('/');
    };

    const getTextColor = (path) => {
      return location.pathname === path 
        ? "text-[#2D7EFF]" 
        : "text-white hover:text-gray-300 transition-colors cursor-pointer";
    };

    const handleNavigation = (path) => {
      navigate(path);
    };
  
    return (
      <div
        {...props}
        className={`${props.className} w-[1440px] h-[70px] bg-[#01011F] mx-auto`}
      >
        <div className="flex items-center justify-between h-full px-8">
          <div className="flex self-center">
            <Menubar className="flex flex-wrap gap-[2.13rem] border-none">
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className={`text-[1.50rem] font-semibold ${getTextColor('/home1')} md:text-[1.38rem]`}
                    onClick={handleHome}
                  >
                    Home
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className={`text-[1.50rem] font-semibold ${getTextColor('/importtolldata')} md:text-[1.38rem]`}
                    onClick={() => handleNavigation('/importtolldata')}
                  >
                    Import Toll Data
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className={`text-[1.50rem] font-semibold ${getTextColor('/viewdebts')} md:text-[1.38rem]`}
                    onClick={() => handleNavigation('/viewdebts')}
                  >
                    View Debts
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className={`text-[1.50rem] font-semibold ${getTextColor('/statistics')} md:text-[1.38rem]`}
                    onClick={() => handleNavigation('/statistics')}
                  >
                    Statistics
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
  
              <MenubarMenu>
                <MenubarTrigger>
                  <Heading
                    as="h4"
                    className={`text-[1.50rem] font-semibold ${getTextColor('/interactivemap')} md:text-[1.38rem]`}
                    onClick={() => handleNavigation('/interactivemap')}
                  >
                    Interactive Map
                  </Heading>
                </MenubarTrigger>
              </MenubarMenu>
            </Menubar>
          </div>
  
          <div className="text-[1.25rem] font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
               onClick={handleLogout}>
            Log Out
          </div>
        </div>
      </div>
    );
  }