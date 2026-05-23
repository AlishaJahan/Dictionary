import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(__dirname);
const DB_PATH = path.join(DB_DIR, 'dictionary.db');

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

interface DictionaryWord {
  word: string;
  translation: string;
  pos: string;
  phonetic: string;
  definition: string;
  examples: { en: string; hi: string }[];
  synonyms: string[];
  antonyms: string[];
  language_direction: 'en-hi' | 'hi-en';
}

const seedData: DictionaryWord[] = [
  // English to Hindi
  {
    word: 'water',
    translation: 'पानी / जल / नीर',
    pos: 'Noun',
    phonetic: 'वॉट(र)',
    definition: 'The clear liquid that falls as rain and is in rivers, seas and lakes.',
    examples: [
      { en: 'drinking water', hi: 'पीने का पानी' },
      { en: 'After the heavy rain several fields were under water.', hi: 'भारी बारिश के बाद कई खेत पानी में डूब गए थे।' }
    ],
    synonyms: ['Liquid', 'Aqua', 'H2O'],
    antonyms: ['Dehydration', 'Dryness'],
    language_direction: 'en-hi'
  },
  {
    word: 'Abandon',
    translation: 'छोड़ देना / त्यागना',
    pos: 'Verb',
    phonetic: 'अबैंडन',
    definition: 'To completely leave a place, person, or thing, or to stop doing something.',
    examples: [
      { en: 'They had to abandon their car in the heavy snow.', hi: 'भारी बर्फबारी में उन्हें अपनी कार छोड़नी पड़ी।' },
      { en: 'Never abandon your dreams.', hi: 'अपने सपनों को कभी मत त्यागो।' }
    ],
    synonyms: ['Desert', 'Forsake', 'Leave', 'Discard'],
    antonyms: ['Keep', 'Maintain', 'Cherish', 'Adopt'],
    language_direction: 'en-hi'
  },
  {
    word: 'Benevolent',
    translation: 'दयालु / परोपकारी',
    pos: 'Adjective',
    phonetic: 'बनेवलन्ट',
    definition: 'Kind, helpful, and generous; wishing to do good to others.',
    examples: [
      { en: 'He was a benevolent man who fed the poor every day.', hi: 'वह एक परोपकारी व्यक्ति थे जो रोज़ गरीबों को भोजन कराते थे।' },
      { en: 'The charity received a benevolent donation from an anonymous helper.', hi: 'दान संस्था को एक अज्ञात सहायक से उदार दान प्राप्त हुआ।' }
    ],
    synonyms: ['Kind', 'Generous', 'Charitable', 'Philanthropic'],
    antonyms: ['Malevolent', 'Cruel', 'Miserly', 'Selfish'],
    language_direction: 'en-hi'
  },
  {
    word: 'Courage',
    translation: 'साहस / हिम्मत',
    pos: 'Noun',
    phonetic: 'करिज',
    definition: 'The ability to do something that frightens you; bravery.',
    examples: [
      { en: 'It takes courage to speak the truth.', hi: 'सच बोलने के लिए साहस की आवश्यकता होती है।' },
      { en: 'She showed great courage during the crisis.', hi: 'उसने संकट के दौरान बड़ा साहस दिखाया।' }
    ],
    synonyms: ['Bravery', 'Valor', 'Grit', 'Boldness'],
    antonyms: ['Cowardice', 'Fear', 'Timidity'],
    language_direction: 'en-hi'
  },
  {
    word: 'Diligent',
    translation: 'परिश्रमी / मेहनती',
    pos: 'Adjective',
    phonetic: 'डिलिजन्ट',
    definition: 'Showing care and effort in one\'s work or duties; hard-working.',
    examples: [
      { en: 'She is a diligent student who always gets good grades.', hi: 'वह एक परिश्रमी छात्रा है जिसे हमेशा अच्छे अंक मिलते हैं।' },
      { en: 'The success of the project is due to their diligent effort.', hi: 'परियोजना की सफलता उनके निरंतर और मेहनती प्रयासों के कारण है।' }
    ],
    synonyms: ['Assiduous', 'Hardworking', 'Industrious', 'Meticulous'],
    antonyms: ['Lazy', 'Idle', 'Negligent', 'Careless'],
    language_direction: 'en-hi'
  },
  {
    word: 'Eloquent',
    translation: 'सुवक्ता / वाक्पटु',
    pos: 'Adjective',
    phonetic: 'एलोकवेन्ट',
    definition: 'Fluent or persuasive in speaking or writing.',
    examples: [
      { en: 'The politician gave an eloquent speech that moved the crowd.', hi: 'राजनेता ने एक प्रभावशाली भाषण दिया जिसने भीड़ को झकझोर कर रख दिया।' },
      { en: 'Her eloquent writing won her the national essay contest.', hi: 'उनके प्रभावशाली लेखन ने उन्हें राष्ट्रीय निबंध प्रतियोगिता जिताई।' }
    ],
    synonyms: ['Articulate', 'Persuasive', 'Expressive', 'Fluent'],
    antonyms: ['Inarticulate', 'Stammering', 'Mute', 'Inelegant'],
    language_direction: 'en-hi'
  },
  {
    word: 'Fortitude',
    translation: 'धैर्य / सहनशीलता',
    pos: 'Noun',
    phonetic: 'फॉर्टिट्यूड',
    definition: 'Courage in pain or adversity; mental toughness.',
    examples: [
      { en: 'She faced the illness with incredible fortitude.', hi: 'उन्होंने अविश्वसनीय धैर्य के साथ बीमारी का सामना किया।' }
    ],
    synonyms: ['Resilience', 'Endurance', 'Patience', 'Grit'],
    antonyms: ['Weakness', 'Cowardice', 'Frailty'],
    language_direction: 'en-hi'
  },
  {
    word: 'Grateful',
    translation: 'कृतज्ञ / आभारी',
    pos: 'Adjective',
    phonetic: 'ग्रेटफुल',
    definition: 'Feeling or showing appreciation for kindness or help.',
    examples: [
      { en: 'I am extremely grateful for your guidance.', hi: 'मैं आपके मार्गदर्शन के लिए बेहद आभारी हूँ।' },
      { en: 'She felt grateful to be surrounded by loving friends.', hi: 'वह खुद को प्यारे दोस्तों से घिरा पाकर कृतज्ञ महसूस कर रही थी।' }
    ],
    synonyms: ['Thankful', 'Appreciative', 'Obliged'],
    antonyms: ['Ungrateful', 'Thankless', 'Unappreciative'],
    language_direction: 'en-hi'
  },
  {
    word: 'Honest',
    translation: 'ईमानदार / सच्चा',
    pos: 'Adjective',
    phonetic: 'ऑनेस्ट',
    definition: 'Free of deceit; truthful and sincere.',
    examples: [
      { en: 'An honest answer is always respected.', hi: 'एक ईमानदार जवाब का हमेशा सम्मान किया जाता है।' }
    ],
    synonyms: ['Truthful', 'Sincere', 'Upright', 'Trustworthy'],
    antonyms: ['Dishonest', 'Deceitful', 'Lying', 'Hypocritical'],
    language_direction: 'en-hi'
  },
  {
    word: 'Inevitable',
    translation: 'अपरिहार्य / अटल',
    pos: 'Adjective',
    phonetic: 'इनेविटेबल',
    definition: 'Certain to happen; unavoidable.',
    examples: [
      { en: 'Change is an inevitable part of life.', hi: 'बदलाव जीवन का एक अनिवार्य/अटल हिस्सा है।' }
    ],
    synonyms: ['Unavoidable', 'Inescapable', 'Certain', 'Assured'],
    antonyms: ['Avoidable', 'Uncertain', 'Evitable', 'Preventable'],
    language_direction: 'en-hi'
  },
  {
    word: 'Jubilant',
    translation: 'उल्लसित / आनंदित',
    pos: 'Adjective',
    phonetic: 'जूबिलेंट',
    definition: 'Feeling or expressing great happiness and triumph.',
    examples: [
      { en: 'The crowd was jubilant when their team won the match.', hi: 'जब उनकी टीम ने मैच जीता तो भीड़ खुशी से झूम उठी।' }
    ],
    synonyms: ['Joyful', 'Exultant', 'Elated', 'Thrilled'],
    antonyms: ['Depressed', 'Sorrowful', 'Sad', 'Gloomy'],
    language_direction: 'en-hi'
  },

  // Hindi to English
  {
    word: 'ज्ञान',
    translation: 'Knowledge / Wisdom',
    pos: 'Noun',
    phonetic: 'Gyaan',
    definition: 'जानकारी, अनुभव या समझ जो शिक्षा या जीवन के अनुभवों से प्राप्त होती है।',
    examples: [
      { en: 'Knowledge is power.', hi: 'ज्ञान ही शक्ति है।' },
      { en: 'He has deep knowledge of ancient Indian history.', hi: 'उन्हें प्राचीन भारतीय इतिहास का गहरा ज्ञान है।' }
    ],
    synonyms: ['जानकारी', 'बोध', 'समझ', 'विद्या'],
    antonyms: ['अज्ञान', 'मूर्खता'],
    language_direction: 'hi-en'
  },
  {
    word: 'सफलता',
    translation: 'Success / Victory',
    pos: 'Noun',
    phonetic: 'Safalta',
    definition: 'किसी उद्देश्य, लक्ष्य या प्रयास का सफल परिणाम या प्राप्ति।',
    examples: [
      { en: 'Hard work is the key to success.', hi: 'कठिन परिश्रम ही सफलता की कुंजी है।' },
      { en: 'We celebrated the success of our new application.', hi: 'हमने अपने नए एप्लिकेशन की सफलता का जश्न मनाया।' }
    ],
    synonyms: ['जीत', 'कामयाबी', 'विजय', 'सिद्धि'],
    antonyms: ['असफलता', 'हार', 'पतन'],
    language_direction: 'hi-en'
  },
  {
    word: 'सुंदर',
    translation: 'Beautiful / Gorgeous',
    pos: 'Adjective',
    phonetic: 'Sundar',
    definition: 'जो देखने, सुनने या महसूस करने में मनमोहक और आकर्षक लगे।',
    examples: [
      { en: 'The mountain sunset was incredibly beautiful.', hi: 'पहाड़ का सूर्यास्त बेहद सुंदर था।' }
    ],
    synonyms: ['आकर्षक', 'मनमोहक', 'हसीन', 'प्रिय'],
    antonyms: ['कुरूप', 'भद्दा'],
    language_direction: 'hi-en'
  },
  {
    word: 'मित्र',
    translation: 'Friend / Companion',
    pos: 'Noun',
    phonetic: 'Mitra',
    definition: 'वह व्यक्ति जिसके साथ स्नेह, विश्वास और परस्पर सम्मान का संबंध हो।',
    examples: [
      { en: 'A friend in need is a friend indeed.', hi: 'ज़रूरत के समय काम आने वाला मित्र ही सच्चा मित्र होता है।' }
    ],
    synonyms: ['दोस्त', 'सखा', 'साथी', 'यार'],
    antonyms: ['शत्रु', 'दुश्मन'],
    language_direction: 'hi-en'
  },
  {
    word: 'परिश्रम',
    translation: 'Hard work / Diligence',
    pos: 'Noun',
    phonetic: 'Parishram',
    definition: 'किसी कार्य को पूरा करने के लिए किया गया अत्यधिक शारीरिक या मानसिक प्रयास।',
    examples: [
      { en: 'There is no shortcut to hard work.', hi: 'परिश्रम का कोई शॉर्टकट नहीं होता।' }
    ],
    synonyms: ['मेहनत', 'श्रम', 'मशक्कत'],
    antonyms: ['आलस्य', 'सुस्ती'],
    language_direction: 'hi-en'
  },
  {
    word: 'प्रसन्न',
    translation: 'Happy / Glad',
    pos: 'Adjective',
    phonetic: 'Prasann',
    definition: 'खुश और संतुष्ट होने का भाव व्यक्त करने वाला।',
    examples: [
      { en: 'I am very happy with your performance.', hi: 'मैं आपके प्रदर्शन से बहुत प्रसन्न हूँ।' }
    ],
    synonyms: ['खुश', 'आनंदित', 'हर्षित'],
    antonyms: ['दुखी', 'उदास', 'नाराज़'],
    language_direction: 'hi-en'
  },
  {
    word: 'दया',
    translation: 'Kindness / Mercy / Compassion',
    pos: 'Noun',
    phonetic: 'Daya',
    definition: 'दूसरों के दुखों को देखकर उत्पन्न होने वाली सहानुभूति और सहायता करने की भावना।',
    examples: [
      { en: 'We should always show kindness to animals.', hi: 'हमें हमेशा जानवरों के प्रति दया दिखानी चाहिए।' }
    ],
    synonyms: ['करुणा', 'सहानुभूति', 'कृपा'],
    antonyms: ['क्रूरता', 'बेरहमी'],
    language_direction: 'hi-en'
  },
  {
    word: 'शांति',
    translation: 'Peace / Tranquility',
    pos: 'Noun',
    phonetic: 'Shanti',
    definition: 'हलचल, कोलाहल या युद्ध की अनुपस्थिति; मन की स्थिरता।',
    examples: [
      { en: 'Yoga helps in attaining mental peace.', hi: 'योग मानसिक शांति प्राप्त करने में मदद करता है।' }
    ],
    synonyms: ['अमन', 'सुकून', 'खामोशी'],
    antonyms: ['अशांति', 'शोर', 'कोलाहल'],
    language_direction: 'hi-en'
  },
  {
    word: 'स्वास्थ्य',
    translation: 'Health / Wellness',
    pos: 'Noun',
    phonetic: 'Swaasthya',
    definition: 'शारीरिक, मानसिक और सामाजिक रूप से निरोग और सुखी होने की अवस्था।',
    examples: [
      { en: 'Health is wealth.', hi: 'स्वास्थ्य ही धन है।' }
    ],
    synonyms: ['तंदुरुस्ती', 'आरोग्य', 'सेहत'],
    antonyms: ['बीमारी', 'रोग', 'अस्वस्थता'],
    language_direction: 'hi-en'
  },
  {
    word: 'स्वप्न',
    translation: 'Dream / Vision',
    pos: 'Noun',
    phonetic: 'Swapna',
    definition: 'सोते समय मन में आने वाले दृश्य या विचार; भविष्य की आकांक्षा।',
    examples: [
      { en: 'Follow your dreams with determination.', hi: 'दृढ़ संकल्प के साथ अपने सपनों का पीछा करें।' }
    ],
    synonyms: ['सपना', 'ख्वाब', 'कल्पना'],
    antonyms: ['यथार्थ', 'हकीकत'],
    language_direction: 'hi-en'
  }
];

db.serialize(() => {
  console.log('Initializing database tables...');
  
  // Drop table if exists to ensure clean seed
  db.run('DROP TABLE IF EXISTS dictionary');

  // Create table
  db.run(`
    CREATE TABLE IF NOT EXISTS dictionary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      pos TEXT NOT NULL,
      phonetic TEXT,
      definition TEXT NOT NULL,
      examples TEXT,
      synonyms TEXT,
      antonyms TEXT,
      language_direction TEXT NOT NULL
    )
  `);

  console.log('Tables created. Seeding data...');

  const stmt = db.prepare(`
    INSERT INTO dictionary (word, translation, pos, phonetic, definition, examples, synonyms, antonyms, language_direction)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of seedData) {
    stmt.run(
      item.word,
      item.translation,
      item.pos,
      item.phonetic,
      item.definition,
      JSON.stringify(item.examples),
      JSON.stringify(item.synonyms),
      JSON.stringify(item.antonyms),
      item.language_direction
    );
  }

  stmt.finalize();

  // Create indexes
  db.run('CREATE INDEX IF NOT EXISTS idx_word ON dictionary(word)');
  db.run('CREATE INDEX IF NOT EXISTS idx_lang_dir ON dictionary(language_direction)');

  console.log('Database seeded successfully!');
});

db.close();
