-- Blackout Game Seed Data (Standalone Script)
-- Run this after migrations to populate the blackout game with sample chapters
-- 
-- Database: PostgreSQL
-- Tables: games, chapters, dead_ends, hints
--
-- The game has 5 chapters with increasing difficulty:
-- 1. Cryptography (Caesar Cipher)
-- 2. Logic (Bridge Crossing Puzzle)
-- 3. Mathematics (Fibonacci Sequence)
-- 4. Computer Science (Binary Decoding)
-- 5. Word Puzzle (Final Challenge)

BEGIN TRANSACTION;

-- ===================================================================
-- INSERT GAME
-- ===================================================================
INSERT INTO games (id, name, subtitle, duration_minutes, created_at, updated_at)
VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    'Blackout',
    'Find the solution, unlock the next door, and escape the trap.',
    120,
    NOW(),
    NOW()
);

-- ===================================================================
-- CHAPTER 1: CRYPTOGRAPHY - Caesar Cipher
-- ===================================================================
-- Stage: 1
-- Difficulty: Easy
-- Topic: Basic cryptography
-- Answer: "hello world"

INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c1a1c1a1-c1a1-c1a1-c1a1-c1a1c1a1c1a1'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    1,
    'Caesar''s Secret',
    'Cryptography',
    'Decode this message: Khoor Zruog
    
Hint: Each letter is shifted by 3 positions in the alphabet.',
    'This is a Caesar cipher with a shift of 3. Replace each letter with the one 3 positions before it in the alphabet: K→H, h→e, o→l, o→l, r→o, space, Z→W, o→l, u→r, o→l, g→d',
    'hello world',
    NULL
);

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a'::UUID,
    'c1a1c1a1-c1a1-c1a1-c1a1-c1a1c1a1c1a1'::UUID,
    'goodbye world',
    'I speak all languages but utter no words. What am I?',
    'echo',
    5,
    10
);

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::UUID,
    'c1a1c1a1-c1a1-c1a1-c1a1-c1a1c1a1c1a1'::UUID,
    1,
    'Caesar cipher is the simplest form of substitution cipher where each letter is replaced by another letter a fixed number of positions down or up the alphabet.',
    10
),
(
    'h1a1a1a2-a1a1-a1a1-a1a1-a1a1a1a1a1a1'::UUID,
    'c1a1c1a1-c1a1-c1a1-c1a1-c1a1c1a1c1a1'::UUID,
    2,
    'Try shifting backwards: K→H, h→e, o→l, o→l, r→o',
    15
);

-- ===================================================================
-- CHAPTER 2: LOGIC - Bridge Crossing Puzzle
-- ===================================================================
-- Stage: 2
-- Difficulty: Medium
-- Topic: Logical thinking and optimization
-- Answer: "17"

INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c2a2c2a2-c2a2-c2a2-c2a2-c2a2c2a2c2a2'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    2,
    'The Bridge Crossing',
    'Logic',
    'Four people need to cross a bridge at night with one flashlight. The bridge is very old and can only hold 2 people at a time. The flashlight must accompany any group crossing the bridge. Each person walks at different speeds:
    
- Person A: 1 minute
- Person B: 2 minutes  
- Person C: 5 minutes
- Person D: 10 minutes

When two people cross, they move at the speed of the slower person. What is the minimum time needed for all four to cross?',
    'The optimal strategy: 1) A and B cross (2 min), 2) A returns (1 min), 3) C and D cross (10 min), 4) B returns (2 min), 5) A and B cross (2 min). Total = 17 minutes.',
    '17',
    NULL
);

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a'::UUID,
    'c2a2c2a2-c2a2-c2a2-c2a2-c2a2c2a2c2a2'::UUID,
    '19',
    'What has cities but no houses, forests but no trees, and water but no fish?',
    'map',
    5,
    15
);

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h2a2a2a1-a2a2-a2a2-a2a2-a2a2a2a2a2a1'::UUID,
    'c2a2c2a2-c2a2-c2a2-c2a2-c2a2c2a2c2a2'::UUID,
    1,
    'The fastest person should act as a "shuttle" to help the slower ones cross.',
    10
),
(
    'h2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2'::UUID,
    'c2a2c2a2-c2a2-c2a2-c2a2-c2a2c2a2c2a2'::UUID,
    2,
    'C and D should cross together to minimize the time spent by the slowest person.',
    15
);

-- ===================================================================
-- CHAPTER 3: MATHEMATICS - Fibonacci Sequence
-- ===================================================================
-- Stage: 3
-- Difficulty: Easy-Medium
-- Topic: Mathematical patterns and sequences
-- Answer: "55"

INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c3a3c3a3-c3a3-c3a3-c3a3-c3a3c3a3c3a3'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    3,
    'Fibonacci''s Challenge',
    'Mathematics',
    'What is the 10th number in the Fibonacci sequence?

Sequence starts: 1, 1, 2, 3, 5, 8, 13, 21, 34, ?',
    'The Fibonacci sequence where each number is the sum of the two preceding ones:
1, 1, 2, 3, 5, 8, 13, 21, 34, 55
So the 10th number is 55.',
    '55',
    NULL
);

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de3a3a3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a'::UUID,
    'c3a3c3a3-c3a3-c3a3-c3a3-c3a3c3a3c3a3'::UUID,
    '56',
    'I am an odd number. Take away one letter and I become even. What number am I?',
    'seven',
    5,
    12
);

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h3a3a3a1-a3a3-a3a3-a3a3-a3a3a3a3a3a1'::UUID,
    'c3a3c3a3-c3a3-c3a3-c3a3-c3a3c3a3c3a3'::UUID,
    1,
    'Each Fibonacci number is the sum of the two numbers before it: F(n) = F(n-1) + F(n-2)',
    10
),
(
    'h3a3a3a2-a3a3-a3a3-a3a3-a3a3a3a3a3a2'::UUID,
    'c3a3c3a3-c3a3-c3a3-c3a3-c3a3c3a3c3a3'::UUID,
    2,
    'Count: 1, 1, 2, 3, 5, 8, 13, 21, 34, and then add 34 + 21',
    15
);

-- ===================================================================
-- CHAPTER 4: COMPUTER SCIENCE - Binary Decoding
-- ===================================================================
-- Stage: 4
-- Difficulty: Medium
-- Topic: Binary and ASCII encoding
-- Answer: "hello"

INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c4a4c4a4-c4a4-c4a4-c4a4-c4a4c4a4c4a4'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    4,
    'Binary Message',
    'Computer Science',
    'Decode this binary message:
    
01001000 01100101 01101100 01101100 01101111',
    'Convert each 8-bit binary number to its ASCII character:
01001000 = 72 = H
01100101 = 101 = e
01101100 = 108 = l
01101100 = 108 = l
01101111 = 111 = o',
    'hello',
    NULL
);

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de4a4a4a-4a4a-4a4a-4a4a-4a4a4a4a4a4a'::UUID,
    'c4a4c4a4-c4a4-c4a4-c4a4-c4a4c4a4c4a4'::UUID,
    'world',
    'What has a head and a tail but no body?',
    'coin',
    5,
    10
);

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h4a4a4a1-a4a4-a4a4-a4a4-a4a4a4a4a4a1'::UUID,
    'c4a4c4a4-c4a4-c4a4-c4a4-c4a4c4a4c4a4'::UUID,
    1,
    'Binary uses only 0 and 1. In ASCII, uppercase letters start at 65.',
    10
),
(
    'h4a4a4a2-a4a4-a4a4-a4a4-a4a4a4a4a4a2'::UUID,
    'c4a4c4a4-c4a4-c4a4-c4a4-c4a4c4a4c4a4'::UUID,
    2,
    'Use an ASCII table. 01001000 in binary is 64 + 8 = 72, which is the letter H.',
    15
);

-- ===================================================================
-- CHAPTER 5: WORD PUZZLE - Final Challenge
-- ===================================================================
-- Stage: 5
-- Difficulty: Hard
-- Topic: Lateral thinking and word puzzles
-- Answer: "pencil lead"

INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c5a5c5a5-c5a5-c5a5-c5a5-c5a5c5a5c5a5'::UUID,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479'::UUID,
    5,
    'The Final Door',
    'Word Puzzle',
    'I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?',
    'The answer is a pencil lead (graphite). It is mined as graphite, placed in a wooden pencil case, and used by almost everyone without ever being released from the case.',
    'pencil lead',
    NULL
);

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de5a5a5a-5a5a-5a5a-5a5a-5a5a5a5a5a5a'::UUID,
    'c5a5c5a5-c5a5-c5a5-c5a5-c5a5c5a5c5a5'::UUID,
    'gold',
    'What is so fragile that saying its name breaks it?',
    'silence',
    10,
    20
);

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h5a5a5a1-a5a5-a5a5-a5a5-a5a5a5a5a5a1'::UUID,
    'c5a5c5a5-c5a5-c5a5-c5a5-c5a5c5a5c5a5'::UUID,
    1,
    'Think about materials that come from mines and are commonly used in writing.',
    15
),
(
    'h5a5a5a2-a5a5-a5a5-a5a5-a5a5a5a5a5a2'::UUID,
    'c5a5c5a5-c5a5-c5a5-c5a5-c5a5c5a5c5a5'::UUID,
    2,
    'Graphite is mined and placed in a wooden casing - it''s never removed but is used to write.',
    20
);

COMMIT;

-- Summary of seeded data:
-- - 1 Game: "Blackout" (120 minutes duration)
-- - 5 Chapters with varying difficulty levels
-- - 5 Dead End challenges with riddles and penalties
-- - 10 Hints (2 per chapter for progressive assistance)
--
-- Game Flow:
-- 1. Players start at Chapter 1 (Cryptography)
-- 2. On correct answer, advance to next stage
-- 3. On wrong answer, face dead end riddle and penalty
-- 4. Penalties: 5-10 minutes, 10-20 points deducted
-- 5. Hints cost 10-20 points to unlock
-- 6. Complete all 5 stages to finish the game
