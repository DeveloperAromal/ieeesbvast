-- Seed chapters for existing Blackout game
-- Game ID: 08e4ca89-4951-4be0-aa53-fc6c99bdff71

BEGIN TRANSACTION;

-- ===================================================================
-- CHAPTER 1: CRYPTOGRAPHY - Caesar Cipher
-- ===================================================================
INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c1111111-1111-1111-1111-111111111111'::UUID,
    '08e4ca89-4951-4be0-aa53-fc6c99bdff71'::UUID,
    1,
    'Caesar''s Secret',
    'Cryptography',
    'Decode this message: Khoor Zruog
    
Hint: Each letter is shifted by 3 positions in the alphabet.',
    'This is a Caesar cipher with a shift of 3. Replace each letter with the one 3 positions before it in the alphabet: K→H, h→e, o→l, o→l, r→o, space, Z→W, o→l, u→r, o→l, g→d',
    'hello world',
    NULL
) ON CONFLICT DO NOTHING;

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de111111-1111-1111-1111-111111111111'::UUID,
    'c1111111-1111-1111-1111-111111111111'::UUID,
    'goodbye world',
    'I speak all languages but utter no words. What am I?',
    'echo',
    5,
    10
) ON CONFLICT DO NOTHING;

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h1111111-1111-1111-1111-111111111111'::UUID,
    'c1111111-1111-1111-1111-111111111111'::UUID,
    1,
    'Caesar cipher is the simplest form of substitution cipher where each letter is replaced by another letter a fixed number of positions down or up the alphabet.',
    10
),
(
    'h1111112-1111-1111-1111-111111111111'::UUID,
    'c1111111-1111-1111-1111-111111111111'::UUID,
    2,
    'Try shifting backwards: K→H, h→e, o→l, o→l, r→o',
    15
) ON CONFLICT DO NOTHING;

-- ===================================================================
-- CHAPTER 2: LOGIC - Bridge Crossing Puzzle
-- ===================================================================
INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c2222222-2222-2222-2222-222222222222'::UUID,
    '08e4ca89-4951-4be0-aa53-fc6c99bdff71'::UUID,
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
) ON CONFLICT DO NOTHING;

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de222222-2222-2222-2222-222222222222'::UUID,
    'c2222222-2222-2222-2222-222222222222'::UUID,
    '19',
    'What has cities but no houses, forests but no trees, and water but no fish?',
    'map',
    5,
    15
) ON CONFLICT DO NOTHING;

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h2222221-2222-2222-2222-222222222222'::UUID,
    'c2222222-2222-2222-2222-222222222222'::UUID,
    1,
    'The fastest person should act as a "shuttle" to help the slower ones cross.',
    10
),
(
    'h2222222-2222-2222-2222-222222222222'::UUID,
    'c2222222-2222-2222-2222-222222222222'::UUID,
    2,
    'C and D should cross together to minimize the time spent by the slowest person.',
    15
) ON CONFLICT DO NOTHING;

-- ===================================================================
-- CHAPTER 3: MATHEMATICS - Fibonacci Sequence
-- ===================================================================
INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c3333333-3333-3333-3333-333333333333'::UUID,
    '08e4ca89-4951-4be0-aa53-fc6c99bdff71'::UUID,
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
) ON CONFLICT DO NOTHING;

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de333333-3333-3333-3333-333333333333'::UUID,
    'c3333333-3333-3333-3333-333333333333'::UUID,
    '56',
    'I am an odd number. Take away one letter and I become even. What number am I?',
    'seven',
    5,
    12
) ON CONFLICT DO NOTHING;

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h3333331-3333-3333-3333-333333333333'::UUID,
    'c3333333-3333-3333-3333-333333333333'::UUID,
    1,
    'Each Fibonacci number is the sum of the two numbers before it: F(n) = F(n-1) + F(n-2)',
    10
),
(
    'h3333332-3333-3333-3333-333333333333'::UUID,
    'c3333333-3333-3333-3333-333333333333'::UUID,
    2,
    'Count: 1, 1, 2, 3, 5, 8, 13, 21, 34, and then add 34 + 21',
    15
) ON CONFLICT DO NOTHING;

-- ===================================================================
-- CHAPTER 4: COMPUTER SCIENCE - Binary Decoding
-- ===================================================================
INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c4444444-4444-4444-4444-444444444444'::UUID,
    '08e4ca89-4951-4be0-aa53-fc6c99bdff71'::UUID,
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
) ON CONFLICT DO NOTHING;

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de444444-4444-4444-4444-444444444444'::UUID,
    'c4444444-4444-4444-4444-444444444444'::UUID,
    'world',
    'What has a head and a tail but no body?',
    'coin',
    5,
    10
) ON CONFLICT DO NOTHING;

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h4444441-4444-4444-4444-444444444444'::UUID,
    'c4444444-4444-4444-4444-444444444444'::UUID,
    1,
    'Binary uses only 0 and 1. In ASCII, uppercase letters start at 65.',
    10
),
(
    'h4444442-4444-4444-4444-444444444444'::UUID,
    'c4444444-4444-4444-4444-444444444444'::UUID,
    2,
    'Use an ASCII table. 01001000 in binary is 64 + 8 = 72, which is the letter H.',
    15
) ON CONFLICT DO NOTHING;

-- ===================================================================
-- CHAPTER 5: WORD PUZZLE - Final Challenge
-- ===================================================================
INSERT INTO chapters (id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
VALUES (
    'c5555555-5555-5555-5555-555555555555'::UUID,
    '08e4ca89-4951-4be0-aa53-fc6c99bdff71'::UUID,
    5,
    'The Final Door',
    'Word Puzzle',
    'I am taken from a mine and shut up in a wooden case, from which I am never released, yet I am used by almost everyone. What am I?',
    'The answer is a pencil lead (graphite). It is mined as graphite, placed in a wooden pencil case, and used by almost everyone without ever being released from the case.',
    'pencil lead',
    NULL
) ON CONFLICT DO NOTHING;

INSERT INTO dead_ends (id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
VALUES (
    'de555555-5555-5555-5555-555555555555'::UUID,
    'c5555555-5555-5555-5555-555555555555'::UUID,
    'gold',
    'What is so fragile that saying its name breaks it?',
    'silence',
    10,
    20
) ON CONFLICT DO NOTHING;

INSERT INTO hints (id, chapter_id, level, text, point_cost) VALUES
(
    'h5555551-5555-5555-5555-555555555555'::UUID,
    'c5555555-5555-5555-5555-555555555555'::UUID,
    1,
    'Think about materials that come from mines and are commonly used in writing.',
    15
),
(
    'h5555552-5555-5555-5555-555555555555'::UUID,
    'c5555555-5555-5555-5555-555555555555'::UUID,
    2,
    'Graphite is mined and placed in a wooden casing - it''s never removed but is used to write.',
    20
) ON CONFLICT DO NOTHING;

COMMIT;
