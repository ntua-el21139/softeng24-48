import React from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Img, Button, Input } from "../../components/ui";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/home1');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <Helmet>
        <title>Login - InterToll</title>
        <meta name="description" content="Login to InterToll" />
      </Helmet>

      <div className="flex flex-1 items-center justify-between px-10 z-10">
        {/* Left side - Logo and Tagline */}
        <div className="flex flex-col items-start ml-[126px] -mt-48">
          <img 
            src="/images/logo.png" 
            alt="InterToll" 
            className="w-[400px] h-[165px] object-contain -mb-3"
          />
          <p className="text-lg text-white ml-8">Connecting Highways, Simplifying Payments</p>
        </div>

        {/* Right side - Login Form */}
        <div className="w-96 -mt-20 -ml-20">
          <h1 className="mb-8 text-3xl font-bold text-white">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Username"
              className="w-full rounded-[55px] bg-white/5 backdrop-blur-sm px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Input
              type="password"
              placeholder="Password"
              className="w-full rounded-[55px] bg-white/5 backdrop-blur-sm px-6 py-4 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                className="w-32 rounded-[55px] bg-[#2D7EFF] py-2 text-white text-base font-medium shadow-lg hover:bg-[#2D7EFF]/90 focus:outline-none transition-colors"
              >
                Continue
              </Button>
            </div>
            <div className="text-center">
              <a href="#" className="text-sm text-white hover:text-blue-400">Partner with Us</a>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Highway Illustration */}
      <div className="absolute bottom-0 left-0 right-0">
        <img 
          src="/images/Group.svg" 
          alt="Highway" 
          className="w-full"
          style={{ height: '280px', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}