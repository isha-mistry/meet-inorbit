import Image from "next/image";
import React from "react";
import logo from "@/assets/images/logo.svg";

function MeetingLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/80 backdrop-blur-sm shadow-lg py-4 px-4 md:px-6 w-full animate-fade-in-down">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={logo}
              alt="logo"
              className="h-10 w-10 md:h-12 md:w-12 object-contain animate-float"
            />
            <div className="text-gray-200 text-2xl md:text-3xl font-semibold tracking-wide font-tektur animate-fade-in-right">
              Xcan
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow px-4 py-12 font-poppins">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="text-center md:text-left space-y-6 animate-fade-in-left">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 animate-gradient-x">
                Welcome to Xcan Meet
              </h1>
              <p className="text-lg text-gray-300 max-w-md mx-auto md:mx-0 animate-fade-in-up animate-delay-300">
                Join our vibrant community for regular expert sessions, lectures, and collaborative sessions.
                Connect, learn, and grow together in our dynamic ecosystem.
              </p>
            </div>
            <div className="flex justify-center md:justify-end animate-fade-in-right">
              <Image
                src={logo}
                alt="Xcan Community"
                className="w-64 h-64 md:w-80 md:h-80 object-contain rounded-full shadow-lg transition-transform duration-300 animate-float"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Lectures</h3>
              <p className="text-gray-300">
                Join our weekly community meetings where we discuss updates, share insights, and plan future initiatives.
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Expert Sessions</h3>
              <p className="text-gray-300">
                Get direct access to our team during dedicated lectures for personalized support and guidance.
              </p>
            </div>
            <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Interactive Features</h3>
              <p className="text-gray-300">
                Take part in a highly engaging environment with features like react with emojis in real time, raise their hand to speak, and engage in Q&A segments.
              </p>
            </div>
          </div>

          {/* Meeting Schedule Section */}
          {/* <div className="bg-gray-800/50 p-8 rounded-xl backdrop-blur-sm mb-16">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">Upcoming Meetings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Community Call</h3>
                <p className="text-gray-300 mb-2">Every Wednesday, 2:00 PM UTC</p>
                <p className="text-sm text-gray-400">Join us for our weekly community update and discussion.</p>
              </div>
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Lectures</h3>
                <p className="text-gray-300 mb-2">Every Friday, 3:00 PM UTC</p>
                <p className="text-sm text-gray-400">Get your questions answered and receive direct support.</p>
              </div>
            </div>
          </div> */}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/80 backdrop-blur-sm py-6 px-4 md:px-6 text-center text-gray-400 text-sm shadow-t animate-fade-in-up font-poppins">
        <div className="max-w-7xl mx-auto">
          © {new Date().getFullYear()} Xcan. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default MeetingLandingPage;
