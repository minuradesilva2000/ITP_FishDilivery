import React from "react";

const LoadingScreen = ({ message }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-lg">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
