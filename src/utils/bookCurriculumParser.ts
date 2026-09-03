// Book and curriculum parser / generator helper for Weekly Reports

export interface ParsedLessonPlan {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri';
  topic: string;
  engage: string;
  study: string;
  activate: string;
  typing: string;
  quiz?: string;
}

export interface BookParseResult {
  title?: string;
  lessons: ParsedLessonPlan[];
  extractedText: string;
}

/**
 * Intelligent Lesson Plan Generator: converts any "Text book (Topic)" into
 * structured ESA (Engage, Study, Activate) format along with Computer Typing and Quiz assessment.
 */
export function generateActivityFromTopic(
  topicRaw: string,
  day: 'Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri' = 'Mon'
): { engage: string; study: string; activate: string; typing: string; quiz: string } {
  const topic = (topicRaw || '').trim();
  const lower = topic.toLowerCase();

  // Day specific context suffix or default quiz
  const isFriday = day === 'Fri';
  const defaultQuiz = isFriday 
    ? `End of Week Assessment: 5 review questions & practical demo on ${topic || 'weekly topics'}.`
    : '';

  // 1. Scratch / Block Coding
  if (lower.includes('scratch') || lower.includes('sprite') || lower.includes('block code') || lower.includes('កូដ') || lower.includes('animation')) {
    if (lower.includes('loop') || lower.includes('repeat') || lower.includes('forever')) {
      return {
        engage: 'Show dance party game with animated repeating background music on Scratch projector.',
        study: 'Explain control blocks: When Green Flag Clicked, Repeat (10), Forever loop, and Wait (1) sec.',
        activate: 'Students program a character doing an infinite dance rhythm animation on their computers.',
        typing: '- Practice typing Scratch block names and numbers',
        quiz: isFriday ? 'Weekly Quiz: How many times does repeat (5) run vs forever loop?' : ''
      };
    }
    if (lower.includes('variable') || lower.includes('score') || lower.includes('timer')) {
      return {
        engage: 'Play a demo game showing live Score and Countdown Timer on the screen.',
        study: 'Teach Data & Variables: Make a Variable "Score", change score by 1, and set timer to 30.',
        activate: 'Build a coin-collecting game where clicking the sprite increases the score variable.',
        typing: '- Practice typing variable names and numeric operators',
        quiz: isFriday ? 'Assessment: Explain the difference between set variable and change variable.' : ''
      };
    }
    if (lower.includes('game') || lower.includes('project') || lower.includes('maze')) {
      return {
        engage: 'Demonstrate completed Maze Runner game with collision detection and winning sound.',
        study: 'Explain Sensing blocks (touching color?), If-Then conditions, and Broadcast message.',
        activate: 'Students build and debug their own 2-level maze game on Scratch and share with classmates.',
        typing: '- Practice typing broadcast message keys',
        quiz: isFriday ? 'Practical Test: Showcase completed Scratch game and explain code blocks.' : ''
      };
    }
    return {
      engage: `Demonstrate interactive "${topic}" project on the classroom projector screen.`,
      study: `Explain core Scratch blocks, coordinates (X, Y), motion steps, and event triggers for ${topic}.`,
      activate: `Students create a new Scratch project applying ${topic} with custom costumes and sounds.`,
      typing: '- Practice typing Scratch block parameters and key triggers',
      quiz: defaultQuiz
    };
  }

  // 2. Micro:bit / Robotics / Hardware / IoT
  if (lower.includes('microbit') || lower.includes('micro:bit') || lower.includes('sensor') || lower.includes('robot') || lower.includes('led') || lower.includes('accelerometer') || lower.includes('compass')) {
    if (lower.includes('sensor') || lower.includes('shake') || lower.includes('accelerometer') || lower.includes('compass') || lower.includes('light')) {
      return {
        engage: 'Demonstrate shaking physical Micro:bit board to display a rolling dice number (1-6).',
        study: 'Explain Input blocks: On Shake, Accelerometer values, Light sensor readings, and Compass heading.',
        activate: 'Students build a digital electronic dice and spirit level meter on MakeCode simulator and hardware.',
        typing: '- Practice typing Microbit code commands and numbers',
        quiz: isFriday ? 'Hands-on Test: Flash code onto real Micro:bit board and verify sensor reaction.' : ''
      };
    }
    if (lower.includes('radio') || lower.includes('bluetooth') || lower.includes('communication')) {
      return {
        engage: 'Send a secret message from teacher\'s Micro:bit to flash an emoji on student\'s board.',
        study: 'Explain Radio Set Group, Radio Send String, and On Radio Received (String) event triggers.',
        activate: 'Pair students in teams to build a two-way wireless walkie-talkie messaging system.',
        typing: '- Practice typing radio message strings',
        quiz: isFriday ? 'Quiz: Why must two communicating Micro:bits use the same Radio Group ID?' : ''
      };
    }
    return {
      engage: 'Show physical Micro:bit flashing glowing LED icons and playing audio melodies.',
      study: `Teach MakeCode interface, Show Icon/Number blocks, and Button A/B pressed events for ${topic}.`,
      activate: `Students program and simulate "${topic}" on MakeCode and download HEX file to board.`,
      typing: '- Practice typing MakeCode block text',
      quiz: defaultQuiz
    };
  }

  // 3. HTML / CSS / Web Development
  if (lower.includes('html') || lower.includes('css') || lower.includes('web') || lower.includes('flexbox') || lower.includes('grid') || lower.includes('javascript') || lower.includes('js') || lower.includes('website')) {
    if (lower.includes('flexbox') || lower.includes('flex') || lower.includes('layout')) {
      return {
        engage: 'Inspect responsive navigation bar of a popular website using Chrome DevTools (F12).',
        study: 'Explain display: flex, justify-content (center, space-between), and align-items properties.',
        activate: 'Students code a responsive navigation header and 3-card product showcase with CSS Flexbox.',
        typing: '- Practice typing CSS syntax: display: flex; justify-content: center;',
        quiz: isFriday ? 'Test: What is the difference between justify-content and align-items?' : ''
      };
    }
    if (lower.includes('form') || lower.includes('input') || lower.includes('button')) {
      return {
        engage: 'Show interactive student registration form with validation and submit button.',
        study: 'Teach <form>, <input type="text|email|password">, <select>, <textarea>, and <button>.',
        activate: 'Build a styled contact feedback form with modern CSS border-radius and focus states.',
        typing: '- Practice typing HTML tags and attributes (<input type="submit">)',
        quiz: isFriday ? 'Quiz: Name 5 HTML input types and their appropriate use cases.' : ''
      };
    }
    return {
      engage: `Open Chrome browser and inspect real-world examples of "${topic}".`,
      study: `Explain syntax, structure, tags, attributes, and best practices for ${topic}.`,
      activate: `Students write HTML/CSS code in VS Code to build a responsive webpage section for ${topic}.`,
      typing: '- Practice typing web development symbols: < > { } ; : / = " "',
      quiz: defaultQuiz
    };
  }

  // 4. MS Word / Documentation / Khmer Unicode
  if (lower.includes('word') || lower.includes('khmer unicode') || lower.includes('unicode') || lower.includes('typing') || lower.includes('វាយអក្សរ') || lower.includes('ឯកសារ') || lower.includes('format') || lower.includes('letter')) {
    if (lower.includes('unicode') || lower.includes('khmer') || lower.includes('ខ្មែរ')) {
      return {
        engage: 'Display an official Khmer government/school letter with proper margins and headers.',
        study: 'Teach Khmer keyboard layout, Shift/AltGr consonant subscript keys (្), and font hierarchy (Khmer OS Battambang/Muol Light).',
        activate: 'Type and format a 1-page formal school permission request in Khmer Unicode with correct spelling.',
        typing: '- Practice Khmer Unicode keyboard speed typing (Target: 20-30 WPM)',
        quiz: isFriday ? 'Typing Speed Challenge: 5-minute timed Khmer Unicode document test.' : ''
      };
    }
    if (lower.includes('table') || lower.includes('border') || lower.includes('layout')) {
      return {
        engage: 'Show sample student grade report card and daily class timetable in Word.',
        study: 'Explain Insert Table, Rows & Columns, Merge Cells, Cell Padding, Table Borders, and Shading.',
        activate: 'Create a customized weekly class timetable table with styled headers and pastel colors.',
        typing: '- Practice typing tabular data and time formats',
        quiz: isFriday ? 'Practical: Create a 5-column table with merged headers and alternating row colors.' : ''
      };
    }
    return {
      engage: `Showcase a professional document sample featuring "${topic}".`,
      study: `Explain ribbon tools, font typography, paragraph alignment, line spacing, and page setup for ${topic}.`,
      activate: `Students create and format a professional Word document demonstrating ${topic}.`,
      typing: '- Practice typing speed and keyboard shortcut navigation (Ctrl+C, Ctrl+V, Ctrl+S, Ctrl+P)',
      quiz: defaultQuiz
    };
  }

  // 5. MS Excel / Spreadsheet / Formulas
  if (lower.includes('excel') || lower.includes('spreadsheet') || lower.includes('formula') || lower.includes('chart') || lower.includes('sum') || lower.includes('calculate') || lower.includes('ទិន្នន័យ') || lower.includes('គណនា')) {
    if (lower.includes('formula') || lower.includes('sum') || lower.includes('average') || lower.includes('if')) {
      return {
        engage: 'Calculate total sales and student grade averages in real-time in MS Excel.',
        study: 'Explain syntax of =SUM(), =AVERAGE(), =MIN(), =MAX(), and simple logical =IF() conditions.',
        activate: 'Build a student score sheet calculating total, average, and Pass/Fail status automatically.',
        typing: '- Practice typing Excel formula operators: = + - * / ( ) $',
        quiz: isFriday ? 'Assessment: Write the exact formula to calculate average for cells B2 through B10.' : ''
      };
    }
    if (lower.includes('chart') || lower.includes('graph') || lower.includes('filter')) {
      return {
        engage: 'Display visual 3D Column and Pie charts illustrating school enrollment growth.',
        study: 'Explain selecting data ranges, Insert Chart (Bar, Column, Pie), Data Labels, and Sort/Filter.',
        activate: 'Create colorful bar and pie charts from raw monthly attendance numbers.',
        typing: '- Practice numeric keypad typing and Excel data entry',
        quiz: isFriday ? 'Hands-on Test: Convert a raw data table into a styled Column chart with legend.' : ''
      };
    }
    return {
      engage: `Showcase interactive spreadsheet dashboard highlighting "${topic}".`,
      study: `Explain cell addressing (A1:B10), formatting numbers, grid styling, and functions for ${topic}.`,
      activate: `Students build an Excel worksheet applying ${topic} with automated calculations.`,
      typing: '- Practice numeric keypad 10-key typing accuracy',
      quiz: defaultQuiz
    };
  }

  // 6. PowerPoint / Canva / Graphic Design / Presentation
  if (lower.includes('powerpoint') || lower.includes('presentation') || lower.includes('canva') || lower.includes('slide') || lower.includes('design') || lower.includes('poster') || lower.includes('graphic')) {
    return {
      engage: 'Present a modern dynamic 5-slide presentation with smooth transitions and animations.',
      study: `Teach slide design principles: 6x6 rule, color harmony, typography hierarchy, and inserting media for ${topic}.`,
      activate: `Students design a 4-slide pitch deck or visual poster on "${topic}" using images and shapes.`,
      typing: '- Practice typing presentation headings and bullet points',
      quiz: isFriday ? 'Presentation Showcase: Each student delivers a 2-minute live slide demo.' : ''
    };
  }

  // 7. Computer Hardware / Windows OS / Network / Cybersecurity
  if (lower.includes('hardware') || lower.includes('computer') || lower.includes('windows') || lower.includes('folder') || lower.includes('ram') || lower.includes('cpu') || lower.includes('security') || lower.includes('internet') || lower.includes('password')) {
    return {
      engage: `Demonstrate real-world application and importance of "${topic}".`,
      study: `Explain core components, system concepts, safety guidelines, and practical workflows for ${topic}.`,
      activate: `Students perform hands-on configuration, file management, and system tasks on computer.`,
      typing: '- Practice typing technical computer vocabulary and commands',
      quiz: isFriday ? `Weekly Assessment: 5-question test on ${topic}.` : ''
    };
  }

  // 8. Python / General Programming
  if (lower.includes('python') || lower.includes('code') || lower.includes('function') || lower.includes('loop') || lower.includes('array') || lower.includes('string')) {
    return {
      engage: `Run a live Python script in terminal demonstrating "${topic}" with interactive inputs.`,
      study: `Explain Python syntax, indentation rules, keywords, data types, and functions for ${topic}.`,
      activate: `Students write and execute Python code in editor to solve 3 interactive programming challenges.`,
      typing: '- Practice typing Python code symbols and syntax keywords (def, return, if, else, print)',
      quiz: isFriday ? 'Coding Challenge: Write a Python function that solves a real-world calculation problem.' : ''
    };
  }

  // 9. Generic / Custom Subject (Fallback)
  return {
    engage: `Introduce "${topic}" with an interactive hook, review of previous lesson, and real-world example.`,
    study: `Teacher demonstrates step-by-step concepts, key formulas/rules, and standard procedures for "${topic}".`,
    activate: `Students work individually on computers and in pairs to complete practical exercises for "${topic}".`,
    typing: `- Practice typing specialized terms and vocabulary related to ${topic}`,
    quiz: defaultQuiz
  };
}

/**
 * Extracts structured lesson plans (Topic, Engage, Study, Activate, Typing, Quiz)
 * from unstructured text, markdown, CSV, or curriculum documents.
 */
export function parseBookTextToWeeklyPlans(rawText: string, defaultClassName: string = 'PC01'): BookParseResult {
  const days: ('Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri')[] = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri'];
  const text = rawText.trim();

  // Try JSON structure first if uploaded as JSON curriculum
  try {
    const json = JSON.parse(text);
    if (Array.isArray(json) && json.length > 0) {
      const lessons: ParsedLessonPlan[] = days.map((day, idx) => {
        const item = json[idx] || json[idx % json.length] || {};
        const topic = item.topic || item.title || item.lesson || `Chapter ${idx + 1}`;
        const auto = generateActivityFromTopic(topic, day);
        return {
          day,
          topic,
          engage: item.engage || item.warmup || item.hook || auto.engage,
          study: item.study || item.explanation || item.theory || auto.study,
          activate: item.activate || item.practice || item.activity || auto.activate,
          typing: item.typing || auto.typing,
          quiz: item.quiz || item.assessment || auto.quiz
        };
      });
      return { title: json[0]?.course || 'Imported Curriculum', lessons, extractedText: text };
    }
  } catch (e) {
    // Not json, continue with text/markdown/csv parser
  }

  // Check if text has day markers (e.g. Day 1, Monday, Day 2, etc.) or split by lines/paragraphs
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Find potential book or course title from first non-empty lines
  let bookTitle = '';
  if (lines.length > 0 && lines[0].length < 100) {
    bookTitle = lines[0].replace(/^[#*\-=_]+\s*/, '');
  }

  // Regex patterns to identify sections
  const dayRegex = /(?:day\s*(\d)|monday|tuesday|wednesday|thursday|friday|mon|tue|wed|thur|thu|fri|ថ្ងៃចន្ទ|ថ្ងៃអង្គារ|ថ្ងៃពុធ|ថ្ងៃព្រហស្បតិ៍|ថ្ងៃសុក្រ|មេរៀនទី|lesson\s*(\d+)|chapter\s*(\d+)|unit\s*(\d+))/i;

  // Split into chunks by day or chapters
  const dayChunks: { day: 'Mon' | 'Tue' | 'Wed' | 'Thur' | 'Fri'; lines: string[] }[] = days.map(d => ({
    day: d,
    lines: []
  }));

  let currentDayIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(dayRegex);

    if (match && i > 0) {
      const lower = line.toLowerCase();
      if (lower.includes('mon') || lower.includes('ចន្ទ') || lower.includes('day 1') || lower.includes('lesson 1')) {
        currentDayIdx = 0;
      } else if (lower.includes('tue') || lower.includes('អង្គារ') || lower.includes('day 2') || lower.includes('lesson 2')) {
        currentDayIdx = 1;
      } else if (lower.includes('wed') || lower.includes('ពុធ') || lower.includes('day 3') || lower.includes('lesson 3')) {
        currentDayIdx = 2;
      } else if (lower.includes('thu') || lower.includes('ព្រហស្បតិ៍') || lower.includes('day 4') || lower.includes('lesson 4')) {
        currentDayIdx = 3;
      } else if (lower.includes('fri') || lower.includes('សុក្រ') || lower.includes('day 5') || lower.includes('lesson 5')) {
        currentDayIdx = 4;
      } else if (currentDayIdx < 4) {
        currentDayIdx++;
      }
    }

    if (dayChunks[currentDayIdx]) {
      dayChunks[currentDayIdx].lines.push(line);
    }
  }

  // If text didn't match day markers, distribute lines evenly across 5 days
  const hasContent = dayChunks.some(c => c.lines.length > 0);
  if (!hasContent || dayChunks.filter(c => c.lines.length > 0).length <= 1) {
    // Distribute lines roughly in 5 sections
    const chunkSize = Math.max(1, Math.ceil(lines.length / 5));
    days.forEach((day, idx) => {
      dayChunks[idx].lines = lines.slice(idx * chunkSize, (idx + 1) * chunkSize);
    });
  }

  // Parse each chunk into (Topic, Engage, Study, Activate, Typing, Quiz)
  const parsedLessons: ParsedLessonPlan[] = days.map((day, idx) => {
    const chunk = dayChunks[idx]?.lines || [];
    const chunkText = chunk.join('\n');

    let topic = '';
    let engage = '';
    let study = '';
    let activate = '';
    let typing = '';
    let quiz = '';

    // Try finding specific tags: Topic:, Engage:, Study:, Activate:, Typing:, Quiz:
    const topicMatch = chunkText.match(/(?:topic|lesson|chapter|unit|text\s*book|ចំណងជើង|មេរៀន)\s*[:：\-]\s*([^\n\r]+)/i);
    const engageMatch = chunkText.match(/(?:engage|hook|warmup|warm-up|intro|ចាប់អារម្មណ៍)\s*[:：\-]\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
    const studyMatch = chunkText.match(/(?:study|learn|theory|teach|ពន្យល់|បង្រៀន)\s*[:：\-]\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
    const activateMatch = chunkText.match(/(?:activate|practice|hands-on|activity|អនុវត្ត|លំហាត់)\s*[:：\-]\s*([^\n\r]+(?:\n[^\n\r]+)?)/i);
    const typingMatch = chunkText.match(/(?:typing|keyboard|វាយអក្សរ)\s*[:：\-]\s*([^\n\r]+)/i);
    const quizMatch = chunkText.match(/(?:quiz|test|assessment|evaluation|សំណួរ|តេស្ត)\s*[:：\-]\s*([^\n\r]+)/i);

    if (topicMatch) topic = topicMatch[1].trim();
    if (engageMatch) engage = engageMatch[1].trim();
    if (studyMatch) study = studyMatch[1].trim();
    if (activateMatch) activate = activateMatch[1].trim();
    if (typingMatch) typing = typingMatch[1].trim();
    if (quizMatch) quiz = quizMatch[1].trim();

    // Fallback extraction if tags were not explicitly written
    if (!topic && chunk.length > 0) {
      topic = chunk[0].replace(/^[#*\-=_0-9.]+\s*/, '').slice(0, 90);
    }
    if (!topic) {
      topic = `Lesson ${idx + 1}: Computer Skills & Practical Exercise`;
    }

    // Auto generate missing activity items from topic
    const auto = generateActivityFromTopic(topic, day);

    if (!engage && chunk.length > 1) {
      engage = chunk[1].replace(/^[#*\-=_]+\s*/, '');
    }
    if (!engage) {
      engage = auto.engage;
    }

    if (!study && chunk.length > 2) {
      study = chunk[2].replace(/^[#*\-=_]+\s*/, '');
    }
    if (!study) {
      study = auto.study;
    }

    if (!activate && chunk.length > 3) {
      activate = chunk.slice(3, 5).join(' ').replace(/^[#*\-=_]+\s*/, '');
    }
    if (!activate) {
      activate = auto.activate;
    }

    if (!typing) {
      typing = auto.typing;
    }

    if (!quiz && idx === 4) {
      quiz = auto.quiz;
    }

    return {
      day,
      topic,
      engage,
      study,
      activate,
      typing,
      quiz
    };
  });

  return {
    title: bookTitle || `${defaultClassName} Computer & Curriculum Guide`,
    lessons: parsedLessons,
    extractedText: rawText
  };
}

/**
 * Built-in curriculum presets for instant generation if user wants quick subject templates
 */
export const CURRICULUM_PRESETS = [
  {
    id: 'scratch_microbit',
    name: 'Coding ( Scratch & Microbit )',
    defaultEnrollment: 30,
    timeSlot: '11:00-12:00 AM',
    plans: [
      {
        day: 'Mon' as const,
        topic: 'Scratch Basics - Sprite Animation & Motion Blocks',
        engage: 'Demonstrate moving sprite on stage with arrow keys.',
        study: 'Explain coordinates (X, Y), steps blocks, and turn degrees.',
        activate: 'Students code their own animated walking character on Scratch.',
        typing: '- Practice typing on Computer',
        quiz: ''
      },
      {
        day: 'Tue' as const,
        topic: 'Scratch Loops & Events - Forever & Repeat Blocks',
        engage: 'Show dance party game with repeating beat background.',
        study: 'Explain when Green Flag clicked, repeat (10), and forever loop.',
        activate: 'Build a dancing sprite rhythm loop with audio beats.',
        typing: '- Practice typing on Computer',
        quiz: ''
      },
      {
        day: 'Wed' as const,
        topic: 'Microbit LED Display & Button A/B Triggers',
        engage: 'Show real Microbit board flashing heart icon on button click.',
        study: 'Teach show icon, show string, and on button A/B pressed events.',
        activate: 'Flash Microbit simulator with smiling face & greeting name.',
        typing: '- Practice typing on Computer',
        quiz: ''
      },
      {
        day: 'Thur' as const,
        topic: 'Microbit Sensor Readings - Compass & Accelerometer (Shake)',
        engage: 'Shake Microbit to roll a random dice number 1 to 6.',
        study: 'Explain on shake event, pick random 1 to 6, and display number.',
        activate: 'Build an electronic digital dice project for board game.',
        typing: '- Practice typing on Computer',
        quiz: ''
      },
      {
        day: 'Fri' as const,
        topic: 'Weekly Project: Interactive Game & Milestone Review',
        engage: 'Showcase student games on main projector screen.',
        study: 'Review debugging strategies and code organization.',
        activate: 'Students test and play each other\'s Scratch & Microbit projects.',
        typing: '- Practice typing on Computer',
        quiz: 'Practice Test: graded hands-on assessment covering all Week skills.'
      }
    ]
  },
  {
    id: 'web_dev',
    name: 'Web Development (HTML/CSS & JavaScript)',
    defaultEnrollment: 28,
    timeSlot: '02:00-03:30 PM',
    plans: [
      {
        day: 'Mon' as const,
        topic: 'HTML5 Semantic Layout - Header, Nav, Main & Footer',
        engage: 'Inspect real website structure using Chrome DevTools.',
        study: 'Explain semantic elements: header, nav, section, article, and footer.',
        activate: 'Build a personal portfolio webpage wireframe.',
        typing: '- Practice HTML tags typing speed',
        quiz: ''
      },
      {
        day: 'Tue' as const,
        topic: 'CSS Flexbox Layout - Responsive Navigation Bar',
        engage: 'Show modern responsive navbars on mobile vs desktop.',
        study: 'Explain display: flex, justify-content: space-between, align-items: center.',
        activate: 'Style the portfolio navigation header with flexbox and hover transitions.',
        typing: '- Practice CSS syntax typing',
        quiz: ''
      },
      {
        day: 'Wed' as const,
        topic: 'CSS Grid System - Card Gallery & Bento Layout',
        engage: 'Show bento-box grid layouts used in modern web apps.',
        study: 'Explain grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) and gap.',
        activate: 'Build a responsive 3-column project showcase grid.',
        typing: '- Practice keyboard shortcuts',
        quiz: ''
      },
      {
        day: 'Thur' as const,
        topic: 'JavaScript DOM Manipulation - Event Listeners & Theme Switcher',
        engage: 'Toggle Dark/Light theme with one button click without page refresh.',
        study: 'Explain document.querySelector(), classList.toggle(), and addEventListener.',
        activate: 'Implement Dark Mode toggle and counter on user page.',
        typing: '- Practice JS syntax typing',
        quiz: ''
      },
      {
        day: 'Fri' as const,
        topic: 'Weekly Mini-Project Deployment & Showcase',
        engage: 'Present live website to classmates.',
        study: 'Review clean code guidelines, responsive tests, and SEO tags.',
        activate: 'Publish website to GitHub Pages or local web server.',
        typing: '- Speed typing evaluation',
        quiz: 'Weekly Quiz: 10 MCQ questions on HTML/CSS Flexbox & DOM events.'
      }
    ]
  },
  {
    id: 'computer_office',
    name: 'Computer Essentials (MS Word, Excel & Typing)',
    defaultEnrollment: 32,
    timeSlot: '08:00-09:30 AM',
    plans: [
      {
        day: 'Mon' as const,
        topic: 'Khmer Unicode Typing & Document Formatting in MS Word',
        engage: 'Display formal Khmer official letter layout.',
        study: 'Teach Khmer keyboard mapping, font hierarchy, line spacing and tabs.',
        activate: 'Format a formal school invitation letter in Khmer Unicode.',
        typing: '- Practice typing Khmer Unicode on Keyboard',
        quiz: ''
      },
      {
        day: 'Tue' as const,
        topic: 'Tables, Borders & Page Layout Design in Word',
        engage: 'Show sample school timetable and report card template.',
        study: 'Explain Insert Table, Cell Margins, Merge Cells, and Table Styles.',
        activate: 'Create a customized weekly class timetable table.',
        typing: '- Practice typing Khmer & English numbers',
        quiz: ''
      },
      {
        day: 'Wed' as const,
        topic: 'MS Excel Spreadsheet Fundamentals - Cells & Formulas',
        engage: 'Calculate student test averages in real-time in Excel.',
        study: 'Explain Rows, Columns, SUM(), AVERAGE(), MIN(), and MAX() formulas.',
        activate: 'Build a student grade calculator sheet with automated averages.',
        typing: '- Practice numerical keypad typing',
        quiz: ''
      },
      {
        day: 'Thur' as const,
        topic: 'Excel Conditional Formatting & Charts Generation',
        engage: 'Highlight failing grades automatically in Red and top grades in Green.',
        study: 'Teach Highlight Cells Rules and inserting Bar/Pie charts.',
        activate: 'Create visual attendance and grade charts from raw student data.',
        typing: '- Practice typing formula operators',
        quiz: ''
      },
      {
        day: 'Fri' as const,
        topic: 'Practical Evaluation & Speed Typing Test',
        engage: 'Conduct a live 5-minute typing speed challenge.',
        study: 'Review common Excel formula errors (#DIV/0, #VALUE) and fixes.',
        activate: 'Complete hands-on practical assignment combining Word & Excel.',
        typing: '- 5-minute official typing test (Target >25 WPM)',
        quiz: 'Practical Exam: Create styled invoice with formulas and print layout.'
      }
    ]
  }
];

/**
 * Suggested Topics library for quick selection
 */
export const POPULAR_TOPIC_SUGGESTIONS = [
  // Scratch & Coding
  'Scratch Animation & Sprite Motion (X, Y Coordinates)',
  'Scratch Loops & Events (Forever & Repeat Blocks)',
  'Scratch Variables & Score Counter Game',
  'Scratch Maze Runner & Collision Detection',
  'Micro:bit LED Heart Display & Button Triggers',
  'Micro:bit Accelerometer Shake & Digital Dice',
  'Micro:bit Wireless Radio Communication',
  // Web Development
  'HTML5 Semantic Structure & Headings/Paragraphs',
  'CSS Flexbox Responsive Navigation Bar',
  'CSS Grid Bento Layout & Cards Gallery',
  'JavaScript DOM Events & Interactive Button Counter',
  'HTML Form Elements & Contact Page Design',
  // MS Office & Computing
  'Khmer Unicode Typing & Formal Letter Formatting',
  'MS Word Tables, Borders & Timetable Design',
  'MS Excel Formulas (=SUM, =AVERAGE, =IF)',
  'MS Excel Bar & Pie Chart Data Visualization',
  'MS PowerPoint Slide Design & Transitions',
  'Canva Poster & Graphic Social Media Design',
  'Computer Hardware: CPU, RAM & Storage Essentials',
  'Windows File Management, Folders & Safe Internet'
];
