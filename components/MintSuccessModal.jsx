'use client';

import React from 'react';

const MintSuccessModal = ({ isOpen, onClose, transactionHash, sbtImage }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Congratulations! 🎉
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your SBT has been successfully minted!
          </p>

          {/* SBT Image */}
          {sbtImage && (
            <div className="mb-6">
              <img 
                src={sbtImage} 
                alt="Minted SBT" 
                className="mx-auto rounded-lg shadow-lg max-w-[200px]"
              />
            </div>
          )}

          {/* Transaction Details */}
          {transactionHash && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Transaction Hash:
              </p>
              <a 
                href={`https://testnet.explorer.nervos.org/transaction/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-600 break-all"
              >
                {transactionHash}
              </a>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MintSuccessModal;
