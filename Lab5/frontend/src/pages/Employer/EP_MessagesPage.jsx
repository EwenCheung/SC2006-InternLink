import React from 'react';

const EP_MessagePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-50 px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
        </div>
        
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Sidebar - Contact List */}
          <div className="w-full md:w-1/3 border-r border-gray-200 bg-purple-50">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search candidates..." 
                  className="w-full px-4 py-2 rounded-lg border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled
                />
                <div className="absolute right-3 top-2.5 text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-6 text-center text-purple-500">
              <p>Your applicant contacts will appear here</p>
            </div>
          </div>

          {/* Main Content - Message Area */}
          <div className="w-full md:w-2/3 flex flex-col">
            {/* Message content area with scrolling */}
            <div className="flex-grow flex items-center justify-center p-4 overflow-y-auto">
              <div className="text-center w-full">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-purple-700 mb-2">COMING SOON!</h2>
                <div className="w-24 h-1 bg-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 mb-4 text-lg max-w-lg mx-auto">
                  Our messaging feature is currently under development and will be implemented soon.
                  Stay tuned for updates!
                </p>
                
                {/* Smaller, more compact AI Assistant section */}
                <div className="bg-purple-100 p-4 rounded-lg border border-purple-200 mb-4 max-w-lg mx-auto">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <h3 className="text-lg font-bold text-purple-800">Future AI Assistant</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Candidate Screening</span>
                    <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Resume Parsing</span>
                    <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Job Recommendations</span>
                    <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Communication Tools</span>
                    <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full">Analytics</span>
                  </div>
                </div>
                
                <button 
                  className="px-5 py-2 bg-purple-200 text-purple-700 text-base font-medium rounded-md hover:bg-purple-300 cursor-not-allowed"
                  disabled
                >
                  Check Back Soon
                </button>
              </div>
            </div>

            {/* Fixed message input bar at the bottom */}
            <div className="border-t border-gray-200 p-4 bg-purple-50 sticky bottom-0">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Message feature coming soon..."
                  className="flex-grow px-4 py-2 rounded-l-lg border border-purple-300 focus:outline-none cursor-not-allowed bg-purple-100"
                  disabled
                />
                <button 
                  className="px-4 py-2 bg-purple-500 text-white rounded-r-lg opacity-50 cursor-not-allowed"
                  disabled
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EP_MessagePage;