import React, { useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import { Input } from '@/components/ui/input'
import { useUIStore } from '@/stores/uiStore'

interface SearchFormProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  placeholder = "Buscar eventos por nombre, descripción, tipo...",
  className = ""
}) => {
  const [localQuery, setLocalQuery] = useState('')
  const { searchQuery, setSearchQuery } = useUIStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = localQuery || searchQuery
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
    setSearchQuery(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative max-w-2xl mx-auto ${className}`}>
      <div className="relative">
        <Input
          type="text"
          value={localQuery || searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-4 pr-12 py-3 text-base border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-[#6B1E22] focus:border-[#6B1E22] transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#6B1E22] text-white rounded-full p-3 hover:bg-[#5a191e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6B1E22] focus:ring-offset-2"
          aria-label="Buscar"
        >
          <FaSearch size={16} />
        </button>
      </div>
    </form>
  )
}

export default SearchForm