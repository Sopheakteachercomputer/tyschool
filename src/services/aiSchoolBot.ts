import { storageService } from './storageService';
import { User } from '../types';

export interface BotResponse {
  text: string;
  suggestions?: string[];
}

/**
 * Intelligent School AI Bot Assistant
 * Provides comprehensive knowledge on Ta Yaek Learning Center / School & User Communications
 */
export function generateBotReply(userPrompt: string, currentUser?: User | null): BotResponse {
  const q = userPrompt.trim().toLowerCase();
  const school = storageService.getSchoolProfile();
  const students = storageService.getStudents();
  const teachers = storageService.getTeachers();
  const classes = storageService.getClasses();
  const announcements = storageService.getAnnouncements();
  const users = storageService.getUsers();

  const isEn = /^[a-zA-Z0-9\s.,?!'"\-_/]+$/.test(userPrompt.trim()) || 
    q.includes('how') || q.includes('what') || q.includes('who') || q.includes('where') || q.includes('when') || 
    q.includes('teacher') || q.includes('student') || q.includes('schedule') || q.includes('chat') || q.includes('fee') || q.includes('office');

  // 1. Chat with All Users & Direct Messaging (ការជជែកជាមួយអ្នកទាំងអស់ & ផ្ញើសារផ្ទាល់)
  if (q.includes('chat with all users') || q.includes('chat') || q.includes('ជជែក') || q.includes('ផ្ញើសារ') || q.includes('message') || q.includes('ទាក់ទង') || q.includes('contact') || q.includes('community') || q.includes('សហគមន៍')) {
    if (isEn) {
      return {
        text: `💬 **Communication & Chat System Guide (Chat with All Users):**\n\n` +
          `Our school communication center features **3 powerful communication channels**:\n\n` +
          `1. 🤖 **AI School Assistant (This Bot):** Available 24/7 to instantly answer questions on schedules, tuition & KHQR, teachers, leaves, and school regulations.\n` +
          `2. 👥 **School Community (All School Chat):** A public broadcast channel visible to all teachers, students, and parents for general announcements and discussions.\n` +
          `3. 💬 **Direct Messages (1-on-1 Private Chat):** Directly message any specific user across the school:\n` +
          `   - 👑 **School Administration & Principal:** For official requests, paperwork, and meetings.\n` +
          `   - 👨‍🏫 **Teachers & Class Advisors:** To discuss learning progress, homework, and attendance.\n` +
          `   - 👨‍👩‍👧 **Parents & Students:** For direct parent-teacher communications.\n\n` +
          `💡 *Click the tabs at the top: **🤖 AI Bot**, **👥 School Community**, or **💬 Direct Chat** to switch anytime!*`,
        suggestions: ['List all teachers and contacts', 'How to pay tuition via KHQR?', 'Come to the office hours', 'Class timetable']
      };
    }

    return {
      text: `💬 **ការណែនាំអំពីប្រព័ន្ធជជែក & ផ្ញើសារ (Chat with All Users):**\n\n` +
        `មជ្ឈមណ្ឌលទំនាក់ទំនងសាលារៀនយើង មាន **៣ បណ្តាញទំនាក់ទំនងចម្បង**៖\n\n` +
        `១. 🤖 **ជំនួយការ AI សាលារៀន (AI Bot នេះ):** ឆ្លើយសំណួរស្វ័យប្រវត្ត ២៤/៧ អំពីកាលវិភាគ ថ្លៃសិក្សា គ្រូបង្រៀន ច្បាប់សាលា និងការិយាល័យរដ្ឋបាល។\n` +
        `២. 👥 **សាលារៀនរួម (All School Community):** បន្ទប់ជជែកសាធារណៈរួមសម្រាប់លោកគ្រូ អ្នកគ្រូ សិស្ស និងអាណាព្យាបាលទាំងអស់អាចមើល និងចូលរួមពិភាក្សាបាន។\n` +
        `៣. 💬 **ការជជែកផ្ទាល់ (Direct Messages):** ផ្ញើសារផ្ទាល់ជាលក្ខណៈបុគ្គល (១ លើ ១) ទៅកាន់៖\n` +
        `   - 👑 **គណៈគ្រប់គ្រង & អភិបាលសាលា (School Admin):** សុំច្បាប់ បង់ថ្លៃសិក្សា សុំលិខិតបញ្ជាក់ ឬសុំជួបផ្ទាល់។\n` +
        `   - 👨‍🏫 **លោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់:** សាកសួរការសិក្សា វត្តមាន និងកិច្ចការផ្ទះ។\n` +
        `   - 👨‍👩‍👧 **អាណាព្យាបាល & សិស្ស:** ទំនាក់ទំនងគ្នាទៅវិញទៅមកដោយសុវត្ថិភាព។\n\n` +
        `💡 *លោកអ្នកអាចចុចលើផ្ទាំងខាងលើ៖ **🤖 ជំនួយការ AI**, **👥 សាលារៀនរួម**, ឬ **💬 ជជែកផ្ទាល់** ដើម្បីប្តូរផ្ទាំងបានគ្រប់ពេល!*`,
      suggestions: ['បញ្ជីឈ្មោះលោកគ្រូអ្នកគ្រូ', 'ព័ត៌មានថ្លៃសិក្សា & KHQR', 'ម៉ោងធ្វើការការិយាល័យរដ្ឋបាល', 'កាលវិភាគសិក្សា']
    };
  }

  // 2. Timetable / Schedule (កាលវិភាគ)
  if (q.includes('កាលវិភាគ') || q.includes('schedule') || q.includes('timetable') || q.includes('ម៉ោងរៀន') || q.includes('ម៉ោងចូលរៀន')) {
    if (isEn) {
      return {
        text: `📅 **School Study Schedule & Timetable (${school.nameEnglish || school.nameKhmer}):**\n\n` +
          `• 🌅 **Morning Shift:** 07:00 AM – 11:15 AM\n` +
          `• 🌇 **Afternoon Shift:** 01:15 PM – 05:00 PM\n` +
          `• 🗓️ **School Days:** Monday to Friday (Weekends Off)\n` +
          `• 🔔 **Assembly:** Please arrive 15 minutes before class for flag ceremony and classroom preparation.\n\n` +
          `💡 *View class-specific timetables in the "Timetable" navigation menu.*`,
        suggestions: ['List all teachers and contacts', 'How to pay tuition via KHQR?', 'Classroom cleaning duty schedule']
      };
    }

    return {
      text: `📅 **កាលវិភាគសិក្សាសាលារៀន ${school.nameKhmer} (${school.nameEnglish}):**\n\n` +
        `• **វេនព្រឹក:** ០៧:០០ ព្រឹក - ១១:១៥ ព្រឹក\n` +
        `• **វេនរសៀល:** ០១:១៥ រសៀល - ០៥:០០ ល្ងាច\n` +
        `• **ថ្ងៃសិក្សា:** ថ្ងៃច័ន្ទ ដល់ ថ្ងៃសុក្រ (សៅរ៍-អាទិត្យ សម្រាក)\n` +
        `• **ការចូលរៀន:** សូមអញ្ជើញមកដល់សាលាមុន ១៥ នាទី ដើម្បីគោរពទង់ជាតិ និងរៀបចំវេនសម្អាត។\n\n` +
        `💡 *លោកអ្នកអាចចូលមើលកាលវិភាគលម្អិតតាមថ្នាក់ក្នុងផ្ទាំង "កាលវិភាគ (Timetable)"។*`,
      suggestions: ['តើមានគ្រូបង្រៀនណាខ្លះ?', 'តម្លៃសិក្សា & ការបង់ប្រាក់', 'កាលវិភាគវេនសម្អាត']
    };
  }

  // 3. Tuition / Payment / KHQR (ថ្លៃសិក្សា & ការបង់ប្រាក់)
  if (q.includes('ថ្លៃសិក្សា') || q.includes('បង់ប្រាក់') || q.includes('លុយ') || q.includes('fee') || q.includes('payment') || q.includes('khqr') || q.includes('bakong') || q.includes('វិក្កយបត្រ')) {
    if (isEn) {
      return {
        text: `💰 **Tuition & Payment Information (Bakong KHQR):**\n\n` +
          `• **Account Name:** \`${school.paymentQrAccountName || 'RIN SOPHEAK'}\`\n` +
          `• **Payment System:** \`${school.paymentQrBankName || 'Bakong KHQR'}\`\n` +
          `• **Account ID:** \`${school.paymentQrAccountNumber || 'rinsopheak@bakong'}\`\n` +
          `• **Currency:** ${school.paymentQrCurrency || 'KHR'}\n\n` +
          `📲 **How to Pay:**\n` +
          `1. Navigate to the **"Fees & Finance"** tab in the sidebar.\n` +
          `2. Click **"Scan KHQR"** or select your invoice to view the dynamic QR Code.\n` +
          `3. Open your mobile banking app (Bakong, ABA, ACLEDA, etc.) and scan to pay.\n` +
          `4. Include your Student ID and Name in the payment remark for instant verification.\n\n` +
          `📞 *Finance Support Phone:* \`${school.phone}\``,
        suggestions: ['Come to the office hours', 'How to request a leave of absence?', 'Teacher list and contacts']
      };
    }

    return {
      text: `💰 **ព័ត៌មានថ្លៃសិក្សា & ការទូទាត់ប្រាក់ (Tuition & Fees):**\n\n` +
        `• **គណនីទទួលប្រាក់:** ${school.paymentQrAccountName || 'RIN SOPHEAK'}\n` +
        `• **ប្រព័ន្ធទូទាត់:** ${school.paymentQrBankName || 'Bakong KHQR'}\n` +
        `• **លេខគណនី/Account:** \`${school.paymentQrAccountNumber || 'rinsopheak@bakong'}\`\n` +
        `• **រូបិយប័ណ្ណ:** ${school.paymentQrCurrency || 'KHR'}\n\n` +
        `📲 **របៀបបង់ប្រាក់:**\n` +
        `១. ចូលទៅកាន់ផ្ទាំង **"ថ្លៃសិក្សា (Fees & Finance)"**\n` +
        `២. ចុចលើប៊ូតុង **"ស្កេន KHQR"** ឬជ្រើសរើសវិក្កយបត្រ\n` +
        `៣. បញ្ចូលលេខកូដសិស្ស និងឈ្មោះក្នុង Remark ពេលផ្ទេរប្រាក់។\n\n` +
        `📌 *ប្រសិនបើមានចម្ងល់បន្ថែម សូមទាក់ទងការិយាល័យគណនេយ្យតាមរយៈទូរស័ព្ទ៖ ${school.phone}*`,
      suggestions: ['ពិនិត្យវិក្កយបត្រមិនទាន់បង់', 'របៀបស្នើសុំអាហារូបករណ៍', 'កាលវិភាគសិក្សា']
    };
  }

  // 4. Office & Administration Visit / Come to the Office (ការិយាល័យរដ្ឋបាលសាលា & ជួបផ្ទាល់)
  if (q.includes('office') || q.includes('ការិយាល័យ') || q.includes('រដ្ឋបាល') || q.includes('ជួបផ្ទាល់') || q.includes('come to the office') || q.includes('ជួបនាយក') || q.includes('ជួបគ្រូ') || q.includes('appointment')) {
    if (isEn) {
      return {
        text: `🏢 **School Administration Office Information (Come to the Office):**\n\n` +
          `• **Location:** Central Administration Building (Ground Floor), ${school.nameEnglish || school.nameKhmer}\n` +
          `• **Office Working Hours:**\n` +
          `  - 🌅 Morning Shift: **07:30 AM – 11:30 AM**\n` +
          `  - 🌇 Afternoon Shift: **01:30 PM – 05:00 PM**\n` +
          `  - 🗓️ Working Days: **Monday to Friday** (Closed on Weekends & Public Holidays)\n\n` +
          `📋 **Services Available at the Office:**\n` +
          `1. 📄 **Official Study Certificates & Academic Transcripts**\n` +
          `2. 💰 **Tuition Payment, Official Receipts & Bakong KHQR Verification**\n` +
          `3. 📝 **New Student Enrollment & School Transfer Procedures**\n` +
          `4. 🤝 **In-Person Appointments with School Principal & Head Teachers**\n` +
          `5. 🛠️ **Account & Technical Support**\n\n` +
          `📞 **Contact Phone:** \`${school.phone}\` | ✉️ **Email:** \`${school.email}\`\n\n` +
          `💡 *You are warmly welcome to visit our administration office during working hours or message us directly here!*`,
        suggestions: ['How to pay tuition via KHQR?', 'Teacher directory and contacts', 'Class timetable']
      };
    }

    return {
      text: `🏢 **ព័ត៌មានការិយាល័យរដ្ឋបាលសាលារៀន (School Administration Office):**\n\n` +
        `• **ទីតាំង:** អគាររដ្ឋបាលកណ្តាល (ជាន់ផ្ទាល់ដី) នៃ ${school.nameKhmer}\n` +
        `• **ម៉ោងបំពេញការងារ:**\n` +
        `  - 🌅 វេនព្រឹក: **០៧:៣០ ព្រឹក ដល់ ១១:៣០ ព្រឹក**\n` +
        `  - 🌇 វេនរសៀល: **០១:៣០ រសៀល ដល់ ០៥:០០ ល្ងាច**\n` +
        `  - 🗓️ ថ្ងៃធ្វើការ: **ថ្ងៃច័ន្ទ ដល់ ថ្ងៃសុក្រ** (សៅរ៍-អាទិត្យ និងបុណ្យជាតិ សម្រាក)\n\n` +
        `📋 **សេវាកម្ម និងកិច្ចការដែលអាចមកទាក់ទងផ្ទាល់:**\n` +
        `១. 📄 **ចេញលិខិតបញ្ជាក់ការសិក្សា & ព្រឹត្តិបត្រពិន្ទុផ្លូវការ**\n` +
        `២. 💰 **ការបង់ថ្លៃសិក្សា ចេញបង្កាន់ដៃបង់ប្រាក់ & បញ្ហា KHQR**\n` +
        `៣. 📝 **ការចុះឈ្មោះចូលរៀនថ្មី & ផ្ទេរការសិក្សា**\n` +
        `៤. 🤝 **ការណាត់ជួបផ្ទាល់ជាមួយនាយកសាលា ឬលោកគ្រូ-អ្នកគ្រូបន្ទុកថ្នាក់**\n` +
        `៥. 🛠️ **ការប្រឹក្សា និងដោះស្រាយបញ្ហាគណនី/បច្ចេកវិទ្យា**\n\n` +
        `📞 **លេខទំនាក់ទំនងរហ័ស:** \`${school.phone}\` | ✉️ **អ៊ីមែល:** \`${school.email}\`\n\n` +
        `💡 *លោកអ្នកអាចអញ្ជើញមកកាន់ការិយាល័យរដ្ឋបាលសាលាដោយផ្ទាល់ក្នុងម៉ោងធ្វើការខាងលើ ឬផ្ញើសារក្នុងប្រព័ន្ធនេះ!*`,
      suggestions: ['តើថ្លៃសិក្សាបង់របៀបណា?', 'បញ្ជីគ្រូបង្រៀន & លេខទូរស័ព្ទ', 'កាលវិភាគសិក្សា']
    };
  }

  // 5. Leave Request / Absenteeism (ការសុំច្បាប់)
  if (q.includes('សុំច្បាប់') || q.includes('ច្បាប់') || q.includes('ឈប់សម្រាក') || q.includes('leave') || q.includes('absent') || q.includes('អវត្តមាន')) {
    if (isEn) {
      return {
        text: `📝 **Leave Request & Absenteeism Procedure:**\n\n` +
          `1. **Advance Notice:** Parents should notify the class teacher or school at least **24 hours in advance**.\n` +
          `2. **Sick Leave:** Please notify via direct message in this app before **07:30 AM** on the morning of absence.\n` +
          `3. **Absence over 2 days:** Requires a signed medical doctor certificate or official parental letter.\n` +
          `4. **Digital Attendance:** The teacher will mark the attendance as "Permission (មានច្បាប់)" in the digital attendance portal.`,
        suggestions: ['Teacher directory and phone numbers', 'Come to the office hours', 'Class timetable']
      };
    }

    return {
      text: `📝 **នីតិវិធីនៃការស្នើសុំច្បាប់សម្រាកសិក្សា:**\n\n` +
        `១. **ការសុំច្បាប់ទុកជាមុន:** អាណាព្យាបាលត្រូវជូនដំណឹងមកគ្រូបន្ទុកថ្នាក់យ៉ាងតិច **២៤ ម៉ោងមុន**។\n` +
        `២. **ករណីមានជំងឺបន្ទាន់:** សូមទូរស័ព្ទ ឬផ្ញើសារចូលក្នុងប្រព័ន្ធនេះ មុនម៉ោង ០៧:៣០ ព្រឹក។\n` +
        `៣. **សម្រាកលើសពី ២ ថ្ងៃ:** តម្រូវឱ្យមានលិខិតបញ្ជាក់ពីវេជ្ជបណ្ឌិត ឬលិខិតសុំច្បាប់មានហត្ថលេខាអាណាព្យាបាលច្បាស់លាស់។\n` +
        `៤. **ការកត់ត្រាវត្តមាន:** គ្រូនឹងកត់ត្រាជា "មានច្បាប់ (Permission)" នៅក្នុងប្រព័ន្ធវត្តមានឌីជីថល។`,
      suggestions: ['តើគ្រូបន្ទុកថ្នាក់មានលេខទូរស័ព្ទអ្វី?', 'កាលវិភាគប្រឡង', 'កាលវិភាគសិក្សា']
    };
  }

  // 6. Teachers / Staff Directory (គ្រូបង្រៀន & បុគ្គលិក)
  if (q.includes('គ្រូ') || q.includes('teacher') || q.includes('staff') || q.includes('បុគ្គលិក') || q.includes('លោកគ្រូ') || q.includes('អ្នកគ្រូ')) {
    const teacherList = teachers.slice(0, 6).map((t, idx) => 
      `${idx + 1}. **${t.nameKhmer}** (${t.specialization || 'គ្រូបង្រៀន'}) - ☎️ ${t.phone || 'N/A'}`
    ).join('\n');

    if (isEn) {
      return {
        text: `👨‍🏫 **School Teachers Directory (Total: ${teachers.length} Faculty Members):**\n\n` +
          `${teacherList}\n\n` +
          `💡 *You can go to the "Teachers" view or "Direct Chat" tab to message any teacher directly!*`,
        suggestions: ['Chat with teacher', 'Class timetable', 'Tuition & Fees']
      };
    }

    return {
      text: `👨‍🏫 **បញ្ជីលោកគ្រូ-អ្នកគ្រូឆ្នើមប្រចាំសាលា (សរុប ${teachers.length} រូប):**\n\n` +
        `${teacherList}\n\n` +
        `💡 *លោកអ្នកអាចចុចលើផ្ទាំង "គ្រូបង្រៀន (Teachers)" ឬផ្ទាំង "ជជែកផ្ទាល់" ដើម្បីផ្ញើសារផ្ទាល់ទៅកាន់លោកគ្រូអ្នកគ្រូ!*`,
      suggestions: ['ជជែកផ្ទាល់ជាមួយលោកគ្រូ ចាន់ សុខា', 'តើមានសិស្សប៉ុន្មាននាក់?', 'កាលវិភាគសិក្សា']
    };
  }

  // 7. Students / Enrolled Count & Stats (សិស្ស & អ្នកប្រើប្រាស់ទាំងអស់)
  if (q.includes('សិស្ស') || q.includes('student') || q.includes('ចំនួនសិស្ស') || q.includes('ឈ្មោះសិស្ស') || q.includes('users') || q.includes('អ្នកប្រើ')) {
    const activeCount = students.filter(s => s.status === 'ACTIVE').length;
    
    if (isEn) {
      return {
        text: `🎓 **Student & User Community Statistics for ${school.nameEnglish || school.nameKhmer}:**\n\n` +
          `• **Total Students:** ${students.length} Enrolled\n` +
          `• **Active Students:** ${activeCount} Active\n` +
          `• **Total System Accounts:** ${users.length} Users (Admins, Teachers, Parents, Students, Staff)\n` +
          `• **Active Classrooms:** ${classes.length} Rooms (Grades 7 to 12)\n` +
          `• **Attendance & Discipline:** Fully tracked with QR Code scanning and digital cleaning scores.\n\n` +
          `🔍 *Search any user directly in the Direct Chat tab search box!*`,
        suggestions: ['How to message all users?', 'Teacher list and phone numbers', 'Cleaning duty schedule']
      };
    }

    return {
      text: `🎓 **ស្ថិតិសិស្សានុសិស្ស & អ្នកប្រើប្រាស់នៃ ${school.nameKhmer}:**\n\n` +
        `• **សិស្សសរុប:** ${students.length} នាក់\n` +
        `• **កំពុងសិក្សាសកម្ម:** ${activeCount} នាក់\n` +
        `• **គណនីក្នុងប្រព័ន្ធសរុប:** ${users.length} គណនី (គណៈគ្រប់គ្រង គ្រូ អាណាព្យាបាល សិស្ស បុគ្គលិក)\n` +
        `• **ថ្នាក់រៀនសរុប:** ${classes.length} បន្ទប់ថ្នាក់ (ថ្នាក់ទី ៧ ដល់ ទី ១២)\n` +
        `• **វិន័យ និងការចូលរួម:** កំពុងអនុវត្តប្រព័ន្ធកត់ត្រាវត្តមាន QR Code និងពិន្ទុវេនសម្អាតឌីជីថល។\n\n` +
        `🔍 *អ្នកអាចស្វែងរកឈ្មោះសិស្សជាក់លាក់ដោយវាយឈ្មោះក្នុងប្រអប់ Search ក្នុងផ្ទាំងជជែកផ្ទាល់!*`,
      suggestions: ['តើមានសិស្សពូកែណាខ្លះ?', 'កាលវិភាគវេនសម្អាត', 'របៀបបង់ថ្លៃសិក្សា']
    };
  }

  // 8. Cleaning Duties / Groups (វេនសម្អាត)
  if (q.includes('សម្អាត') || q.includes('cleaning') || q.includes('អនាម័យ') || q.includes('វេន')) {
    if (isEn) {
      return {
        text: `🧹 **Weekly Classroom Cleaning Duty Timetable:**\n\n` +
          `• **Monday:** Group 1 (Team Leader: Heng Piseth)\n` +
          `• **Tuesday:** Group 2 (Team Leader: Soeun Kosal)\n` +
          `• **Wednesday:** Group 3 (Team Leader: Mao Sokha)\n` +
          `• **Thursday:** Group 4 (Team Leader: Chea Ravi)\n` +
          `• **Friday:** Group 5 (Team Leader: Long Dara)\n\n` +
          `⭐ **Hygiene Scoring System:**\n` +
          `• Clean & on-time: **+20 Points**\n` +
          `• Absent without excuse: **-20 Points**\n` +
          `• Excused absence: **0 Points**`,
        suggestions: ['Class timetable', 'School announcements', 'How to request a leave']
      };
    }

    return {
      text: `🧹 **កាលវិភាគវេនសម្អាតបន្ទប់រៀនប្រចាំសប្តាហ៍:**\n\n` +
        `• **ថ្ងៃច័ន្ទ:** ក្រុមវេនថ្ងៃច័ន្ទ (ប្រធានក្រុម៖ ហេង ពិសិដ្ឋ)\n` +
        `• **ថ្ងៃអង្គារ:** ក្រុមវេនថ្ងៃអង្គារ (ប្រធានក្រុម៖ ស៊ន កុសល)\n` +
        `• **ថ្ងៃពុធ:** ក្រុមវេនថ្ងៃពុធ (ប្រធានក្រុម៖ ម៉ៅ សុខា)\n` +
        `• **ថ្ងៃព្រហស្បតិ៍:** ក្រុមវេនថ្ងៃព្រហស្បតិ៍ (ប្រធានក្រុម៖ ជា រ៉ាវី)\n` +
        `• **ថ្ងៃសុក្រ:** ក្រុមវេនថ្ងៃសុក្រ (ប្រធានក្រុម៖ ឡុង ដារ៉ា)\n\n` +
        `⭐ **ប្រព័ន្ធពិន្ទុអនាម័យ:**\n` +
        `• បំពេញវេនស្អាតល្អ: **+២០ ពិន្ទុ**\n` +
        `• អវត្តមានមិនបានសម្អាត: **-២០ ពិន្ទុ**\n` +
        `• សុំច្បាប់ត្រឹមត្រូវ: **+០ ពិន្ទុ**`,
      suggestions: ['ពិនិត្យពិន្ទុវេនសម្អាតតាមថ្នាក់', 'កាលវិភាគសិក្សា', 'សេចក្តីជូនដំណឹងថ្មីៗ']
    };
  }

  // 9. Announcements / News (សេចក្តីជូនដំណឹង)
  if (q.includes('ដំណឹង') || q.includes('announcement') || q.includes('news') || q.includes('ប្រកាស') || q.includes('ព្រឹត្តិការណ៍')) {
    const latestAnn = announcements[0];
    if (isEn) {
      return {
        text: `📢 **Latest School Announcement:**\n\n` +
          `📌 **${latestAnn?.titleEnglish || latestAnn?.titleKhmer || 'Parent-Teacher Conference'}**\n` +
          `• Date: ${latestAnn?.createdAt || '2026-08-28'}\n` +
          `• Priority: ${latestAnn?.priority === 'URGENT' ? '🔴 URGENT' : '🔵 GENERAL'}\n` +
          `• Details: ${latestAnn?.contentEnglish || latestAnn?.contentKhmer || 'We cordially invite parents to attend the academic progress review meeting.'}\n\n` +
          `👉 *Check the "Announcements" section for all public circulars!*`,
        suggestions: ['Class timetable', 'Tuition & KHQR info', 'Come to the office']
      };
    }

    return {
      text: `📢 **សេចក្តីជូនដំណឹងថ្មីៗចុងក្រោយ:**\n\n` +
        `📌 **${latestAnn?.titleKhmer || 'ការប្រជុំមាតាបិតាសិស្ស'}**\n` +
        `• កាលបរិច្ឆេទ: ${latestAnn?.createdAt || '២០២៦-០៨-២៨'}\n` +
        `• អាទិភាព: ${latestAnn?.priority === 'URGENT' ? '🔴 បន្ទាន់ខ្លាំង' : '🔵 ទូទៅ'}\n` +
        `• ខ្លឹមសារ: ${latestAnn?.contentKhmer || 'សូមអញ្ជើញមាតាបិតាចូលរួមការប្រជុំស្តីពីវឌ្ឍនភាពសិក្សារបស់សិស្ស។'}\n\n` +
        `👉 *សូមចូលមើលផ្ទាំង "សេចក្តីជូនដំណឹង" ដើម្បីអានព័ត៌មានលម្អិតទាំងអស់!*`,
      suggestions: ['ជួយព្រាងសារជូនដំណឹងថ្មី', 'កាលវិភាគប្រឡង', 'កាលវិភាគសិក្សា']
    };
  }

  // 10. Library & Books (បណ្ណាល័យ & សៀវភៅ)
  if (q.includes('បណ្ណាល័យ') || q.includes('សៀវភៅ') || q.includes('library') || q.includes('book') || q.includes('ខ្ចីសៀវភៅ')) {
    if (isEn) {
      return {
        text: `📚 **School Digital Library & Book Borrowing:**\n\n` +
          `• **Opening Hours:** 07:30 AM – 05:00 PM (Monday to Friday)\n` +
          `• **Borrowing Policy:** Up to **2 books** per student for **14 days**.\n` +
          `• **Collection:** Ministry textbooks, storybooks, dictionaries, Coding & STEM materials.\n` +
          `• **E-Books & PDFs:** Instant PDF reading directly inside the Library module!`,
        suggestions: ['Class timetable', 'Tuition & Fees', 'Teacher list']
      };
    }

    return {
      text: `📚 **ព័ត៌មានបណ្ណាល័យឌីជីថលសាលារៀន (School Library):**\n\n` +
        `• **ម៉ោងបើកទ្វារ:** ០៧:៣០ ព្រឹក - ០៥:០០ ល្ងាច (ច័ន្ទ - សុក្រ)\n` +
        `• **គោលការណ៍ខ្ចីសៀវភៅ:** សិស្សម្នាក់អាចខ្ចីបាន **២ ក្បាល** ក្នុងរយៈពេល **១៤ ថ្ងៃ**\n` +
        `• **សៀវភៅពេញនិយម:** សៀវភៅសិក្សាគោលក្រសួងអប់រំ, សៀវភៅរឿងអប់រំ, វចនានុក្រម និងឯកសារបច្ចេកវិទ្យា Coding/Scratch\n` +
        `• **សៀវភៅអេឡិចត្រូនិច (PDF):** មានផ្ទាំងអាន PDF Reader ផ្ទាល់ក្នុងប្រព័ន្ធ!`,
      suggestions: ['តើត្រូវធ្វើដូចម្តេចដើម្បីខ្ចីសៀវភៅ?', 'កាលវិភាគសិក្សា', 'តម្លៃសិក្សា']
    };
  }

  // 11. School Background & Location (អំពីសាលារៀន)
  if (q.includes('អំពីសាលា') || q.includes('about') || q.includes('ទីតាំង') || q.includes('អាសយដ្ឋាន') || q.includes('នាយក') || q.includes('principal')) {
    if (isEn) {
      return {
        text: `🏫 **About ${school.nameEnglish || school.nameKhmer}:**\n\n` +
          `• **School Principal:** ${school.principalEnglish || school.principalKhmer}\n` +
          `• **Motto:** ${school.mottoKhmer || 'Excellence, Discipline, Virtue'}\n` +
          `• **Address:** ${school.address}\n` +
          `• **Phone:** \`${school.phone}\` | **Email:** \`${school.email}\`\n` +
          `• **Mission:** Nurturing students with strong academic knowledge, modern technology, and high moral standards.`,
        suggestions: ['Come to the office hours', 'Teacher directory', 'Tuition payment']
      };
    }

    return {
      text: `🏫 **អំពី ${school.nameKhmer} (${school.nameEnglish}):**\n\n` +
        `• **នាយកសាលា:** ${school.principalKhmer} (${school.principalEnglish})\n` +
        `• **បាវចនា:** ${school.mottoKhmer}\n` +
        `• **អាសយដ្ឋាន:** ${school.address}\n` +
        `• **លេខទូរស័ព្ទ:** ${school.phone}\n` +
        `• **អ៊ីមែល:** ${school.email}\n` +
        `• **ទស្សនវិស័យ:** អភិវឌ្ឍន៍សិស្សានុសិស្សឱ្យមានចំណេះដឹងទូលំទូលាយ បច្ចេកវិទ្យាទំនើប និងសីលធម៌ខ្ពង់ខ្ពស់។`,
      suggestions: ['កាលវិភាគសិក្សា', 'គ្រូបង្រៀន', 'ថ្លៃសិក្សា']
    };
  }

  // Default intelligent contextual response
  const userName = currentUser?.nameKhmer || 'អ្នកប្រើប្រាស់';
  const userNameEn = currentUser?.nameEnglish || currentUser?.nameKhmer || 'User';

  if (isEn) {
    return {
      text: `Hello ${userNameEn}! I am **Tayack AI Assistant (Intelligent School AI Bot)**.\n\n` +
        `I received your query: *" ${userPrompt} "*\n\n` +
        `I can assist you with:\n` +
        `• 💬 **Chatting with all users, teachers, parents & admins**\n` +
        `• 📅 **Class schedules & daily timetables**\n` +
        `• 💰 **Tuition fees & Bakong KHQR payment verification**\n` +
        `• 🏢 **School administration office hours & in-person visits**\n` +
        `• 📝 **Leave requests & absence procedures**\n` +
        `• 👨‍🏫 **Teacher directory & contact numbers**\n` +
        `• 🧹 **Classroom cleaning duties & hygiene scoring**\n\n` +
        `Please choose a topic below or type your question!`,
      suggestions: [
        'How to chat with all users?',
        'Come to the office hours',
        'Tuition fees & Bakong KHQR',
        'Teacher list and phone numbers',
        'Class timetable'
      ]
    };
  }

  return {
    text: `ជម្រាបសួរ ${userName}! ខ្ញុំជា **Tayack AI Assistant (ជំនួយការសាលារៀនឆ្លាតវៃ)**។\n\n` +
      `ខ្ញុំបានទទួលសំណួររបស់អ្នក៖ *" ${userPrompt} "*\n\n` +
      `ខ្ញុំអាចជួយផ្ដល់ព័ត៌មានទាក់ទងនឹង៖\n` +
      `• 💬 **ការជជែកជាមួយអ្នកប្រើទាំងអស់ (គ្រូ សិស្ស អាណាព្យាបាល Admin)**\n` +
      `• 📅 **កាលវិភាគ & ម៉ោងសិក្សា**\n` +
      `• 💰 **ថ្លៃសិក្សា & ការបង់ប្រាក់ Bakong KHQR**\n` +
      `• 🏢 **ព័ត៌មានការិយាល័យរដ្ឋបាល & ម៉ោងធ្វើការ**\n` +
      `• 📝 **នីតិវិធីសុំច្បាប់សម្រាកសិក្សា**\n` +
      `• 👨‍🏫 **បញ្ជីឈ្មោះលោកគ្រូអ្នកគ្រូ និងលេខទំនាក់ទំនង**\n` +
      `• 🧹 **វេនសម្អាតបន្ទប់រៀន & ពិន្ទុអនាម័យ**\n\n` +
      `សូមជ្រើសរើសប្រធានបទរហ័សខាងក្រោម ឬវាយបញ្ចូលសំណួររបស់អ្នកបានគ្រប់ពេលវេលា!`,
    suggestions: [
      'របៀបជជែកជាមួយអ្នកទាំងអស់',
      'ម៉ោងធ្វើការការិយាល័យរដ្ឋបាល',
      'តម្លៃសិក្សា & ការបង់ប្រាក់ KHQR',
      'កាលវិភាគសិក្សា & ម៉ោងរៀន',
      'បញ្ជីគ្រូបង្រៀន & លេខទូរស័ព្ទ'
    ]
  };
}

