# GitHub Setup Instructions for iCloud Notes Clone

**Repo:** https://github.com/LubaKaper/iCloud-Notes-Clone.git  
**Date:** February 9, 2026

---

## Step 1: Clone Your Repo Locally

```bash
git clone https://github.com/LubaKaper/iCloud-Notes-Clone.git
cd iCloud-Notes-Clone
git branch -a  # Check existing branches
```

## Step 2: Create Your Feature Branch

```bash
git checkout -b feature/autosave-backend-day1
# or if you prefer a shorter name:
git checkout -b feat/autosave
```

## Step 3: Create Project Structure

Copy the following folder structure into your repo root:

```bash
# From this package, copy these files:

# 1. Create docs folder
mkdir -p docs
cp README_START_HERE.md docs/
cp PROJECT_SETUP.md docs/
cp FIGMA_DESIGN_INTEGRATION_GUIDE.md docs/
cp icloud_notes_prd_refined.docx docs/PRD.docx
cp icloud_notes_ui_spec.docx docs/DESIGN_SPEC.docx

# 2. Create frontend folder with Figma starter code
mkdir -p frontend/src/app/components
cp NotesApp.tsx frontend/src/app/components/
cp Sidebar.tsx frontend/src/app/components/
cp NotesList.tsx frontend/src/app/components/
cp NoteViewer.tsx frontend/src/app/components/
cp package.json frontend/

# 3. Create backend folder (Claude Code will generate this)
mkdir -p backend/src/{routes,models,middleware}
```

## Step 4: Initialize Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend should run on localhost:5173
```

## Step 5: Commit Initial Setup

```bash
git add -A
git commit -m "chore: Initial project structure + Figma frontend starter"
git push origin feature/autosave-backend-day1
```

## Step 6: Install Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

## Step 7: Start Claude Code (Day 1)

```bash
cd /path/to/iCloud-Notes-Clone
claude-code
```

Then give Claude Code this prompt:

```
I'm building an iCloud Notes clone with React + Node.

Read the docs/PROJECT_SETUP.md and docs/PRD.docx files for full context.

DAY 1 TASK: Create Express backend with CRUD API

Requirements:
1. Express.js server (port 3000, TypeScript)
2. PostgreSQL database connection (use 'postgres://user:password@localhost:5432/icloud_notes')
3. Note model/table: { id (UUID), title (string), body (string), revision (integer), createdAt (timestamp), updatedAt (timestamp) }
4. REST API endpoints:
   - POST /api/notes - Create new note
   - GET /api/notes - Get all notes
   - GET /api/notes/:id - Get single note
   - PUT /api/notes/:id - Update note (check revision to prevent race conditions)
   - DELETE /api/notes/:id - Delete note

5. Error handling for all endpoints
6. CORS enabled for localhost:5173 (frontend)
7. Environment variables (.env.example file)

Generate all code in backend/src/ directory.
Use the PRD section on "Revision Versioning" to understand race condition prevention.
Follow TypeScript best practices.
```

## Step 8: Review & Test Claude Code Output

After Claude Code generates the backend:

```bash
# Install backend dependencies
cd backend
npm install

# Set up .env file
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# Test the API
npm run dev
# Backend should run on localhost:3000

# Test with curl:
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"body": "Test note"}'
```

## Step 9: Commit Day 1 Work

```bash
git add -A
git commit -m "feat: Day 1 - Express backend with CRUD endpoints"
git push origin feature/autosave-backend-day1
```

## Step 10: Create Pull Request

Go to GitHub and create a Pull Request:
- **Base:** main (or your default branch)
- **Compare:** feature/autosave-backend-day1
- **Title:** "feat: iCloud Notes MVP - Day 1 Backend Setup"
- **Description:** Link to PROJECT_SETUP.md

---

## Useful Git Commands for the Sprint

```bash
# Pull latest changes
git pull origin feature/autosave-backend-day1

# Check status
git status

# See your commits
git log --oneline -5

# Switch between branches
git checkout main
git checkout feature/autosave-backend-day1

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Stash changes temporarily
git stash
git pop  # restore later
```

---

## Next: Day 2 (After Day 1 is Done)

When Day 1 is complete:

1. Test the backend works
2. Make sure frontend runs
3. Commit and push
4. Run Claude Code again with Day 2 prompt (from PROJECT_SETUP.md)

Day 2: State Management + Component Wiring

---

## Troubleshooting

**Port 3000 or 5173 already in use:**
```bash
# Find process using port
lsof -i :3000
# Kill it
kill -9 <PID>
```

**PostgreSQL connection fails:**
- Make sure PostgreSQL is running
- Check .env DATABASE_URL is correct
- Verify database exists

**npm install fails:**
```bash
cd frontend  # or backend
rm -rf node_modules package-lock.json
npm install
```

---

## You're Ready!

1. ✅ Folder structure ready
2. ✅ Figma frontend in place
3. ✅ Claude Code prompts prepared
4. ✅ Git workflow set up

**Run the Day 1 Claude Code prompt and start building!** 🚀

Questions? Ask me anytime during the sprint.
