import {
    Heading,
    Menubar,
    MenubarContent,
    MenubarMenu,
    MenubarTrigger
  } from "components/ui";
  import React, { useEffect, useState } from "react";
  import { useNavigate, useLocation } from "react-router-dom";
  
  export default function Header({ ...props }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [username, setUsername] = useState('User');

    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      setUsername(userData?.data?.username || 'User');
    }, []);
  
    const handleHome = () => {
      navigate('/home1');
    };

    const handleLogout = () => {
      localStorage.removeItem('userData');
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
        className="fixed top-0 left-0 right-0 w-full bg-[#01011F] z-50"
      >
        <div className="max-w-[1440px] mx-auto">
          {location.pathname === '/home1' ? (
            // Welcome message for home page - updated to match navigation menu height
            <div className="flex items-center justify-between h-[70px] px-4 md:px-8">
              <Heading as="h4" className="text-base md:text-[1.50rem] font-semibold text-white">
                Welcome Back: {username}
              </Heading>
              <div 
                className="text-base md:text-[1.25rem] font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
                onClick={handleLogout}
              >
                Log Out
              </div>
            </div>
          ) : (
            // Navigation menu for other pages
            <div className="flex flex-col md:flex-row items-center justify-between h-[70px] px-4 md:px-8">
              <div className="w-full md:w-auto overflow-x-auto scrollbar-hide">
                <Menubar className="flex flex-nowrap min-w-max gap-4 md:gap-[2.13rem] border-none">
                  <MenubarMenu>
                    <MenubarTrigger>
                      <Heading
                        as="h4"
                        className={`text-base md:text-[1.50rem] font-semibold ${getTextColor('/home1')} whitespace-nowrap`}
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
                        className={`text-base md:text-[1.50rem] font-semibold ${getTextColor('/importtolldata')} whitespace-nowrap`}
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
                        className={`text-base md:text-[1.50rem] font-semibold ${getTextColor('/viewdebts')} whitespace-nowrap`}
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
                        className={`text-base md:text-[1.50rem] font-semibold ${getTextColor('/statistics')} whitespace-nowrap`}
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
                        className={`text-base md:text-[1.50rem] font-semibold ${getTextColor('/interactivemap')} whitespace-nowrap`}
                        onClick={() => handleNavigation('/interactivemap')}
                      >
                        Interactive Map
                      </Heading>
                    </MenubarTrigger>
                  </MenubarMenu>
                </Menubar>
              </div>
  
              <div className="text-base md:text-[1.25rem] font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors whitespace-nowrap mt-4 md:mt-0"
                   onClick={handleLogout}>
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }