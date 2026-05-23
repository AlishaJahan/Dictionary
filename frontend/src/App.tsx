import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DictionaryCard } from './components/DictionaryCard';

interface HistoryItem {
  word: string;
  mode: 'en-hi' | 'hi-en';
  timestamp: number;
}

interface DictionaryData {
  word: string;
  translation: string;
  pos: string;
  definition: string;
  examples: { en: string; hi: string }[];
  synonyms: string[];
  antonyms: string[];
  language_direction: 'en-hi' | 'hi-en';
  source: 'database' | 'api';
}

const BACKEND_URL = 'http://localhost:5000/api/dictionary';

// Support SpeechRecognition bilingually
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function App() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'en-hi' | 'hi-en'>('en-hi');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [searchResult, setSearchResult] = useState<DictionaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // User persistence state
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<number | null>(null);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Clean transcript from punctuation
        const cleanText = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
        setQuery(cleanText);
        // Execute instant voice search!
        handleSearch(cleanText, mode);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else {
          setError('Could not recognise your voice. Please try again.');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [mode]); // Re-init whenever mode updates to ensure correct language references are set

  // Initialize state from local storage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('shabdkosh_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedHistory = localStorage.getItem('shabdkosh_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedTheme = localStorage.getItem('shabdkosh_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  // Fetch suggestions as search query changes
  useEffect(() => {
    if (query.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/suggest?q=${encodeURIComponent(query)}&mode=${mode}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching autocomplete suggestions:', err);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(debounceTimer);
  }, [query, mode]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('shabdkosh_theme', nextTheme);
  };

  const handleSearch = async (searchTerm: string, searchMode: 'en-hi' | 'hi-en') => {
    const cleanSearch = searchTerm.trim();
    if (!cleanSearch) return;

    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    setQuery(cleanSearch);
    setMode(searchMode);

    try {
      const response = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(cleanSearch)}&mode=${searchMode}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Sorry! We could not find "${cleanSearch}" in English or Hindi.`);
        }
        throw new Error('Something went wrong on our end. Please try again.');
      }

      const data = await response.json();
      setSearchResult(data);

      // Add to search history
      setHistory((prev) => {
        const filtered = prev.filter((item) => !(item.word.toLowerCase() === cleanSearch.toLowerCase() && item.mode === searchMode));
        const updated = [{ word: data.word, mode: searchMode, timestamp: Date.now() }, ...filtered].slice(0, 30);
        localStorage.setItem('shabdkosh_history', JSON.stringify(updated));
        return updated;
      });
    } catch (err: any) {
      setSearchResult(null);
      setError(err.message || 'Unable to connect to dictionary server.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle Voice listening trigger bilingually
  const handleToggleVoice = () => {
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Google Chrome or MS Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Configure language based on tab direction
      recognitionRef.current.lang = mode === 'en-hi' ? 'en-US' : 'hi-IN';
      recognitionRef.current.start();
    }
  };

  const handleSelectSuggestion = (word: string) => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    handleSearch(word, mode);
  };

  const handleToggleBookmark = () => {
    if (!searchResult) return;
    
    const word = searchResult.word;
    setBookmarks((prev) => {
      let updated;
      if (prev.includes(word)) {
        updated = prev.filter((item) => item !== word);
      } else {
        updated = [word, ...prev];
      }
      localStorage.setItem('shabdkosh_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveHistory = (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => {
      const updated = prev.filter((item) => item.timestamp !== timestamp);
      localStorage.setItem('shabdkosh_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRemoveBookmark = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarks((prev) => {
      const updated = prev.filter((item) => item !== word);
      localStorage.setItem('shabdkosh_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('shabdkosh_history');
  };

  const handleClearBookmarks = () => {
    setBookmarks([]);
    localStorage.removeItem('shabdkosh_bookmarks');
  };

  const handleSelectTag = (tagName: string) => {
    const isHindi = /[\u0900-\u097F]/.test(tagName);
    const newMode = isHindi ? 'hi-en' : 'en-hi';
    handleSearch(tagName, newMode);
  };

  const handleSelectSidebarItem = (word: string, itemMode: 'en-hi' | 'hi-en') => {
    const isHindi = /[\u0900-\u097F]/.test(word);
    const resolvedMode = isHindi ? 'hi-en' : 'en-hi';
    handleSearch(word, resolvedMode);
  };

  const handleBlurInput = () => {
    blurTimeoutRef.current = window.setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  return (
    <div className="app-container">
      {/* Sidebar - Bookmarks & History */}
      <Sidebar
        history={history}
        bookmarks={bookmarks}
        activeMode={mode}
        onSelectItem={handleSelectSidebarItem}
        onRemoveHistory={handleRemoveHistory}
        onRemoveBookmark={handleRemoveBookmark}
        onClearHistory={handleClearHistory}
        onClearBookmarks={handleClearBookmarks}
      />

      {/* Main Board */}
      <main className="main-content">
        <header className="app-header">
          {/* Light/Dark Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </header>

        {/* Translation Mode Tabs */}
        <div className="mode-selector">
          <button
            className={`mode-tab ${mode === 'en-hi' ? 'active' : ''}`}
            onClick={() => {
              setMode('en-hi');
              setQuery('');
              setSearchResult(null);
              setError(null);
              inputRef.current?.focus();
            }}
          >
            🔤 English ➔ हिंदी
          </button>
          <button
            className={`mode-tab ${mode === 'hi-en' ? 'active' : ''}`}
            onClick={() => {
              setMode('hi-en');
              setQuery('');
              setSearchResult(null);
              setError(null);
              inputRef.current?.focus();
            }}
          >
            🕉️ हिंदी ➔ English
          </button>
        </div>

        {/* Search Panel */}
        <div className="search-container">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query, mode);
            }}
            className="search-box-wrapper"
          >
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              value={isListening ? '' : query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleBlurInput}
              placeholder={
                isListening 
                  ? (mode === 'en-hi' ? 'Listening... Speak now!' : 'सुन रहा हूँ... बोलिए!')
                  : (mode === 'en-hi' 
                      ? 'Type any English word (e.g., Benevolent, Honest, Diligent)...' 
                      : 'कोई भी हिंदी शब्द टाइप करें (जैसे, सफलता, ज्ञान, परिश्रम)...')
              }
              disabled={isListening}
              style={{ fontStyle: isListening ? 'italic' : 'normal', opacity: isListening ? 0.7 : 1 }}
            />

            {/* Microphone search button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`clear-btn ${isListening ? 'mic-listening' : ''}`}
              title={isListening ? "Stop Listening" : "Search with Voice"}
              style={{
                marginRight: '0.4rem',
                color: isListening ? 'var(--danger)' : 'var(--text-muted)',
                fontSize: '1.25rem',
                animation: isListening ? 'pulseMic 1.2s infinite alternate' : 'none',
                background: isListening ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              🎙️
            </button>

            {query && !isListening && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  inputRef.current?.focus();
                }}
                style={{ marginRight: '0.2rem' }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="submit-search-btn" disabled={isListening}>
              Search
            </button>
          </form>

          {/* Autocomplete List */}
          {showSuggestions && suggestions.length > 0 && !isListening && (
            <div className="suggestions-dropdown">
              {suggestions.map((item) => (
                <div
                  key={item}
                  className="suggestion-item"
                  onMouseDown={() => handleSelectSuggestion(item)}
                >
                  <span className="suggestion-bullet">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Area */}
        <div className="result-container">
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '3rem 0', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--panel-border)',
                borderTopColor: 'var(--primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Searching...</p>
            </div>
          )}

          {error && !loading && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid var(--danger)',
              padding: '1.5rem',
              borderRadius: '16px',
              color: 'var(--danger)',
              textAlign: 'center',
              fontWeight: 500
            }}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && searchResult && (
            <DictionaryCard
              data={searchResult}
              isBookmarked={bookmarks.includes(searchResult.word)}
              onToggleBookmark={handleToggleBookmark}
              onSelectTag={handleSelectTag}
            />
          )}

          {!loading && !error && !searchResult && (
            <div className="hero-landing">
              <div className="hero-icon">📖</div>
              <h1 className="hero-title">{mode === 'en-hi' ? 'Dictionary' : 'शब्द-कोश'}</h1>
              <p className="hero-subtitle">
                {mode === 'en-hi' 
                  ? 'Discover word definitions, translations, parts of speech, synonyms, antonyms, and correct pronunciations between English and Hindi.' 
                  : 'अंग्रेजी और हिंदी के बीच शब्दों की परिभाषा, अनुवाद, संज्ञा/विशेषण भेद, समानार्थी शब्द, विलोम और सही उच्चारण खोजें।'}
              </p>
            </div>
          )}
        </div>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulseMic {
          from {
            transform: scale(1);
            box-shadow: 0 0 0 0px rgba(239, 68, 68, 0.3);
          }
          to {
            transform: scale(1.15);
            box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
