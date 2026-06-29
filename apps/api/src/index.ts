import cors from "cors";
import express from "express";
import type {
  CurriculumCode,
  DifficultyLevel,
  GeneratedQuizResponse,
  GradeLevel,
  LanguageMode,
  SampleQuizResponse,
  SubjectCode,
} from "./types";

const app = express();
const port = Number(process.env.PORT) || 3000;
const allowedOrigin = process.env.CORS_ORIGIN || "*";

const curricula: CurriculumCode[] = ["cambridge", "moeys"];
const grades: GradeLevel[] = [
  "grade-1",
  "grade-2",
  "grade-3",
  "grade-4",
  "grade-5",
  "grade-6",
  "grade-7",
  "grade-8",
  "grade-9",
  "grade-10",
  "grade-11",
  "grade-12",
];
const subjects: SubjectCode[] = ["math", "science", "english", "khmer"];
const languages: LanguageMode[] = ["english", "khmer", "bilingual"];
const difficulties: DifficultyLevel[] = ["easy", "medium", "hard"];

const curriculumLabels: Record<CurriculumCode, string> = {
  cambridge: "Cambridge",
  moeys: "Cambodia MoEYS",
};

const subjectLabels: Record<SubjectCode, string> = {
  math: "Math",
  science: "Science",
  english: "English",
  khmer: "Khmer",
};

const languageLabels: Record<LanguageMode, string> = {
  english: "English",
  khmer: "Khmer",
  bilingual: "Bilingual",
};

const difficultyLabels: Record<DifficultyLevel, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

type NormalizedGenerateRequest = {
  gradeCode: GradeLevel;
  gradeNumber: number;
  curriculumCode: CurriculumCode;
  curriculumLabel: string;
  subjectCode: SubjectCode;
  subjectLabel: string;
  languageCode: LanguageMode;
  languageLabel: string;
  difficultyCode: DifficultyLevel;
  difficultyLabel: string;
  topic?: string;
};

type GeneratedQuizContent = {
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizBankQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizBank = Record<SubjectCode, QuizBankQuestion[]>;

function getAvailableSubjectsBySelection(
  grade: GradeLevel,
  curriculum: CurriculumCode,
): SubjectCode[] {
  if (curriculum === "cambridge") {
    return ["math", "science", "english"];
  }

  if (grade === "grade-2" || grade === "grade-3") {
    return ["math", "english", "khmer"];
  }

  return ["math", "science", "english", "khmer"];
}

const englishQuizBank: QuizBank = {
  math: [
    {
      id: "math-fractions-1",
      question: "What is 3/4 written as a decimal?",
      choices: ["0.25", "0.5", "0.75", "1.25"],
      correctAnswer: "0.75",
      explanation:
        "Start by dividing 3 by 4. When you do 3 ÷ 4, the answer is 0.75. So 3/4 written as a decimal is 0.75.",
    },
    {
      id: "math-multiplication-1",
      question: "What is 6 × 7?",
      choices: ["36", "42", "48", "56"],
      correctAnswer: "42",
      explanation:
        "Think of 6 groups of 7. Adding 7 six times gives 42. That is why 6 × 7 = 42.",
    },
    {
      id: "math-division-1",
      question: "What is 24 divided by 6?",
      choices: ["3", "4", "5", "6"],
      correctAnswer: "4",
      explanation:
        "Division asks how many equal groups fit into a number. Since 6 + 6 + 6 + 6 = 24, the answer is 4.",
    },
  ],
  science: [
    {
      id: "science-plants-1",
      question: "Which part of a plant mainly absorbs water from the soil?",
      choices: ["Leaf", "Root", "Flower", "Fruit"],
      correctAnswer: "Root",
      explanation:
        "First, the roots take in water and minerals from the soil. Next, the plant moves them to other parts. That is why the root is correct.",
    },
    {
      id: "science-states-1",
      question: "What happens to ice when it gets warm?",
      choices: ["It freezes", "It melts", "It disappears", "It grows"],
      correctAnswer: "It melts",
      explanation:
        "Ice is solid water. When it gets warm, it changes from a solid into a liquid. That change is called melting.",
    },
    {
      id: "science-solar-1",
      question: "Which star gives Earth light and heat?",
      choices: ["Moon", "Mars", "Sun", "Venus"],
      correctAnswer: "Sun",
      explanation:
        "The Sun is the star closest to Earth. It gives our planet light and heat, which help life grow.",
    },
  ],
  english: [
    {
      id: "english-grammar-1",
      question: "Choose the sentence with correct grammar.",
      choices: [
        "She go to school every day.",
        "She goes to school every day.",
        "She going to school every day.",
        "She gone to school every day.",
      ],
      correctAnswer: "She goes to school every day.",
      explanation:
        "Use 'goes' because the subject is 'she'. In the present simple tense, singular subjects like he, she, and it usually take a verb ending in s or es.",
    },
    {
      id: "english-vocab-1",
      question: "Which word is a synonym for 'happy'?",
      choices: ["Sad", "Angry", "Joyful", "Tired"],
      correctAnswer: "Joyful",
      explanation:
        "A synonym is a word with a similar meaning. 'Joyful' has a similar meaning to 'happy', so it is the correct answer.",
    },
    {
      id: "english-punctuation-1",
      question: "Which sentence ends with the correct punctuation?",
      choices: [
        "What is your name.",
        "I like reading books?",
        "Please close the door.",
        "Wow that is amazing,",
      ],
      correctAnswer: "Please close the door.",
      explanation:
        "A statement usually ends with a full stop. 'Please close the door.' is a complete statement with correct punctuation.",
    },
  ],
  khmer: [
    {
      id: "khmer-vocab-1",
      question: 'Which word means "book"?',
      choices: ["សៀវភៅ", "តុ", "ទឹក", "ផ្ទះ"],
      correctAnswer: "សៀវភៅ",
      explanation:
        "The word 'សៀវភៅ' means 'book'. The other choices mean table, water, and house.",
    },
    {
      id: "khmer-reading-1",
      question: "Which word is the name of a fruit?",
      choices: ["ស្វាយ", "កៅអី", "ប៊ិច", "ក្តារ"],
      correctAnswer: "ស្វាយ",
      explanation:
        "'ស្វាយ' means mango, which is a fruit. The other choices mean chair, pen, and board.",
    },
    {
      id: "khmer-reading-2",
      question: "Which word means 'water'?",
      choices: ["ទឹក", "សៀវភៅ", "ផ្កា", "កៅអី"],
      correctAnswer: "ទឹក",
      explanation:
        "'ទឹក' means water. The other choices mean book, flower, and chair.",
    },
  ],
};

const khmerQuizBank: QuizBank = {
  math: [
    {
      id: "math-khmer-1",
      question: "តើ 3/4 សរសេរជាទសភាគបានប៉ុន្មាន?",
      choices: ["0.25", "0.5", "0.75", "1.25"],
      correctAnswer: "0.75",
      explanation:
        "ចាប់ផ្តើមដោយយក 3 ចែកនឹង 4។ នៅពេលគណនា 3 ÷ 4 យើងបាន 0.75។ ដូច្នេះ 3/4 សរសេរជាទសភាគបាន 0.75។",
    },
    {
      id: "math-khmer-2",
      question: "តើ 6 × 7 ស្មើប៉ុន្មាន?",
      choices: ["36", "42", "48", "56"],
      correctAnswer: "42",
      explanation:
        "គិតថា 6 ក្រុម ដែលក្រុមនីមួយៗមាន 7។ បូក 7 ចំនួន 6 ដង យើងបាន 42។ ដូច្នេះ 6 × 7 = 42។",
    },
    {
      id: "math-khmer-3",
      question: "តើ 24 ចែកនឹង 6 ស្មើប៉ុន្មាន?",
      choices: ["3", "4", "5", "6"],
      correctAnswer: "4",
      explanation:
        "ការចែកសួរថា មានក្រុមស្មើៗគ្នាប៉ុន្មាន។ ព្រោះ 6 + 6 + 6 + 6 = 24 ដូច្នេះចម្លើយគឺ 4។",
    },
  ],
  science: [
    {
      id: "science-khmer-1",
      question: "តើផ្នែកណានៃរុក្ខជាតិមានតួនាទីស្រូបទឹកពីដីជាចម្បង?",
      choices: ["ស្លឹក", "ឫស", "ផ្កា", "ផ្លែ"],
      correctAnswer: "ឫស",
      explanation:
        "ដំបូង ឫសស្រូបទឹក និងជាតិរ៉ែពីដី។ បន្ទាប់មក រុក្ខជាតិដឹកនាំវាទៅផ្នែកផ្សេងៗ។ ដូច្នេះ ឫសគឺជាចម្លើយត្រឹមត្រូវ។",
    },
    {
      id: "science-khmer-2",
      question: "តើអ្វីកើតឡើងចំពោះទឹកកកនៅពេលវាក្តៅ?",
      choices: ["វាកក", "វារលាយ", "វាបាត់", "វាធំឡើង"],
      correctAnswer: "វារលាយ",
      explanation:
        "ទឹកកកគឺជាទឹកនៅសភាពរឹង។ ពេលវាក្តៅ វាប្រែពីសភាពរឹងទៅសភាពរាវ។ ការប្រែនេះហៅថា ការរលាយ។",
    },
    {
      id: "science-khmer-3",
      question: "តើផ្កាយណាផ្តល់ពន្លឺ និងកម្តៅដល់ផែនដី?",
      choices: ["ព្រះច័ន្ទ", "ភពអង្គារ", "ព្រះអាទិត្យ", "ភពសុក្រ"],
      correctAnswer: "ព្រះអាទិត្យ",
      explanation:
        "ព្រះអាទិត្យជាផ្កាយដែលនៅជិតផែនដីបំផុត។ វាផ្តល់ពន្លឺ និងកម្តៅ ដែលជួយឱ្យជីវិតនៅលើផែនដីអាចរស់នៅបាន។",
    },
  ],
  english: [
    {
      id: "english-khmer-1",
      question: "ជ្រើសរើសប្រយោគដែលមានវេយ្យាករណ៍ត្រឹមត្រូវ។",
      choices: [
        "She go to school every day.",
        "She goes to school every day.",
        "She going to school every day.",
        "She gone to school every day.",
      ],
      correctAnswer: "She goes to school every day.",
      explanation:
        "នៅក្នុង present simple ពេល subject ជា 'she' កិរិយាសព្ទត្រូវបន្ថែម s ឬ es។ ដូច្នេះ 'She goes to school every day.' គឺត្រឹមត្រូវ។",
    },
    {
      id: "english-khmer-2",
      question: "ពាក្យណាមួយមានន័យដូច 'happy'?",
      choices: ["Sad", "Angry", "Joyful", "Tired"],
      correctAnswer: "Joyful",
      explanation:
        "ពាក្យមានន័យដូច គឺពាក្យដែលមានន័យស្រដៀងគ្នា។ 'Joyful' មានន័យស្រដៀងនឹង 'happy' ដូច្នេះវាជាចម្លើយត្រឹមត្រូវ។",
    },
    {
      id: "english-khmer-3",
      question: "ប្រយោគមួយណាបញ្ចប់ដោយសញ្ញាវណ្ណយុត្តិត្រឹមត្រូវ?",
      choices: [
        "What is your name.",
        "I like reading books?",
        "Please close the door.",
        "Wow that is amazing,",
      ],
      correctAnswer: "Please close the door.",
      explanation:
        "ប្រយោគប្រាប់ពត៌មានជាទូទៅបញ្ចប់ដោយសញ្ញាចុច។ ដូច្នេះ 'Please close the door.' គឺត្រឹមត្រូវ។",
    },
  ],
  khmer: [
    {
      id: "khmer-khmer-1",
      question: 'តើពាក្យមួយណាមានន័យថា "book"?',
      choices: ["សៀវភៅ", "តុ", "ទឹក", "ផ្ទះ"],
      correctAnswer: "សៀវភៅ",
      explanation:
        "'សៀវភៅ' មានន័យថា book។ ចម្លើយផ្សេងទៀតមានន័យថា តុ ទឹក និង ផ្ទះ។",
    },
    {
      id: "khmer-khmer-2",
      question: "តើពាក្យមួយណាជាឈ្មោះផ្លែឈើ?",
      choices: ["ស្វាយ", "កៅអី", "ប៊ិច", "ក្តារ"],
      correctAnswer: "ស្វាយ",
      explanation:
        "'ស្វាយ' គឺជាផ្លែឈើ។ ចម្លើយផ្សេងទៀតមានន័យថា កៅអី ប៊ិច និង ក្តារ។",
    },
    {
      id: "khmer-khmer-3",
      question: "តើពាក្យមួយណាមានន័យថា 'water'?",
      choices: ["ទឹក", "សៀវភៅ", "ផ្កា", "កៅអី"],
      correctAnswer: "ទឹក",
      explanation:
        "'ទឹក' មានន័យថា water។ ចម្លើយផ្សេងទៀតមានន័យថា សៀវភៅ ផ្កា និង កៅអី។",
    },
  ],
};

const bilingualQuizBank: QuizBank = {
  math: [
    {
      id: "math-bi-1",
      question: "What is 3/4 written as a decimal? / តើ 3/4 សរសេរជាទសភាគបានប៉ុន្មាន?",
      choices: ["0.25 / 0.25", "0.5 / 0.5", "0.75 / 0.75", "1.25 / 1.25"],
      correctAnswer: "0.75 / 0.75",
      explanation:
        "First divide 3 by 4 to get 0.75. Then match that decimal to the choices. / ដំបូង យក 3 ចែកនឹង 4 ដើម្បីបាន 0.75។ បន្ទាប់មក ជ្រើសរើសចម្លើយដែលត្រូវគ្នា។",
    },
    {
      id: "math-bi-2",
      question: "What is 6 × 7? / តើ 6 × 7 ស្មើប៉ុន្មាន?",
      choices: ["36 / 36", "42 / 42", "48 / 48", "56 / 56"],
      correctAnswer: "42 / 42",
      explanation:
        "Six groups of seven make forty-two. / 6 ក្រុមដែលក្រុមនីមួយៗមាន 7 ស្មើនឹង 42។",
    },
    {
      id: "math-bi-3",
      question: "What is 24 divided by 6? / តើ 24 ចែកនឹង 6 ស្មើប៉ុន្មាន?",
      choices: ["3 / 3", "4 / 4", "5 / 5", "6 / 6"],
      correctAnswer: "4 / 4",
      explanation:
        "24 can be split into 4 equal groups of 6. / 24 អាចបែងចែកជាក្រុមស្មើៗគ្នា 4 ក្រុម ដែលក្រុមនីមួយៗមាន 6។",
    },
  ],
  science: [
    {
      id: "science-bi-1",
      question:
        "Which part of a plant mainly absorbs water from the soil? / តើផ្នែកណានៃរុក្ខជាតិមានតួនាទីស្រូបទឹកពីដីជាចម្បង?",
      choices: ["Leaf / ស្លឹក", "Root / ឫស", "Flower / ផ្កា", "Fruit / ផ្លែ"],
      correctAnswer: "Root / ឫស",
      explanation:
        "Roots absorb water first, then the plant moves it upward. / ឫសស្រូបទឹកជាមុនសិន បន្ទាប់មករុក្ខជាតិដឹកនាំវាឡើងលើ។",
    },
    {
      id: "science-bi-2",
      question: "What happens to ice when it gets warm? / តើអ្វីកើតឡើងចំពោះទឹកកកនៅពេលវាក្តៅ?",
      choices: [
        "It freezes / វាកក",
        "It melts / វារលាយ",
        "It disappears / វាបាត់",
        "It grows / វាធំឡើង",
      ],
      correctAnswer: "It melts / វារលាយ",
      explanation:
        "Ice changes from solid to liquid when it gets warm. / ទឹកកកប្រែពីសភាពរឹងទៅសភាពរាវ នៅពេលវាក្តៅ។",
    },
    {
      id: "science-bi-3",
      question: "Which star gives Earth light and heat? / តើផ្កាយណាផ្តល់ពន្លឺ និងកម្តៅដល់ផែនដី?",
      choices: [
        "Moon / ព្រះច័ន្ទ",
        "Mars / ភពអង្គារ",
        "Sun / ព្រះអាទិត្យ",
        "Venus / ភពសុក្រ",
      ],
      correctAnswer: "Sun / ព្រះអាទិត្យ",
      explanation:
        "The Sun gives Earth light and heat. / ព្រះអាទិត្យផ្តល់ពន្លឺ និងកម្តៅដល់ផែនដី។",
    },
  ],
  english: [
    {
      id: "english-bi-1",
      question:
        "Choose the sentence with correct grammar. / ជ្រើសរើសប្រយោគដែលមានវេយ្យាករណ៍ត្រឹមត្រូវ។",
      choices: [
        "She go to school every day. / នាងទៅសាលារៀនរាល់ថ្ងៃ។",
        "She goes to school every day. / នាងទៅសាលារៀនរាល់ថ្ងៃ។",
        "She going to school every day. / នាងកំពុងទៅសាលារៀនរាល់ថ្ងៃ។",
        "She gone to school every day. / នាងបានទៅសាលារៀនរាល់ថ្ងៃ។",
      ],
      correctAnswer: "She goes to school every day. / នាងទៅសាលារៀនរាល់ថ្ងៃ។",
      explanation:
        "Use 'goes' with 'she' in the present simple tense. / ត្រូវប្រើ 'goes' ជាមួយ 'she' ក្នុង present simple tense។",
    },
    {
      id: "english-bi-2",
      question: "Which word means the same as happy? / ពាក្យណាមានន័យដូច happy?",
      choices: [
        "Sad / សោកសៅ",
        "Angry / ខឹង",
        "Joyful / រីករាយ",
        "Tired / ហត់នឿយ",
      ],
      correctAnswer: "Joyful / រីករាយ",
      explanation:
        "Joyful and happy have similar meanings. / Joyful និង happy មានន័យស្រដៀងគ្នា។",
    },
    {
      id: "english-bi-3",
      question:
        "Which sentence ends with correct punctuation? / ប្រយោគមួយណាបញ្ចប់ដោយសញ្ញាវណ្ណយុត្តិត្រឹមត្រូវ?",
      choices: [
        "What is your name. / តើឈ្មោះអ្នកអ្វី។",
        "I like reading books? / ខ្ញុំចូលចិត្តអានសៀវភៅ?",
        "Please close the door. / សូមបិទទ្វារ។",
        "Wow that is amazing, / វ៉ាវ អស្ចារ្យណាស់,",
      ],
      correctAnswer: "Please close the door. / សូមបិទទ្វារ។",
      explanation:
        "A statement usually ends with a full stop. / ប្រយោគប្រាប់ពត៌មានជាទូទៅបញ្ចប់ដោយសញ្ញាចុច។",
    },
  ],
  khmer: [
    {
      id: "khmer-bi-1",
      question: 'Which word means "book"? / តើពាក្យមួយណាមានន័យថា "book"?',
      choices: [
        "សៀវភៅ / Book",
        "តុ / Table",
        "ទឹក / Water",
        "ផ្ទះ / House",
      ],
      correctAnswer: "សៀវភៅ / Book",
      explanation:
        "The Khmer word 'សៀវភៅ' means book. / ពាក្យខ្មែរ 'សៀវភៅ' មានន័យថា book។",
    },
    {
      id: "khmer-bi-2",
      question: "Which word is a fruit? / តើពាក្យមួយណាជាផ្លែឈើ?",
      choices: [
        "ស្វាយ / Mango",
        "កៅអី / Chair",
        "ប៊ិច / Pen",
        "ក្តារ / Board",
      ],
      correctAnswer: "ស្វាយ / Mango",
      explanation:
        "Mango is a fruit. / ស្វាយគឺជាផ្លែឈើ។",
    },
    {
      id: "khmer-bi-3",
      question: "Which word means water? / តើពាក្យមួយណាមានន័យថា water?",
      choices: [
        "ទឹក / Water",
        "សៀវភៅ / Book",
        "ផ្កា / Flower",
        "កៅអី / Chair",
      ],
      correctAnswer: "ទឹក / Water",
      explanation:
        "The Khmer word 'ទឹក' means water. / ពាក្យខ្មែរ 'ទឹក' មានន័យថា water។",
    },
  ],
};

function isCurriculumCode(value: unknown): value is CurriculumCode {
  return typeof value === "string" && curricula.includes(value as CurriculumCode);
}

function isGradeLevel(value: unknown): value is GradeLevel {
  return typeof value === "string" && grades.includes(value as GradeLevel);
}

function isSubjectCode(value: unknown): value is SubjectCode {
  return typeof value === "string" && subjects.includes(value as SubjectCode);
}

function isLanguageMode(value: unknown): value is LanguageMode {
  return typeof value === "string" && languages.includes(value as LanguageMode);
}

function getQuizBank(language: LanguageMode) {
  if (language === "khmer") {
    return khmerQuizBank;
  }

  if (language === "bilingual") {
    return bilingualQuizBank;
  }

  return englishQuizBank;
}

function pickQuizQuestion(subject: SubjectCode, language: LanguageMode) {
  const questions = getQuizBank(language)[subject];
  const index = Math.floor(Math.random() * questions.length);
  return questions[index];
}

function isDifficultyLevel(value: unknown): value is DifficultyLevel {
  return typeof value === "string" && difficulties.includes(value as DifficultyLevel);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseGradeCode(value: unknown): GradeLevel | null {
  if (isGradeLevel(value)) {
    return value;
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    const candidate = `grade-${value}` as GradeLevel;
    return grades.includes(candidate) ? candidate : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();

    if (/^\d+$/.test(trimmed)) {
      const candidate = `grade-${trimmed}` as GradeLevel;
      return grades.includes(candidate) ? candidate : null;
    }

    const normalized = trimmed.replace(/\s+/g, "-");
    if (grades.includes(normalized as GradeLevel)) {
      return normalized as GradeLevel;
    }
  }

  return null;
}

function getGradeNumber(grade: GradeLevel) {
  return Number(grade.replace("grade-", ""));
}

function parseCurriculumCode(value: unknown): CurriculumCode | null {
  if (isCurriculumCode(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "cambridge") {
    return "cambridge";
  }

  if (normalized === "moeys" || normalized === "cambodia moeys" || normalized === "cambodia ministry of education") {
    return "moeys";
  }

  return null;
}

function parseSubjectCode(value: unknown): SubjectCode | null {
  if (isSubjectCode(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (subjects.includes(normalized as SubjectCode)) {
    return normalized as SubjectCode;
  }

  return null;
}

function parseLanguageCode(value: unknown): LanguageMode | null {
  if (isLanguageMode(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (languages.includes(normalized as LanguageMode)) {
    return normalized as LanguageMode;
  }

  return null;
}

function parseDifficultyCode(value: unknown): DifficultyLevel | null {
  if (isDifficultyLevel(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (difficulties.includes(normalized as DifficultyLevel)) {
    return normalized as DifficultyLevel;
  }

  return null;
}

function normalizeGenerateRequest(body: unknown): { data?: NormalizedGenerateRequest; error?: string } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a JSON object" };
  }

  const payload = body as Record<string, unknown>;
  const gradeCode = parseGradeCode(payload.grade);
  if (!gradeCode) {
    return { error: "Invalid or missing grade" };
  }

  const curriculumCode = parseCurriculumCode(payload.curriculum);
  if (!curriculumCode) {
    return { error: "Invalid or missing curriculum" };
  }

  const subjectCode = parseSubjectCode(payload.subject);
  if (!subjectCode) {
    return { error: "Invalid or missing subject" };
  }

  if (!getAvailableSubjectsBySelection(gradeCode, curriculumCode).includes(subjectCode)) {
    return { error: "Selected subject is not available for this grade and curriculum" };
  }

  const languageCode = parseLanguageCode(payload.language);
  if (!languageCode) {
    return { error: "Invalid or missing language" };
  }

  const difficultyCode = parseDifficultyCode(payload.difficulty);
  if (!difficultyCode) {
    return { error: "Invalid or missing difficulty" };
  }

  const topic = isNonEmptyString(payload.topic) ? payload.topic.trim() : undefined;

  return {
    data: {
      gradeCode,
      gradeNumber: getGradeNumber(gradeCode),
      curriculumCode,
      curriculumLabel: curriculumLabels[curriculumCode],
      subjectCode,
      subjectLabel: subjectLabels[subjectCode],
      languageCode,
      languageLabel: languageLabels[languageCode],
      difficultyCode,
      difficultyLabel: difficultyLabels[difficultyCode],
      topic,
    },
  };
}

function validateGeneratedQuizContent(value: unknown): value is GeneratedQuizContent {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (!isNonEmptyString(candidate.question) || !isNonEmptyString(candidate.correctAnswer) || !isNonEmptyString(candidate.explanation)) {
    return false;
  }

  if (!Array.isArray(candidate.choices) || candidate.choices.length !== 4) {
    return false;
  }

  const choices = candidate.choices.filter((choice): choice is string => isNonEmptyString(choice));
  if (choices.length !== 4) {
    return false;
  }

  return choices.includes(candidate.correctAnswer);
}

function buildGeneratedQuizResponse(
  request: NormalizedGenerateRequest,
  content: GeneratedQuizContent,
  id: string = crypto.randomUUID(),
): GeneratedQuizResponse {
  return {
    id,
    grade: request.gradeNumber,
    curriculum: request.curriculumLabel,
    subject: request.subjectLabel,
    language: request.languageLabel,
    difficulty: request.difficultyLabel,
    question: content.question.trim(),
    choices: content.choices.map((choice) => choice.trim()),
    correctAnswer: content.correctAnswer.trim(),
    explanation: content.explanation.trim(),
  };
}

function buildFallbackQuizResponse(request: NormalizedGenerateRequest): GeneratedQuizResponse {
  const fallbackQuestion = pickQuizQuestion(request.subjectCode, request.languageCode);

  return buildGeneratedQuizResponse(
    request,
    {
      question: fallbackQuestion.question,
      choices: fallbackQuestion.choices,
      correctAnswer: fallbackQuestion.correctAnswer,
      explanation: fallbackQuestion.explanation,
    },
    fallbackQuestion.id,
  );
}

async function generateQuizWithOpenAI(request: NormalizedGenerateRequest): Promise<GeneratedQuizResponse> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";
  const systemPrompt =
    "You create one student-friendly multiple choice quiz question. " +
    "Return JSON only. The question must be safe, age-appropriate, factually simple, and aligned to the requested curriculum, subject, grade, language, and difficulty. " +
    "Language is for presentation only. Keep the academic content aligned to the selected grade, curriculum, and subject. " +
    "If language is Khmer, write natural Khmer for students. If language is Bilingual, write Khmer and English side by side. " +
    "The explanation must teach the concept clearly in a few step-by-step sentences.";

  const userPrompt = JSON.stringify({
    instruction:
      "Return only this JSON object shape: { question, choices, correctAnswer, explanation }. choices must contain exactly 4 strings. correctAnswer must exactly match one of the choices. explanation must not be empty.",
    request: {
      grade: request.gradeNumber,
      curriculum: request.curriculumLabel,
      subject: request.subjectLabel,
      language: request.languageLabel,
      difficulty: request.difficultyLabel,
      topic: request.topic ?? null,
    },
  });

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "quiz_generation",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              question: { type: "string" },
              choices: {
                type: "array",
                minItems: 4,
                maxItems: 4,
                items: { type: "string" },
              },
              correctAnswer: { type: "string" },
              explanation: { type: "string" },
            },
            required: ["question", "choices", "correctAnswer", "explanation"],
          },
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed with status ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as { output_text?: string };
  if (!isNonEmptyString(data.output_text)) {
    throw new Error("OpenAI response did not include output_text");
  }

  const parsed = JSON.parse(data.output_text) as unknown;
  if (!validateGeneratedQuizContent(parsed)) {
    throw new Error("OpenAI returned invalid quiz JSON");
  }

  return buildGeneratedQuizResponse(request, parsed);
}

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "OPTIONS"],
  }),
);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/quiz/sample", (req, res) => {
  const { grade, curriculum, subject, language } = req.query;

  if (!isGradeLevel(grade)) {
    res.status(400).json({ ok: false, error: "Invalid or missing grade query parameter" });
    return;
  }

  if (!isCurriculumCode(curriculum)) {
    res.status(400).json({
      ok: false,
      error: "Invalid or missing curriculum query parameter",
    });
    return;
  }

  if (!isSubjectCode(subject)) {
    res.status(400).json({ ok: false, error: "Invalid or missing subject query parameter" });
    return;
  }

  if (!isLanguageMode(language)) {
    res.status(400).json({ ok: false, error: "Invalid or missing language query parameter" });
    return;
  }

  const question = pickQuizQuestion(subject, language);

  res.json({
    id: question.id,
    grade,
    curriculum,
    subject,
    language,
    question: question.question,
    choices: question.choices,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  } satisfies SampleQuizResponse);
});

app.post("/api/quiz/generate", async (req, res) => {
  const normalized = normalizeGenerateRequest(req.body);

  if (!normalized.data) {
    console.log(
      JSON.stringify({
        level: "warn",
        event: "quiz_generate_invalid_request",
        error: normalized.error,
        ts: new Date().toISOString(),
      }),
    );

    res.status(400).json({ ok: false, error: normalized.error });
    return;
  }

  const request = normalized.data;

  console.log(
    JSON.stringify({
      level: "info",
      event: "quiz_generate_started",
      grade: request.gradeNumber,
      curriculum: request.curriculumLabel,
      subject: request.subjectLabel,
      language: request.languageLabel,
      difficulty: request.difficultyLabel,
      topic: request.topic ?? null,
      ts: new Date().toISOString(),
    }),
  );

  try {
    const quiz = await generateQuizWithOpenAI(request);

    console.log(
      JSON.stringify({
        level: "info",
        event: "quiz_generate_success",
        id: quiz.id,
        model: process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
        ts: new Date().toISOString(),
      }),
    );

    res.json(quiz satisfies GeneratedQuizResponse);
  } catch (error) {
    const fallbackQuiz = buildFallbackQuizResponse(request);

    console.log(
      JSON.stringify({
        level: "warn",
        event: "quiz_generate_fallback",
        message: error instanceof Error ? error.message : "Unknown OpenAI generation error",
        fallbackId: fallbackQuiz.id,
        ts: new Date().toISOString(),
      }),
    );

    res.json(fallbackQuiz satisfies GeneratedQuizResponse);
  }
});

app.listen(port, () => {
  console.log(
    JSON.stringify({
      level: "info",
      event: "api_started",
      port,
      corsOrigin: allowedOrigin,
      ts: new Date().toISOString(),
    }),
  );
});
