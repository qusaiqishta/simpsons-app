DROP TABLE IF EXISTS simp;

CREATE TABLE simp(
    id SERIAL PRIMARY KEY,
    quote VARCHAR(200),
    character_name VARCHAR(200),
    image_url VARCHAR(200),
    description VARCHAR(200)
)