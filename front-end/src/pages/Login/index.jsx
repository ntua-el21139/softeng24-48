import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Img, Button, Input } from "../../components/ui";
import api from '../../lib/axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/extra/fetchUser/${username}/${password}`);
      
      if (response.data) {
        localStorage.setItem('userData', JSON.stringify(response.data));
        navigate('/home1');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setError('Invalid username or password');
        } else {
          setError('Login failed. Please try again.');
        }
      } else if (error.request) {
        setError('Network error. Please check your connection.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
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
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-[55px] bg-white/5 backdrop-blur-sm px-6 py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[55px] bg-white/5 backdrop-blur-sm px-6 py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white focus:outline-none"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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