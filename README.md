# Priority Matrix

A clean, drag-and-drop task manager based on **Habit 3: Put First Things First** from Stephen Covey's *7 Habits of Highly Effective People*.

**[Open the app](https://sourpeach.github.io/claudetest/)**

## What is the Priority Matrix?

Covey's Time Management Matrix divides tasks into four quadrants based on urgency and importance:

| | Urgent | Not Urgent |
|---|---|---|
| **Important** | Q1 — Do First | Q2 — Schedule ★ |
| **Not Important** | Q3 — Delegate | Q4 — Eliminate |

> The goal is to spend more time in **Q2** — important but not urgent work like planning, learning, and relationship-building — rather than constantly reacting to Q1 crises.

## Features

- **Task inbox** — type tasks freely, then sort them into quadrants
- **Drag and drop** — move tasks between the inbox and any quadrant, or between quadrants
- **Complete & delete** — check off finished tasks or remove them
- **Auto-save** — tasks persist in your browser via localStorage
- **Export** — download your full board as a `.json` file (dated backup)
- **Import** — reload a previous export to restore your board on any device

## Usage

No install, no login, no server required. Just open the file:

**Option 1 — GitHub Pages (online):**
[https://sourpeach.github.io/claudetest/](https://sourpeach.github.io/claudetest/)

**Option 2 — Run locally:**
```bash
git clone https://github.com/sourpeach/claudetest.git
open claudetest/index.html
```

Or simply download `index.html` and open it in any browser.

## How to use it

1. Type a task in the **New Task** box and click **+ Add to Inbox** (or press `⌘ Enter`)
2. **Drag** the task card from the Inbox into the quadrant that fits
3. Reprioritize anytime by dragging tasks between quadrants
4. Hit **✓** to mark a task done, **×** to delete it
5. Use **Export** to save your board as a `.json` file
6. Use **Import** to restore a previously exported board

## Tech

Single self-contained HTML file — HTML, CSS, and JavaScript with no dependencies or build step.
