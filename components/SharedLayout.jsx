import React from 'react';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              className="dark:invert"
              src="/ccc-logo.svg"
              alt="CCC logo"
              width={40}
              height={40}
              priority
            />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Anti Hero
            </span>
          </div>
          <div className="flex items-center">
            {/* UserProfile 将在这里渲染 */}
          </div>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-center space-x-6">
          <a
            href="https://github.com/ckb-devrel/ccc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://docs.ckbccc.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
};

export { Header, Footer };