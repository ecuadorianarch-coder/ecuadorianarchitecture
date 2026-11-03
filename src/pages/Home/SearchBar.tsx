import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  onSearch?: (query: string, activeFilter: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearch) onSearch(val, 'todos');
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) onSearch('', 'todos');
  };

  return (
    <section id="buscador" className="w-full bg-white border-y border-ea-border py-10 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-anton text-sm tracking-widest uppercase text-ea-black/50">
          EXPLORADOR DE ARQUITECTURA
        </span>

        {/* Figma Exact Search Box: 389 x 59 px (Frame Capa_1 in 17:1936 & 44:282) */}
        <div className="relative w-full max-w-[389px] h-[59px] border border-ea-black bg-white flex items-center px-4">
          <div className="text-ea-black mr-3">
            <Search className="w-5 h-5 stroke-[1.5]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Proyecto, arquitecto, critco..."
            className="w-full font-okcok text-[14px] leading-[21px] text-ea-black placeholder:text-ea-black/45 focus:outline-none bg-transparent"
            data-cursor
          />
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-ea-black/50 hover:text-ea-black transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <span className="font-inter text-xs text-ea-black/40 font-mono hidden md:block">
          389 × 59 PX
        </span>
      </div>
    </section>
  );
};
