import { Helmet } from "react-helmet";
import Home1Column from "./Home1Column";
import { Heading, Menubar, MenubarContent, MenubarMenu, MenubarTrigger, Img } from "components/ui";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home1Page() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col bg-gradient">
        {/* Header Section */}
        <div className="w-[1440px] h-[70px] bg-[#01011F] mx-auto">
          <div className="flex items-center justify-between h-full px-8">
            <Heading as="h4" className="text-[1.50rem] font-semibold text-white md:text-[1.38rem]">
              Welcome Back: Attiki Odos
            </Heading>

            <div 
              className="text-[1.25rem] font-semibold text-white cursor-pointer hover:text-gray-300 transition-colors"
              onClick={handleLogout}
            >
              Log Out
            </div>
          </div>
        </div>

        {/* Center Logo */}
        <div className="flex justify-center items-center py-2 mt-8">
          <img 
            src="/images/logo.png" 
            alt="InterToll" 
            className="w-[300px] h-[124px] object-contain"
          />
        </div>

        {/* Main Content */}
        <Home1Column />
      </div>
    </>
  );
}