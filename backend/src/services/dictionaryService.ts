import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'db', 'dictionary.db');

export interface DictionaryEntry {
  id?: number;
  word: string;
  translation: string;
  pos: string;
  phonetic: string;
  definition: string;
  examples: string; // JSON string in DB
  synonyms: string; // JSON string in DB
  antonyms: string; // JSON string in DB
  language_direction: 'en-hi' | 'hi-en';
}

export interface FormattedDictionaryEntry {
  word: string;
  translation: string;
  pos: string;
  phonetic: string;
  definition: string;
  examples: { en: string; hi: string }[];
  synonyms: string[];
  antonyms: string[];
  language_direction: 'en-hi' | 'hi-en';
  source: 'database' | 'api';
}

const getDbConnection = (): sqlite3.Database => {
  return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error opening database for querying:', err.message);
    }
  });
};

export class DictionaryService {
  /**
   * Search for a word in the local database, fallback to MyMemory API if not found.
   */
  public static async searchWord(query: string, mode: 'en-hi' | 'hi-en'): Promise<FormattedDictionaryEntry | null> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return null;

    // 1. Try local SQLite database first
    const localResult = await this.queryLocalDatabase(cleanQuery, mode);
    if (localResult) {
      return {
        ...localResult,
        source: 'database'
      };
    }

    // 2. If not found, fallback to MyMemory Translation API
    console.log(`Word "${cleanQuery}" not found in local DB. Falling back to MyMemory API...`);
    const apiResult = await this.queryTranslationApi(cleanQuery, mode);
    if (apiResult) {
      return {
        ...apiResult,
        source: 'api'
      };
    }

    return null;
  }

  /**
   * Get suggestions/autocomplete terms as the user types.
   * Merges local SQLite suggestions with live Datamuse autocomplete results for English to guarantee high coverage.
   */
  public static async getSuggestions(query: string, mode: 'en-hi' | 'hi-en'): Promise<string[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    // 1. Query local database suggestions
    const localSuggestions = await this.queryLocalSuggestions(cleanQuery, mode);

    // 2. For English search, fetch from public Datamuse autocomplete API as well
    if (mode === 'en-hi') {
      try {
        const response = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(cleanQuery)}`);
        if (response.ok) {
          const apiData = await response.json() as { word: string }[];
          const apiWords = apiData.map(item => item.word);
          
          // Merge local and external API suggestions, keeping unique values
          const merged = Array.from(new Set([...localSuggestions, ...apiWords])).slice(0, 7);
          return merged;
        }
      } catch (err) {
        console.error('Error fetching Datamuse suggestions:', err);
      }
    }

    return localSuggestions;
  }

  /**
   * Helper to query SQLite database for suggestion prefixes
   */
  private static queryLocalSuggestions(query: string, mode: 'en-hi' | 'hi-en'): Promise<string[]> {
    return new Promise((resolve) => {
      const db = getDbConnection();
      const sql = `
        SELECT word 
        FROM dictionary 
        WHERE language_direction = ? AND word LIKE ? 
        LIMIT 6
      `;
      
      db.all(sql, [mode, `${query}%`], (err, rows: { word: string }[]) => {
        db.close();
        if (err) {
          console.error('SQLite suggestion query error:', err.message);
          resolve([]);
        } else {
          const suggestions = rows.map((r) => r.word);
          resolve(suggestions);
        }
      });
    });
  }

  /**
   * Query the SQLite database for a match
   */
  private static queryLocalDatabase(word: string, mode: 'en-hi' | 'hi-en'): Promise<FormattedDictionaryEntry | null> {
    return new Promise((resolve) => {
      const db = getDbConnection();
      
      const sql = `
        SELECT * 
        FROM dictionary 
        WHERE language_direction = ? AND word = ? COLLATE NOCASE
        LIMIT 1
      `;

      db.get(sql, [mode, word], (err, row: DictionaryEntry | undefined) => {
        db.close();
        if (err) {
          console.error('SQLite query error:', err.message);
          resolve(null);
        } else if (row) {
          try {
            resolve({
              word: row.word,
              translation: row.translation,
              pos: row.pos,
              phonetic: row.phonetic || '',
              definition: row.definition,
              examples: JSON.parse(row.examples || '[]'),
              synonyms: JSON.parse(row.synonyms || '[]'),
              antonyms: JSON.parse(row.antonyms || '[]'),
              language_direction: row.language_direction,
              source: 'database'
            });
          } catch (e) {
            console.error('Error parsing JSON from database row:', e);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Hybrid API Lookup: Queries MyMemory for perfect English-Hindi translation,
   * then calls Free Dictionary API to pull REAL English definitions, phonetics, parts of speech, and examples!
   */
  private static async queryTranslationApi(word: string, mode: 'en-hi' | 'hi-en'): Promise<FormattedDictionaryEntry | null> {
    const langPair = mode === 'en-hi' ? 'en|hi' : 'hi|en';
    const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=${langPair}`;

    try {
      // 1. Get primary translation from MyMemory API
      const translateResponse = await fetch(translateUrl);
      if (!translateResponse.ok) {
        throw new Error(`MyMemory translation status: ${translateResponse.status}`);
      }

      const translateData = await translateResponse.json();
      const translatedText = translateData.responseData?.translatedText;

      if (!translatedText || translatedText === word) {
        return null;
      }

      if (translatedText.toLowerCase().includes('limit exceeded') || translatedText.toLowerCase().includes('error')) {
        console.warn('MyMemory API quota limit exceeded.');
        return null;
      }

      // 2. Identify the English word to fetch standard definitions for
      const englishWord = mode === 'en-hi' ? word : translatedText;

      // 3. Fallback defaults
      let definition = mode === 'en-hi'
        ? `Having the qualities or translation corresponding to "${translatedText}".`
        : `ऑनलाइन अनुवाद आर्काइव से "${word}" का मानक अंग्रेजी अर्थ।`;
      let pos = mode === 'en-hi' ? 'Adjective' : 'Noun';
      let phonetic = '';
      let examples: { en: string; hi: string }[] = [];
      let synonyms: string[] = [];
      let antonyms: string[] = [];

      // 4. Try fetching rich dictionary metadata from Free Dictionary API
      try {
        const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(englishWord)}`);
        if (dictResponse.ok) {
          const dictData = await dictResponse.json() as any;
          if (Array.isArray(dictData) && dictData.length > 0) {
            const entry = dictData[0];
            
            // Extract phonetic transcription
            phonetic = entry.phonetic || (entry.phonetics && entry.phonetics[0]?.text) || '';

            const meaning = entry.meanings?.[0];
            if (meaning) {
              // Extract part of speech
              pos = meaning.partOfSpeech || pos;
              
              // Extract primary definition
              const primaryDef = meaning.definitions?.[0];
              if (primaryDef) {
                definition = primaryDef.definition || definition;
              }

              // Loop through ALL definitions to find any valid real-life examples
              for (const m of entry.meanings) {
                if (m.definitions) {
                  for (const d of m.definitions) {
                    if (d.example && d.example.trim()) {
                      examples.push({
                        en: d.example,
                        hi: ''
                      });
                    }
                  }
                }
              }

              // Extract synonyms and antonyms
              synonyms = meaning.synonyms || [];
              antonyms = meaning.antonyms || [];
            }
          }
        }
      } catch (dictErr) {
        console.warn('Free Dictionary API failed, using basic translation fallback:', dictErr);
      }

      // Limit to top 2 examples to keep the load super-fast and highly readable
      examples = examples.slice(0, 2);

      // 5. Translate English examples to Hindi using MyMemory
      for (const ex of examples) {
        if (!ex.hi) {
          try {
            const exRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(ex.en)}&langpair=en|hi`);
            if (exRes.ok) {
              const exData = await exRes.json();
              ex.hi = exData.responseData?.translatedText || '';
            }
          } catch (exErr) {
            console.warn('Failed to translate example sentence:', exErr);
          }
        }
      }

      // 6. Fallback natural examples if absolutely no example was found in the API response
      if (examples.length === 0) {
        const wordPlaceholder = mode === 'en-hi' ? word : translatedText;
        const translationPlaceholder = mode === 'en-hi' ? translatedText : word;
        const lowPos = pos.toLowerCase();

        if (lowPos.includes('adj')) {
          examples.push({
            en: `She gave a very ${wordPlaceholder} reply.`,
            hi: `उसने बहुत ${translationPlaceholder} जवाब दिया।`
          });
        } else if (lowPos.includes('verb')) {
          examples.push({
            en: `We must ${wordPlaceholder} this task.`,
            hi: `हमें इस कार्य को ${translationPlaceholder} करना चाहिए।`
          });
        } else {
          examples.push({
            en: `This is a perfect example of ${wordPlaceholder}.`,
            hi: `यह ${translationPlaceholder} का एक आदर्श उदाहरण है।`
          });
        }
      }

      return {
        word: word,
        translation: translatedText,
        pos: pos.charAt(0).toUpperCase() + pos.slice(1),
        phonetic: phonetic,
        definition: definition,
        examples: examples,
        synonyms: synonyms.slice(0, 5),
        antonyms: antonyms.slice(0, 5),
        language_direction: mode,
        source: 'api'
      };
    } catch (error) {
      console.error('Error in hybrid translation service:', error);
      return null;
    }
  }
}
