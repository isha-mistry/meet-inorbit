import Image from "next/image";
import React from "react";
import logo from "@/assets/images/daos/CCLogo2.png";

function MeetingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50/50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm py-4 px-4 md:px-6 w-full animate-fade-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={logo}
              alt="logo"
              className="h-10 w-10 md:h-12 md:w-12 object-contain animate-float"
            />
            <div className="text-2xl md:text-3xl font-semibold tracking-wide font-quanty animate-fade-in-right">
              <span className="text-black">Chora</span>
              <span className="text-blue-600">Club</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 font-poppins">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left space-y-4 animate-fade-in-left">
            <h1
              className="text-3xl md:text-4xl font-bold text-gray-800 
              bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text
              animate-gradient-x"
            >
              Welcome to Chora Club
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0 animate-fade-in-up animate-delay-300">
              Join us for our regular community meetings and discussions.
              Connect, learn, and grow together in our vibrant community.
            </p>
          </div>

          {/* Image Section */}
          <div className="flex justify-center md:justify-end animate-fade-in-right">
            <Image
              src={logo}
              alt="Chora Club Community"
              className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-full shadow-lg transition-transform duration-300 animate-float"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm py-4 px-4 md:px-6 text-center text-gray-500 text-sm shadow-t animate-fade-in-up font-poppins">
        <div className="max-w-7xl mx-auto">
          © {new Date().getFullYear()} Chora Club. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default MeetingLandingPage;
