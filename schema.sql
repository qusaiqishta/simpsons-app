DROP TABLE IF EXISTS simp;

CREATE TABLE simp(
    id SERIAL PRIMARY  NOT NULL,
    quote VARCHAR(200),
    character VARCHAR(200),
    image VARCHAR(200),
    characterDirection VARCHAR(200)
)