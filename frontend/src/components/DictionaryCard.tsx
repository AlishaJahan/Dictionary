import React, { useState } from 'react';

interface Example {
  en: string;
  hi: string;
}

interface DictionaryCardProps {
  data: {
    word: string;
    translation: string;
    pos: string;
    phonetic?: string;
    definition: string;
    examples: Example[];
    synonyms: string[];
    antonyms: string[];
    language_direction: 'en-hi' | 'hi-en';
    source: 'database' | 'api';
  };
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onSelectTag: (word: string) => void;
}

export const DictionaryCard: React.FC<DictionaryCardProps> = ({
  data,
  isBookmarked,
  onToggleBookmark,
  onSelectTag,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePronounce = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    setIsPlaying(true);
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(data.word);
    
    // Choose appropriate voice/language
    if (data.language_direction === 'en-hi') {
      utterance.lang = 'en-US';
    } else {
      utterance.lang = 'hi-IN';
    }

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="dictionary-card">
      <div className="card-header">
        <div className="word-info-block">
          <h2 className="searched-word">{data.word}</h2>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span className="part-of-speech-badge">{data.pos}</span>
            {data.phonetic && (
              <span className="phonetic-text" style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {data.phonetic}
              </span>
            )}
          </div>
        </div>

        <div className="card-actions">
          {/* Pronunciation Button */}
          <button
            className={`action-btn ${isPlaying ? 'active' : ''}`}
            onClick={handlePronounce}
            title="Listen Pronunciation"
            aria-label="Listen Pronunciation"
          >
            {isPlaying ? (
              <div className="pronounce-wave-container">
                <div className="wave-bar animating"></div>
                <div className="wave-bar animating"></div>
                <div className="wave-bar animating"></div>
                <div className="wave-bar animating"></div>
              </div>
            ) : (
              '🔊'
            )}
          </button>

          {/* Bookmark Button */}
          <button
            className={`action-btn ${isBookmarked ? 'active' : ''}`}
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save Word"}
            aria-label="Toggle Bookmark"
          >
            {isBookmarked ? '⭐' : '☆'}
          </button>
        </div>
      </div>

      {/* Translation - Extremely prominent and easy to read */}
      <div className="translation-box">
        <span className="translation-label">
          {data.language_direction === 'en-hi' ? 'Meaning in Hindi' : 'अंग्रेजी में अर्थ'}
        </span>
        <div className="translation-text">{data.translation}</div>
      </div>

      {/* Definition */}
      <div className="definition-box">
        <span className="section-subtitle">
          {data.language_direction === 'en-hi' ? 'Definition' : 'परिभाषा'}
        </span>
        <p className="definition-text">{data.definition}</p>
      </div>

      {/* Examples */}
      {data.examples && data.examples.length > 0 && (
        <div className="examples-section">
          <span className="section-subtitle">
            {data.language_direction === 'en-hi' ? 'Examples in Sentences' : 'वाक्य में प्रयोग'}
          </span>
          {data.examples.map((item, idx) => (
            <div className="example-item" key={idx}>
              <p className="example-text">"{item.en}"</p>
              <p className="example-translation">{item.hi}</p>
            </div>
          ))}
        </div>
      )}

      {/* Synonyms and Antonyms */}
      <div className="relations-grid">
        {data.synonyms && data.synonyms.length > 0 && (
          <div className="tags-box">
            <span className="section-subtitle">
              {data.language_direction === 'en-hi' ? 'Synonyms' : 'समानार्थी शब्द'}
            </span>
            <div className="tags-list">
              {data.synonyms.map((syn) => (
                <span
                  key={syn}
                  className="tag-badge"
                  onClick={() => onSelectTag(syn)}
                >
                  {syn}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.antonyms && data.antonyms.length > 0 && (
          <div className="tags-box">
            <span className="section-subtitle">
              {data.language_direction === 'en-hi' ? 'Antonyms' : 'विलोम शब्द'}
            </span>
            <div className="tags-list">
              {data.antonyms.map((ant) => (
                <span
                  key={ant}
                  className="tag-badge"
                  onClick={() => onSelectTag(ant)}
                >
                  {ant}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="meta-footer">
        <span>Language Mode: <strong>{data.language_direction === 'en-hi' ? 'English ➔ Hindi' : 'Hindi ➔ English'}</strong></span>
      </div>
    </div>
  );
};
