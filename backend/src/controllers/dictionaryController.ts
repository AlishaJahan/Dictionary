import { Request, Response } from 'express';
import { DictionaryService } from '../services/dictionaryService';

export class DictionaryController {
  /**
   * GET /api/dictionary/search
   * Query params:
   *   q: string (the word to search)
   *   mode: 'en-hi' | 'hi-en' (default 'en-hi')
   */
  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const { q, mode } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({ error: 'Query parameter "q" is required and must be a string.' });
        return;
      }

      const searchMode = (mode === 'hi-en') ? 'hi-en' : 'en-hi';
      const result = await DictionaryService.searchWord(q, searchMode);

      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ error: `No definition or translation found for "${q}".` });
      }
    } catch (error: any) {
      console.error('Error in search controller:', error);
      res.status(500).json({ error: 'Internal server error occurred while searching the dictionary.' });
    }
  }

  /**
   * GET /api/dictionary/suggest
   * Query params:
   *   q: string (the search query prefix)
   *   mode: 'en-hi' | 'hi-en' (default 'en-hi')
   */
  public static async suggest(req: Request, res: Response): Promise<void> {
    try {
      const { q, mode } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(200).json([]);
        return;
      }

      const searchMode = (mode === 'hi-en') ? 'hi-en' : 'en-hi';
      const suggestions = await DictionaryService.getSuggestions(q, searchMode);
      res.status(200).json(suggestions);
    } catch (error) {
      console.error('Error in suggest controller:', error);
      res.status(500).json({ error: 'Internal server error occurred while retrieving suggestions.' });
    }
  }
}
