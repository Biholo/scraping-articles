import type React from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, className = "" }) => {
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("...")
        pageNumbers.push(totalPages)
      }
    }

    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav className={`flex items-center justify-center space-x-1 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Précédent
      </button>
      {pageNumbers.map((number, index) => (
        <button
          key={index}
          onClick={() => typeof number === "number" && onPageChange(number)}
          disabled={number === "..."}
          className={`px-3 py-2 rounded-md text-sm font-medium ${
            number === currentPage ? "bg-blue-600 text-white" : "text-gray-700 bg-white hover:bg-gray-50"
          } ${number === "..." ? "cursor-default" : ""}`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Suivant
      </button>
    </nav>
  )
}

