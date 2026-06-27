import cors from "cors";
import express from "express";
import type {
  CurriculumCode,
  GradeLevel,
  LanguageMode,
  SampleQuizResponse,
  SubjectCode,
} from "@trustos-learn/shared";

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

type QuizBankQuestion = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
};

type QuizBank = Record<SubjectCode, QuizBankQuestion[]>;

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

app.use(express.json());
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "OPTIONS"],
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
