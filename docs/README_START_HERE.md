# iCloud Notes Clone - Project Starter Package

**Status:** Ready to Launch 🚀  
**Sprint:** 5 Days  
**Date:** February 9, 2026

---

## 📦 What You're Getting

This package contains **everything** you need to build an iCloud Notes clone with React + Node in 5 days:

### ✅ Documentation
- **PROJECT_SETUP.md** ← **START HERE** (detailed day-by-day breakdown)
- **icloud_notes_prd_refined.docx** - Your Product Requirements Document
- **icloud_notes_ui_spec.docx** - Design specification with colors/spacing
- **FIGMA_DESIGN_INTEGRATION_GUIDE.md** - How your Figma design maps to code
- **icloud_notes_css_polish_guide.docx** - CSS refinement guide (if needed)

### ✅ Starter Code
- **Figma Frontend Project** (React/Vite/Tailwind)
  - `NotesApp.tsx` - Main three-column layout
  - `Sidebar.tsx` - Folders & tags
  - `NotesList.tsx` - Search & note list
  - `NoteViewer.tsx` - Editor & toolbar
  - `package.json` - All dependencies ready

### ✅ Ready to Use
- Full project structure (frontend + backend folders)
- Daily Claude Code prompts (Day 1-5)
- Troubleshooting guide
- Deployment checklist

---

## 🎯 Your Next Steps (In Order)

### Step 1: Share Your Repo (RIGHT NOW)
**Tell me your GitHub repo URL.** I'll help you set up the folder structure and branching strategy.

```bash
# I need this information:
# - GitHub repo link (HTTPS or SSH)
# - Branch you want to work on (or should I help create one?)
# - Any existing backend/frontend structure?
```

### Step 2: Clone & Set Up Locally
```bash
git clone <your-repo-url>
cd icloud-notes-clone
git checkout -b feature/icloud-notes-autosave-backend  # or your branch
```

### Step 3: Copy the Figma Frontend
Copy all the provided `.tsx` files into `frontend/src/app/components/`

### Step 4: Install Claude Code
```bash
npm install -g @anthropic-ai/claude-code
```

### Step 5: Start Day 1 with Claude Code
```bash
cd icloud-notes-clone
claude-code

# Tell Claude Code:
# "Read PROJECT_SETUP.md in the docs/ folder.
#  Day 1 task: Create Express backend with CRUD endpoints.
#  Use PostgreSQL (or MongoDB). Reference the PRD for specs."
```

---

## 📋 What's in Each File

### `PROJECT_SETUP.md` (START HERE!)
- 🎯 **5-Day sprint breakdown** (what to do each day)
- 📝 **Daily Claude Code prompts** (copy-paste ready)
- 📦 **Deliverables checklist** (know when you're done)
- 🔧 **Tech stack reference**
- 🐛 **Troubleshooting guide**

### `FIGMA_DESIGN_INTEGRATION_GUIDE.md`
- Color palette (already implemented)
- Component mapping (Figma → React code)
- State management setup
- Autosave implementation details

### `icloud_notes_prd_refined.docx`
- Problem statement
- Goals & non-goals
- User requirements
- Success metrics
- Technical architecture

### `icloud_notes_ui_spec.docx`
- Design specification
- Typography, colors, spacing
- Interactive states
- Three-column layout details

### React Components (`.tsx` files)
- `NotesApp.tsx` - Main container (three-column layout)
- `Sidebar.tsx` - Folders & tags (200px width)
- `NotesList.tsx` - Search & previews (360px width)
- `NoteViewer.tsx` - Editor & toolbar (flex width)

All components are **styled with Tailwind** and ready for state management + API integration.

---

## 🚀 The Strategy

### This Package is Designed For:
✅ **Rapid development** (5-day sprint)  
✅ **Claude Code integration** (agentic scaffolding)  
✅ **Zero data loss** (autosave + IndexedDB + revision handling)  
✅ **Production ready** (deployable after Day 5)

### How It Works:
1. **Days 1-2:** Claude Code scaffolds backend + state management (80% of work)
2. **Days 3-4:** You implement autosave + features (manual work)
3. **Day 5:** Test, polish, deploy (final integration)

### Why This Approach:
- **Claude Code handles boilerplate** (save 2+ days)
- **You focus on logic** (autosave, state flow, testing)
- **Components already designed** (no UI work needed)
- **Documentation is complete** (no guessing)

---

## 🤖 Claude Code vs. Claude.ai Web

**Use Claude Code for:**
- Backend scaffolding (Day 1)
- API setup & routes
- Database schema
- State management generation
- Large code generation tasks

**Use Claude.ai Web for:**
- Quick debugging questions
- Explaining concepts
- Reviewing code
- Fine-tuning specific logic
- Writing documentation

**You'll use BOTH** during the sprint.

---

## 📊 Expected Timeline

| Day | Task | Time | Status |
|-----|------|------|--------|
| **1** | Backend API setup | 1 day | Claude Code does 80% |
| **2** | State management + wiring | 1 day | Mix of Claude Code + manual |
| **3** | Autosave + IndexedDB | 1 day | Manual work |
| **4** | Search + delete + error handling | 1 day | Manual + Claude Code |
| **5** | Testing + deployment | 1 day | Manual |

**Total development time:** 5 days to production MVP ✅

---

## ✅ Success Checklist

By the end of Day 5, you should have:

- [ ] React frontend running (localhost:5173)
- [ ] Node backend running (localhost:3000)
- [ ] Sidebar, NotesList, NoteViewer all wired to state
- [ ] Create note → appears in list
- [ ] Select note → shows in editor
- [ ] Edit note → autosaves after 800ms
- [ ] Edit note → saves on blur
- [ ] Refresh page → notes still there (IndexedDB)
- [ ] Search filters notes
- [ ] Delete shows confirmation
- [ ] Frontend deployed (Vercel or Netlify)
- [ ] Backend deployed (Railway or Heroku)
- [ ] Production URLs working

---

## 🎯 Your Job Right Now

1. **Share your GitHub repo URL** in this chat
2. **Tell me if you have existing backend/frontend** folders
3. **Confirm your branch name** (or I'll recommend one)
4. **We'll get you set up** with the structure + first Claude Code prompt

Then you're ready to launch! 🚀

---

## 📞 I'm Here For:

- Clarifying the PRD or design spec
- Debugging Claude Code output
- Reviewing your code
- Explaining autosave logic
- Deployment questions
- Git/branching help
- Anything else during the sprint

---

## 🎓 Learning Resources

**If you want to understand the architecture:**
1. Read **PROJECT_SETUP.md** (overview)
2. Read **FIGMA_DESIGN_INTEGRATION_GUIDE.md** (how components work)
3. Read **icloud_notes_prd_refined.docx** (why we do things)
4. Read **icloud_notes_ui_spec.docx** (how it looks)

**If you want to start building:**
1. Open **PROJECT_SETUP.md**
2. Follow the "Quick Start" section
3. Copy Day 1 prompt from PROJECT_SETUP.md
4. Feed it to Claude Code
5. Review the generated code
6. Test locally
7. Commit & push

---

## 💡 Pro Tips

1. **Read the PRD first** - Know what you're building
2. **Follow the 5-day plan** - Don't skip ahead, don't do everything at once
3. **Test after each day** - Verify things work before moving on
4. **Commit frequently** - `git commit -am "Day X: Task description"`
5. **Use Claude Code for scaffolding** - It's much faster than manual
6. **Ask for help early** - Don't debug for 2 hours, ask me after 15 mins
7. **Keep the PRD handy** - Reference it when making decisions

---

## 🚀 Ready?

**Share your repo URL and we'll get started!**

Once you do, I'll:
1. Create a GitHub-ready folder structure for you
2. Generate a root-level README.md with full setup instructions
3. Create a `.github/PULL_REQUEST_TEMPLATE.md` for your PRs
4. Give you the exact Day 1 Claude Code command to run
5. Be available for questions throughout the sprint

**Let's build this! 🎉**
