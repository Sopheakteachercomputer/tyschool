# Cambodian School Management System (ប្រព័ន្ធគ្រប់គ្រងសាលារៀនកម្ពុជា)

A modern, full-stack educational and school management platform with integrated Google Gemini Multimodal AI Studio, role-based workflows, and bilingual support (Khmer 🇰🇭 & English 🇬🇧).

---

## 📌 Note on GitHub's "Some content is hidden / Large Commits" Notice

If you see this message when viewing your initial commit or pull request on GitHub:

> *"Some content is hidden. Large Commits have some content hidden by default. Use the searchbox below for content that may be hidden."*

**Don't worry — your project is 100% complete and no files were lost!**

### Why does GitHub display this?
GitHub web interface has a built-in safety limit: when an initial commit contains dozens of files and large datasets (such as curriculum data, comprehensive sample student records, and multimodal AI components), GitHub collapses the web diff viewer to avoid crashing your web browser.

### How to browse and verify your code on GitHub:
1. Click the **`< > Code`** tab at the top-left of the repository.
2. You will see the entire file tree (`src/`, `server.ts`, `package.json`, `index.html`, etc.) completely intact and accessible.

---

## 🚀 How to Publish & Deploy with GitHub

### Option A: Publish with GitHub Pages (Static Client Hosting)
This repository includes an automated GitHub Actions deployment workflow in `.github/workflows/deploy.yml`.

1. Push this repository to GitHub (or use AI Studio's **Export to GitHub** feature).
2. On GitHub, navigate to your repository **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. Push any commit to the `main` branch (or run the workflow manually under the **Actions** tab).
5. GitHub will automatically build and publish your application to `https://<your-username>.github.io/<repository-name>/`.

### Option B: Deploy Full-Stack App (with Server-Side Gemini AI & WebSockets)
To run the complete server with real-time Gemini Live voice streaming, Lyria music generation, and Veo video generation:

#### 1. Clone & Install
```bash
git clone https://github.com/<your-username>/<repository-name>.git
cd <repository-name>
npm install
```

#### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your keys:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 4. Build and Start for Production (Cloud Run / VPS / Docker / Render)
```bash
npm run build
npm start
```

---

## ✨ Key Features

- **Full School Management Engine**:
  - Student & Teacher directories with profile management
  - Class scheduling, subject assignments, and timetable management
  - Daily attendance tracking with status summaries
  - Weekly quiz & exam scoring system with automatic GPA calculation
  - Cambodian KHQR tuition payment tracking and receipts
  - Graduation certificate generation with custom decorative borders
  - School library system with digital book lending and QR checkouts
  - Classroom cleaning and chore rotation rosters
  - Audit logging & role-based access control (Admin, Teacher, Accountant, Librarian, Student, Parent)

- **Google Gemini Multimodal AI Studio**:
  - **Gemini Chatbot**: Multi-turn dialogue with model tier routing (`gemini-3.1-pro-preview`, `gemini-3.5-flash`, `gemini-3.1-flash-lite`) and role personas (Academic Advisor, STEM/Coding Tutor, Khmer Culture Specialist)
  - **Lyria 3 Music Generation**: AI audio generation (`lyria-3-clip-preview` & `lyria-3-pro-preview`) with lyrical output
  - **Veo 3 Video Generation**: Text-to-video and image-to-video animations (`veo-3.1-fast-generate-preview`) with MP4 export
  - **Image Creation & Editing**: High-definition generation and modification (`gemini-3.1-flash-image-preview`)
  - **Live API Voice Conversations**: Real-time bi-directional voice chat via WebSockets (`gemini-3.1-flash-live-preview`)
  - **Search & Maps Grounding**: Grounded real-time answers with Google Search & Google Maps citations
  - **Speech Transcription**: Voice recording to Khmer/English text (`gemini-3.5-transcribe`)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, Recharts
- **Backend**: Node.js, Express, WebSockets (`ws`), `@google/genai` SDK
- **Design**: Bilingual Khmer & English typography (Kantumruy Pro, Battambang, Moul, Plus Jakarta Sans)
- **Deployment**: Vite SPA / Express SSR / GitHub Pages / Google Cloud Run

---

## 📄 License
MIT License
