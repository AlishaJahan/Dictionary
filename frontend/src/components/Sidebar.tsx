import React from 'react';

interface HistoryItem {
  word: string;
  mode: 'en-hi' | 'hi-en';
  timestamp: number;
}

interface SidebarProps {
  history: HistoryItem[];
  bookmarks: string[];
  activeMode: 'en-hi' | 'hi-en';
  onSelectItem: (word: string, mode: 'en-hi' | 'hi-en') => void;
  onRemoveHistory: (timestamp: number, e: React.MouseEvent) => void;
  onRemoveBookmark: (word: string, e: React.MouseEvent) => void;
  onClearHistory: () => void;
  onClearBookmarks: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  history,
  bookmarks,
  activeMode,
  onSelectItem,
  onRemoveHistory,
  onRemoveBookmark,
  onClearHistory,
  onClearBookmarks,
}) => {
  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">📖</div>
        <span className="logo-text">{activeMode === 'en-hi' ? 'Dictionary' : 'शब्द-कोश'}</span>
      </div>

      {/* Bookmarks Section */}
      <div className="sidebar-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sidebar-section-title">Saved Words (बुकमार्क)</span>
          {bookmarks.length > 0 && (
            <button
              onClick={onClearBookmarks}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              Clear All
            </button>
          )}
        </div>
        
        {bookmarks.length === 0 ? (
          <p className="empty-state-text">No bookmarked words yet.</p>
        ) : (
          <div className="sidebar-list">
            {bookmarks.map((word) => (
              <div
                key={word}
                className="sidebar-item"
                onClick={() => onSelectItem(word, 'en-hi')} // We'll look up word (API determines direction or we use saved direction)
              >
                <span className="sidebar-item-text" title={word}>
                  ⭐ {word}
                </span>
                <button
                  className="delete-btn"
                  onClick={(e) => onRemoveBookmark(word, e)}
                  title="Remove Bookmark"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* History Section */}
      <div className="sidebar-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="sidebar-section-title">Recent Searches (इतिहास)</span>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '600',
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="empty-state-text">Your search history is empty.</p>
        ) : (
          <div className="sidebar-list">
            {history.map((item) => (
              <div
                key={item.timestamp}
                className="sidebar-item"
                onClick={() => onSelectItem(item.word, item.mode)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span className="sidebar-item-text" title={item.word}>
                    {item.word}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="sidebar-item-meta" style={{
                    fontSize: '0.65rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--panel-border)'
                  }}>
                    {item.mode === 'en-hi' ? 'EN➔HI' : 'HI➔EN'}
                  </span>
                  <button
                    className="delete-btn"
                    onClick={(e) => onRemoveHistory(item.timestamp, e)}
                    title="Remove from History"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
