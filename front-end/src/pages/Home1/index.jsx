import { Helmet } from "react-helmet";
import Home1Column from "./Home1Column";
import { Heading, Menubar, MenubarContent, MenubarMenu, MenubarTrigger, Img } from "components/ui";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home1Page() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  
  useEffect(() => {
    const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
    setUserData(storedUserData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
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

        {/* Logout Button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Main Content */}
        <Home1Column />
      </div>
    </>
  );
}