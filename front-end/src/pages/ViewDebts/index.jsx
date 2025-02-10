import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import ViewDebtsColumn from "./ViewdebtsColumn";
import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ViewDebtsPage() {
  const navigate = useNavigate();

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

      <div className="flex w-full flex-col items-center bg-gradient min-h-screen">
        {/* Header Section */}
        <Header className="self-stretch" />

        {/* Logo Section */}
        <div className="flex justify-center items-center py-2 mt-8">
          <img 
            src="/images/logo.png" 
            alt="InterToll" 
            className="w-[300px] h-[124px] object-contain"
          />
        </div>

        {/* View Debts Content */}
        <ViewDebtsColumn />
      </div>
    </>
  );
}