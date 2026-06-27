/**
 * ============================================================
 * AIT EXAM 2026 - Question Bank
 * File: js/questions.js
 *
 * NOTE: Answer keys (correctIndex) are used ONLY server-side
 * for score calculation. This file should NOT be exposed
 * directly in production. Use a backend-only answer key.
 *
 * For GitHub Pages (client-side only) demo:
 * Answers are obfuscated using index encoding.
 * ============================================================
 */

'use strict';

/**
 * QUESTION BANK
 * Each question:
 *  - id: unique identifier
 *  - subject: category label
 *  - text: question text
 *  - options: array of 4 answer strings
 *  - correctIndex: index of correct answer (0-based)
 *    [OBFUSCATED: encoded as char offset from 'a']
 *
 * correctIndex encoding: 'a'=0, 'b'=1, 'c'=2, 'd'=3
 */
const QUESTION_BANK = [
  // --- General Aptitude ---
  {
    id: 1, subject: 'Aptitude',
    text: 'If a train travels 360 km in 4 hours, what is its speed in km/h?',
    options: ['80 km/h', '90 km/h', '100 km/h', '72 km/h'],
    _c: 'b' // 90
  },
  {
    id: 2, subject: 'Aptitude',
    text: 'A shopkeeper sells an item at ₹480, making a 20% profit. What is the cost price?',
    options: ['₹360', '₹380', '₹400', '₹420'],
    _c: 'c' // 400
  },
  {
    id: 3, subject: 'Aptitude',
    text: 'What is 15% of 2400?',
    options: ['300', '340', '360', '380'],
    _c: 'c' // 360
  },
  {
    id: 4, subject: 'Aptitude',
    text: 'The ratio of boys to girls in a class is 3:2. If there are 30 students, how many are girls?',
    options: ['10', '12', '15', '18'],
    _c: 'b' // 12
  },
  {
    id: 5, subject: 'Aptitude',
    text: 'Find the average of: 12, 18, 24, 30, 36',
    options: ['20', '22', '24', '26'],
    _c: 'c' // 24
  },
  {
    id: 6, subject: 'Aptitude',
    text: 'If 6 workers complete a job in 12 days, how many workers can complete it in 9 days?',
    options: ['6', '8', '9', '10'],
    _c: 'b' // 8
  },
  {
    id: 7, subject: 'Aptitude',
    text: 'A car depreciates at 10% per year. If its current value is ₹1,00,000, what is its value after 2 years?',
    options: ['₹81,000', '₹82,000', '₹80,000', '₹79,000'],
    _c: 'a' // 81000
  },
  {
    id: 8, subject: 'Aptitude',
    text: 'What is the next number in the series: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '46'],
    _c: 'b' // 42
  },

  // --- Computer Fundamentals ---
  {
    id: 9, subject: 'Computer Basics',
    text: 'Which of the following is NOT an input device?',
    options: ['Keyboard', 'Mouse', 'Monitor', 'Scanner'],
    _c: 'c' // Monitor
  },
  {
    id: 10, subject: 'Computer Basics',
    text: 'What does CPU stand for?',
    options: ['Computer Processing Unit', 'Central Processing Unit', 'Core Processing Unit', 'Central Program Unit'],
    _c: 'b' // Central Processing Unit
  },
  {
    id: 11, subject: 'Computer Basics',
    text: 'Which memory is non-volatile and retains data even when power is off?',
    options: ['RAM', 'Cache Memory', 'ROM', 'Register Memory'],
    _c: 'c' // ROM
  },
  {
    id: 12, subject: 'Computer Basics',
    text: 'What is the full form of HTTP?',
    options: [
      'HyperText Transfer Protocol',
      'High Transfer Text Protocol',
      'HyperText Transmission Protocol',
      'Hyperlink Text Transfer Protocol'
    ],
    _c: 'a' // HyperText Transfer Protocol
  },
  {
    id: 13, subject: 'Computer Basics',
    text: '1 Gigabyte (GB) is equal to how many Megabytes (MB)?',
    options: ['512 MB', '1000 MB', '1024 MB', '2048 MB'],
    _c: 'c' // 1024 MB
  },
  {
    id: 14, subject: 'Computer Basics',
    text: 'Which generation of computers used transistors?',
    options: ['First', 'Second', 'Third', 'Fourth'],
    _c: 'b' // Second
  },
  {
    id: 15, subject: 'Computer Basics',
    text: 'What does the acronym "URL" stand for?',
    options: [
      'Uniform Resource Locator',
      'Universal Resource Link',
      'Unified Resource Locator',
      'Uniform Routing Link'
    ],
    _c: 'a' // Uniform Resource Locator
  },

  // --- Programming Concepts ---
  {
    id: 16, subject: 'Programming',
    text: 'Which of the following is a high-level programming language?',
    options: ['Machine Language', 'Assembly Language', 'Python', 'Binary Code'],
    _c: 'c' // Python
  },
  {
    id: 17, subject: 'Programming',
    text: 'What symbol is used for comments in Python?',
    options: ['//', '/* */', '#', '--'],
    _c: 'c' // #
  },
  {
    id: 18, subject: 'Programming',
    text: 'Which data structure follows Last In, First Out (LIFO) principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    _c: 'b' // Stack
  },
  {
    id: 19, subject: 'Programming',
    text: 'In Object-Oriented Programming, what is "encapsulation"?',
    options: [
      'Hiding data and methods within a class',
      'Inheriting properties from another class',
      'Writing multiple functions with the same name',
      'Breaking code into smaller functions'
    ],
    _c: 'a' // Hiding data
  },
  {
    id: 20, subject: 'Programming',
    text: 'What is the output of: print(2 ** 3) in Python?',
    options: ['6', '8', '9', '5'],
    _c: 'b' // 8
  },
  {
    id: 21, subject: 'Programming',
    text: 'Which of the following is NOT a programming language?',
    options: ['Java', 'Python', 'Linux', 'C++'],
    _c: 'c' // Linux
  },
  {
    id: 22, subject: 'Programming',
    text: 'What is a variable in programming?',
    options: [
      'A fixed value that cannot change',
      'A named storage location to hold data',
      'A function that returns a value',
      'A loop that repeats code'
    ],
    _c: 'b' // Named storage
  },

  // --- Web Technologies ---
  {
    id: 23, subject: 'Web Technology',
    text: 'Which HTML tag is used to create a hyperlink?',
    options: ['<link>', '<a>', '<href>', '<url>'],
    _c: 'b' // <a>
  },
  {
    id: 24, subject: 'Web Technology',
    text: 'What does CSS stand for?',
    options: [
      'Computer Style Sheets',
      'Cascading Style Sheets',
      'Creative Style System',
      'Coloring Style Sheets'
    ],
    _c: 'b' // Cascading Style Sheets
  },
  {
    id: 25, subject: 'Web Technology',
    text: 'Which HTTP method is used to submit form data?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    _c: 'b' // POST
  },
  {
    id: 26, subject: 'Web Technology',
    text: 'What is the correct HTML element for the largest heading?',
    options: ['<h6>', '<h3>', '<h1>', '<heading>'],
    _c: 'c' // <h1>
  },
  {
    id: 27, subject: 'Web Technology',
    text: 'Which language is used for styling web pages?',
    options: ['HTML', 'JavaScript', 'CSS', 'Python'],
    _c: 'c' // CSS
  },
  {
    id: 28, subject: 'Web Technology',
    text: 'What does "responsive design" mean in web development?',
    options: [
      'The website loads quickly',
      'The website works only on mobile',
      'The website adapts to different screen sizes',
      'The website has animations'
    ],
    _c: 'c' // Adapts to screen sizes
  },

  // --- Networking ---
  {
    id: 29, subject: 'Networking',
    text: 'What is the purpose of a DNS server?',
    options: [
      'To assign IP addresses',
      'To translate domain names to IP addresses',
      'To block malicious websites',
      'To store website files'
    ],
    _c: 'b' // Translate domain names
  },
  {
    id: 30, subject: 'Networking',
    text: 'Which protocol is used for secure data transmission over the internet?',
    options: ['HTTP', 'FTP', 'HTTPS', 'SMTP'],
    _c: 'c' // HTTPS
  },
  {
    id: 31, subject: 'Networking',
    text: 'What does LAN stand for?',
    options: [
      'Large Area Network',
      'Local Area Network',
      'Limited Access Network',
      'Logical Area Network'
    ],
    _c: 'b' // Local Area Network
  },
  {
    id: 32, subject: 'Networking',
    text: 'What device connects multiple networks and routes data between them?',
    options: ['Switch', 'Hub', 'Router', 'Modem'],
    _c: 'c' // Router
  },
  {
    id: 33, subject: 'Networking',
    text: 'What is the maximum transmission unit (MTU) of a standard Ethernet frame?',
    options: ['512 bytes', '1024 bytes', '1500 bytes', '2048 bytes'],
    _c: 'c' // 1500 bytes
  },

  // --- Database ---
  {
    id: 34, subject: 'Database',
    text: 'What does SQL stand for?',
    options: [
      'Structured Query Language',
      'Simple Query Language',
      'Sequential Query Logic',
      'Standard Query Language'
    ],
    _c: 'a' // Structured Query Language
  },
  {
    id: 35, subject: 'Database',
    text: 'Which SQL command is used to retrieve data from a table?',
    options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
    _c: 'c' // SELECT
  },
  {
    id: 36, subject: 'Database',
    text: 'What is a primary key in a database?',
    options: [
      'A key that can have duplicate values',
      'A key that uniquely identifies each record in a table',
      'A key used to join two tables',
      'A key that allows NULL values'
    ],
    _c: 'b' // Uniquely identifies records
  },
  {
    id: 37, subject: 'Database',
    text: 'Which of the following is a NoSQL database?',
    options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'],
    _c: 'c' // MongoDB
  },

  // --- Logical Reasoning ---
  {
    id: 38, subject: 'Reasoning',
    text: 'If APPLE is coded as ELPPA, how is MANGO coded?',
    options: ['OGNAM', 'OGNAME', 'OGNMA', 'OGMAN'],
    _c: 'a' // OGNAM (reversed)
  },
  {
    id: 39, subject: 'Reasoning',
    text: 'A is taller than B. B is taller than C. Who is the shortest?',
    options: ['A', 'B', 'C', 'Cannot determine'],
    _c: 'c' // C
  },
  {
    id: 40, subject: 'Reasoning',
    text: 'Complete the analogy: Book : Library :: Painting : ?',
    options: ['Museum', 'Artist', 'Canvas', 'Gallery'],
    _c: 'd' // Gallery
  },
  {
    id: 41, subject: 'Reasoning',
    text: 'What is the odd one out: Laptop, Desktop, Tablet, Keyboard?',
    options: ['Laptop', 'Desktop', 'Tablet', 'Keyboard'],
    _c: 'd' // Keyboard (input device, not a computer)
  },
  {
    id: 42, subject: 'Reasoning',
    text: 'If 5 January 2026 is a Monday, what day is 12 January 2026?',
    options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
    _c: 'b' // Monday
  },

  // --- General Knowledge / Tech ---
  {
    id: 43, subject: 'General Knowledge',
    text: 'Who is known as the father of the World Wide Web?',
    options: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Vint Cerf'],
    _c: 'c' // Tim Berners-Lee
  },
  {
    id: 44, subject: 'General Knowledge',
    text: 'Which company developed the Android operating system?',
    options: ['Apple', 'Microsoft', 'Google', 'Samsung'],
    _c: 'c' // Google
  },
  {
    id: 45, subject: 'General Knowledge',
    text: 'What does AI stand for in the context of technology?',
    options: [
      'Automated Intelligence',
      'Artificial Intelligence',
      'Augmented Interface',
      'Applied Integration'
    ],
    _c: 'b' // Artificial Intelligence
  },
  {
    id: 46, subject: 'General Knowledge',
    text: 'Which programming language is primarily used for iOS app development?',
    options: ['Java', 'Kotlin', 'Swift', 'Python'],
    _c: 'c' // Swift
  },
  {
    id: 47, subject: 'General Knowledge',
    text: 'What does "cloud computing" refer to?',
    options: [
      'Computing done in high-altitude data centers',
      'Storing and accessing data over the internet instead of local hardware',
      'Using weather forecasting software',
      'Computing with minimal power consumption'
    ],
    _c: 'b' // Internet-based storage
  },
  {
    id: 48, subject: 'General Knowledge',
    text: 'Which of the following is an example of open-source software?',
    options: ['Microsoft Windows', 'Adobe Photoshop', 'Linux', 'macOS'],
    _c: 'c' // Linux
  },
  {
    id: 49, subject: 'General Knowledge',
    text: 'What is the primary function of an operating system?',
    options: [
      'To provide internet access',
      'To manage hardware and software resources',
      'To run only one application at a time',
      'To protect against viruses only'
    ],
    _c: 'b' // Manage hardware and software
  },
  {
    id: 50, subject: 'General Knowledge',
    text: 'Which technology is commonly used for wireless communication between devices over short distances?',
    options: ['Wi-Fi', 'Bluetooth', '4G LTE', 'Ethernet'],
    _c: 'b' // Bluetooth
  },
];

/* ============================================================
   QUESTION UTILITIES
   ============================================================ */

/**
 * Decode the obfuscated correct index
 * @param {string} encoded - 'a' | 'b' | 'c' | 'd'
 * @returns {number} 0-3
 */
function decodeCorrectIndex(encoded) {
  return encoded.charCodeAt(0) - 'a'.charCodeAt(0);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} arr
 * @returns {Array} new shuffled array
 */
function shuffleArray(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Prepare randomized questions for the exam
 * - Randomizes question order
 * - Randomizes option order per question
 * - Tracks new correct index after shuffling
 *
 * @param {number} count - How many questions to use
 * @returns {{ questions: Array, optionMaps: Array }}
 */
function prepareExamQuestions(count = 50) {
  // Shuffle all questions and take 'count' of them
  const shuffled = shuffleArray(QUESTION_BANK).slice(0, count);

  const preparedQuestions = [];
  const optionMaps = []; // Maps new option index to original option index

  shuffled.forEach((q) => {
    const originalCorrectIndex = decodeCorrectIndex(q._c);

    // Create index map [0,1,2,3] and shuffle it
    const indices = [0, 1, 2, 3];
    const shuffledIndices = shuffleArray(indices);

    // Build new options array
    const newOptions = shuffledIndices.map(i => q.options[i]);

    // Find new position of correct answer
    const newCorrectIndex = shuffledIndices.indexOf(originalCorrectIndex);

    preparedQuestions.push({
      id: q.id,
      subject: q.subject,
      text: q.text,
      options: newOptions,
      // NOTE: correctIndex included for client-side scoring (GitHub Pages demo)
      // In production, remove this and do scoring server-side only
      correctIndex: newCorrectIndex,
    });

    optionMaps.push(shuffledIndices);
  });

  return { questions: preparedQuestions, optionMaps };
}

/**
 * Calculate score from submitted answers
 * @param {Array} questions - Prepared questions array
 * @param {Object} answers - { [questionIndex]: selectedOptionIndex }
 * @returns {{ score: number, correct: number, wrong: number, skipped: number, percentage: number }}
 */
function calculateExamScore(questions, answers) {
  let correct = 0;
  let wrong = 0;
  let skipped = 0;

  questions.forEach((q, idx) => {
    const answer = answers[idx];
    if (answer === undefined || answer === null) {
      skipped++;
    } else if (answer === q.correctIndex) {
      correct++;
    } else {
      wrong++;
    }
  });

  const attempted = correct + wrong;
  const percentage = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;

  return { score: correct, correct, wrong, skipped, attempted, percentage };
}

/**
 * Determine scholarship based on percentage
 * @param {number} percentage
 * @returns {string}
 */
function getScholarship(percentage) {
  if (percentage >= 90) return 'FREE Course + FREE Internship + FREE Certificate';
  if (percentage >= 75) return '50% Scholarship + FREE Internship';
  return '25% Scholarship + 50% Internship Offer';
}
