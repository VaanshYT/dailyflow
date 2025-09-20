import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, User, AlertCircle } from 'lucide-react';
import { isValidUsername } from '../../utils/leetcodeHelpers';

const LeetCodeSearch = ({ 
  onSearch, 
  loading, 
  searchHistory = [],
  onClearHistory,
  getSearchSuggestions 
}) => {
  const [username, setUsername] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const suggestions = getSearchSuggestions ? getSearchSuggestions(username) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setValidationError('Please enter a username');
      return;
    }
    
    if (!isValidUsername(trimmedUsername)) {
      setValidationError('Username must be 1-15 characters, letters, numbers, and underscores only');
      return;
    }
    
    setValidationError('');
    setShowSuggestions(false);
    onSearch(trimmedUsername);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    setValidationError('');
    
    // Show suggestions when typing
    if (value.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestedUsername) => {
    setUsername(suggestedUsername);
    setShowSuggestions(false);
    setValidationError('');
    onSearch(suggestedUsername);
  };

  const handleClearInput = () => {
    setUsername('');
    setValidationError('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (username.length > 0 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    // Don't hide suggestions if clicking on them
    if (!suggestionsRef.current?.contains(e.relatedTarget)) {
      setTimeout(() => setShowSuggestions(false), 200);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            placeholder="Enter LeetCode username (e.g., johnsmith123)"
            className={`block w-full pl-10 pr-12 py-3 border rounded-lg text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent ${
              validationError 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            disabled={loading}
          />
          
          {username && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mt-2 flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-1" />
            {validationError}
          </div>
        )}

        {/* Search Button */}
        <div className="mt-4 flex justify-center">
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </div>
            ) : (
              'Search Profile'
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {/* Search History */}
          {username.length === 0 && searchHistory.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <span>Recent Searches</span>
                  <button
                    onClick={onClearHistory}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={`${item.username}-${index}`}
                  onClick={() => handleSuggestionClick(item.username)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                >
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-3" />
                    {item.avatar ? (
                      <img 
                        src={item.avatar} 
                        alt={item.username}
                        className="h-6 w-6 rounded-full mr-3"
                      />
                    ) : (
                      <User className="h-4 w-4 text-gray-400 mr-3" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{item.username}</div>
                      {item.realName && item.realName !== item.username && (
                        <div className="text-sm text-gray-500">{item.realName}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <>
              {username.length > 0 && searchHistory.length > 0 && (
                <div className="border-t border-gray-200"></div>
              )}
              {suggestions.map((item, index) => (
                <button
                  key={`suggestion-${item.username}-${index}`}
                  onClick={() => handleSuggestionClick(item.username)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center"
                >
                  <Search className="h-4 w-4 text-gray-400 mr-3" />
                  {item.avatar ? (
                    <img 
                      src={item.avatar} 
                      alt={item.username}
                      className="h-6 w-6 rounded-full mr-3"
                    />
                  ) : (
                    <User className="h-4 w-4 text-gray-400 mr-3" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{item.username}</div>
                    {item.realName && item.realName !== item.username && (
                      <div className="text-sm text-gray-500">{item.realName}</div>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LeetCodeSearch;