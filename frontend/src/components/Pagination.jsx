import React from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Always render to show controls even on single pages

  const safeTotalPages = Math.max(1, totalPages);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        Prev
      </button>

      {[...Array(safeTotalPages)].map((_, index) => {
        const pageNumber = index + 1;
        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentPage === pageNumber
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentPage >= totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        Next
      </button>
    </div>
  );
}
