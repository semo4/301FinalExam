DROP TABLE IF EXISTS record;

CREATE TABLE record(
    id SERIAL PRIMARY KEY NOT NULL,
    country VARCHAR(255),
    confirmed VARCHAR(50),
    deaths VARCHAR(50),
    recovered VARCHAR(50),
    date VARCHAR(50)
);