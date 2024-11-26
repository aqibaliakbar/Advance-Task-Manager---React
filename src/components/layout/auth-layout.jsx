import React from "react";
import { Link } from "react-router-dom";

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Left side - Branding */}
      <div className="hidden sm:flex sm:w-1/2 bg-primary p-8 text-white flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-4">Your App Name</h1>
          <p className="text-lg opacity-90">Your app's tagline goes here</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm opacity-75">
            © 2024 Your Company. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-sm hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
