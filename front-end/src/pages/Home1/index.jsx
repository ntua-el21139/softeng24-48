import { Helmet } from "react-helmet";
import Home1Column from "./Home1Column";
import { Heading, Menubar, MenubarContent, MenubarMenu, MenubarTrigger, Img } from "components/ui";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home1Page() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
    // Navigate to login page
    navigate('/');
  };

  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col bg-gradient">
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