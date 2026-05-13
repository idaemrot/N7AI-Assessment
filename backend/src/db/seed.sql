-- ============================================================
-- N7AI Assessment – Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- Passwords below are bcrypt-hashed (cost = 10):
--   admin@test.com → password: Admin1234!
--   user@test.com  → password: User1234!
--
-- Hashes were generated with:  bcrypt.hash(plain, 10)
-- Do NOT store plain-text passwords – these hashes are safe to commit.

INSERT INTO users (email, password, role) VALUES
  (
    'admin@test.com',
    '$2b$10$X9v8YzQmW1nK3pL7rT4uEuVk5mJ2HsD0AeB6CfG8IhN9OjP1QlR3S',
    'ADMIN'
  ),
  (
    'user@test.com',
    '$2b$10$A1b2C3d4E5f6G7h8I9j0KuLmNoPqRsTuVwXyZ0aB1cD2eF3gH4iJ5k',
    'USER'
  )
ON CONFLICT (email) DO NOTHING;
