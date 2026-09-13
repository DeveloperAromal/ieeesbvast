# Blackout Game Seed Data

## Overview
The blackout game seed provides a complete 5-stage escape room puzzle game with cryptographic, logical, mathematical, and lateral thinking challenges.

## Game Structure

### Game Details
- **Name:** Blackout
- **Duration:** 120 minutes
- **Total Chapters:** 5
- **Total Hints:** 10 (2 per chapter)
- **Total Dead End Riddles:** 5 (1 per chapter)

### Chapter Breakdown

#### Chapter 1: Caesar's Secret (Cryptography)
- **Difficulty:** Easy
- **Type:** Cryptography
- **Challenge:** Decode a Caesar cipher message
- **Question:** "Khoor Zruog" (shift of 3)
- **Answer:** "hello world"
- **Hints:** 2 (10 & 15 points)
- **Dead End Penalty:** 5 minutes, 10 points
- **Dead End Riddle:** "I speak all languages but utter no words. What am I?" (Answer: echo)

#### Chapter 2: The Bridge Crossing (Logic)
- **Difficulty:** Medium
- **Type:** Logic Puzzle
- **Challenge:** Optimize crossing time for 4 people with different speeds
- **Question:** Find minimum time for all 4 people to cross bridge
- **Answer:** "17"
- **Hints:** 2 (10 & 15 points)
- **Dead End Penalty:** 5 minutes, 15 points
- **Dead End Riddle:** "What has cities but no houses, forests but no trees, and water but no fish?" (Answer: map)

#### Chapter 3: Fibonacci's Challenge (Mathematics)
- **Difficulty:** Easy-Medium
- **Type:** Mathematical Pattern
- **Challenge:** Find the 10th Fibonacci number
- **Question:** Sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34, ?
- **Answer:** "55"
- **Hints:** 2 (10 & 15 points)
- **Dead End Penalty:** 5 minutes, 12 points
- **Dead End Riddle:** "I am an odd number. Take away one letter and I become even. What number am I?" (Answer: seven)

#### Chapter 4: Binary Message (Computer Science)
- **Difficulty:** Medium
- **Type:** Binary Decoding
- **Challenge:** Convert binary to ASCII text
- **Question:** Decode binary string to message
- **Answer:** "hello"
- **Hints:** 2 (10 & 15 points)
- **Dead End Penalty:** 5 minutes, 10 points
- **Dead End Riddle:** "What has a head and a tail but no body?" (Answer: coin)

#### Chapter 5: The Final Door (Word Puzzle)
- **Difficulty:** Hard
- **Type:** Lateral Thinking
- **Challenge:** Solve a classic riddle
- **Question:** "I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?"
- **Answer:** "pencil lead"
- **Hints:** 2 (15 & 20 points)
- **Dead End Penalty:** 10 minutes, 20 points
- **Dead End Riddle:** "What is so fragile that saying its name breaks it?" (Answer: silence)

## Installation

### Method 1: Migration (Recommended)
The seed data is included in migration file `016_seed_blackout_game.up.sql`:

```bash
# Run all migrations (includes seed data)
migrate -path backend/migrations -database "postgres://user:password@localhost:5432/ieeesbvast" up
```

### Method 2: Direct SQL Execution
Run the standalone seed script:

```bash
# Direct execution
psql -U username -d ieeesbvast -f backend/sql/seed_blackout_game.sql

# Or from within psql
\i backend/sql/seed_blackout_game.sql
```

## Game Mechanics

### Scoring System
- **Correct Answer:** +100 points
- **Hint Level 1:** -10 to -15 points
- **Hint Level 2:** -15 to -20 points
- **Wrong Answer (Dead End):** -10 to -20 points + time penalty

### Progression
1. Player reaches Chapter 1, Stage 1
2. Player submits answer to current chapter
3. If **correct:** Advance to next stage (Chapter N+1)
4. If **wrong:** Trigger dead end riddle
   - Player must solve riddle to continue
   - Player accumulates penalty points & time
5. Complete Chapter 5 to finish game

### Data Model

#### Games Table
```sql
id: UUID (primary key)
name: VARCHAR(255)
subtitle: TEXT
duration_minutes: INTEGER
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

#### Chapters Table
```sql
id: UUID (primary key)
game_id: UUID (foreign key)
stage_number: INTEGER (1-5)
title: VARCHAR(255)
discipline: VARCHAR(255)
question: TEXT
how_to_solve: TEXT
correct_answer: TEXT
asset_url: TEXT (optional - for images/videos)
created_at: TIMESTAMPTZ
```

#### Dead Ends Table
```sql
id: UUID (primary key)
chapter_id: UUID (unique, foreign key)
trap_answer: VARCHAR(255) (common wrong answer)
riddle_question: TEXT
riddle_answer: TEXT
penalty_minutes: INTEGER
penalty_points: INTEGER
created_at: TIMESTAMPTZ
```

#### Hints Table
```sql
id: UUID (primary key)
chapter_id: UUID (foreign key)
level: SMALLINT (1-2)
text: TEXT
point_cost: INTEGER
created_at: TIMESTAMPTZ
```

#### Team Game Sessions (automatically created on first play)
```sql
id: UUID (primary key)
team_registration_id: UUID (foreign key)
game_id: UUID (foreign key)
current_stage: INTEGER (1-5, progress tracker)
score: INTEGER (starts at 0)
penalty_minutes: INTEGER
penalty_points: INTEGER
status: VARCHAR(30) ('in_progress', 'completed')
started_at: TIMESTAMPTZ
finished_at: TIMESTAMPTZ
created_at: TIMESTAMPTZ
updated_at: TIMESTAMPTZ
```

## API Integration

### Endpoints Using This Data

#### GET /api/v1/game/blackout/game
Returns current game data for authenticated player:
```json
{
  "success": true,
  "data": {
    "game_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "game_name": "Blackout",
    "game_subtitle": "Find the solution, unlock the next door, and escape the trap.",
    "duration_minutes": 120,
    "current_stage": 1,
    "score": 0,
    "penalty_minutes": 0,
    "penalty_points": 0,
    "current_chapter": {
      "id": "c1a1c1a1-...",
      "title": "Caesar's Secret",
      "discipline": "Cryptography",
      "question": "Decode this message: Khoor Zruog",
      "how_to_solve": "...",
      "hints": [
        {
          "level": 1,
          "text": "Caesar cipher is...",
          "point_cost": 10
        }
      ],
      "dead_end": {
        "riddle_question": "I speak all languages...",
        "penalty_minutes": 5,
        "penalty_points": 10
      }
    }
  }
}
```

#### POST /api/v1/game/answer
Submit answer and progress:
```json
{
  "game_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "stage_number": 1,
  "answer": "hello world"
}
```

## Rollback

### Migration Rollback
```bash
migrate -path backend/migrations -database "postgres://user:password@localhost:5432/ieeesbvast" down 1
```

This will execute `016_seed_blackout_game.down.sql` and remove all seeded data while keeping the schema intact.

## Customization

To add or modify chapters:

1. Edit `backend/sql/seed_blackout_game.sql` or the migration files
2. Maintain the same structure as existing chapters
3. Re-run migrations or execute the SQL script
4. Update chapter UUIDs as needed

### Example: Adding a New Chapter

```sql
INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    gen_random_uuid(),
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    6,
    'Chapter Title',
    'Discipline',
    'Your question here',
    'Solution explanation',
    'correct_answer',
    NULL
);
```

## Notes

- All chapter answers are **case-insensitive** and **trimmed** in the backend
- Dead end riddles are for **display only** during gameplay (not validated in current implementation)
- Hints can be purchased multiple times
- Each team gets their own `team_game_sessions` record tracking progress
- Game data uses PostgreSQL UUID and TIMESTAMPTZ for reliability
