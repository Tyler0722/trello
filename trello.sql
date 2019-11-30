CREATE TYPE color AS ENUM ('blue', 'red', 'green', 'yellow');

CREATE TYPE board_visibility AS ENUM ('private', 'team', 'public');

CREATE TABLE "user" (
  id bigint,
  first_name varchar(255),
  last_name varchar(255),
  email varchar(255)
);

CREATE TABLE board (
  id bigint,
  owner_id bigint,
  visibility board_visibility DEFAULT 'public',
  title varchar(128) NOT NULL,
  created_at timestamp DEFAULT current_timestamp,
	PRIMARY KEY (id),
	FOREIGN KEY (owner_id) REFERENCES "user" (id)
);

CREATE TABLE board_member (
  board_id bigint,
  user_id bigint,
	PRIMARY KEY (board_id, user_id),
	FOREIGN KEY (board_id) REFERENCES board (id),
	FOREIGN KEY (user_id) REFERENCES "user" (id)
);

CREATE TABLE list (
  id bigint,
 	board_id bigint,
  title varchar(128) NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (board_id) REFERENCES board (id)
);

CREATE TABLE card (
 	id bigint,
  list_id bigint, 
	content text NOT NULL, 
	created_at timestamp DEFAULT current_timestamp,
  start_date timestamp,
  end_date timestamp,
	PRIMARY KEY (id),
	FOREIGN KEY (list_id) REFERENCES list (id)
);

CREATE TABLE card_label (
  id bigint,
  card_id bigint,
  content text NOT NULL,
  color color DEFAULT 'blue',
	PRIMARY KEY (id),
	FOREIGN KEY (card_id) REFERENCES card (id)
);

CREATE TABLE card_member (
  card_id bigint,
  user_id bigint,
	PRIMARY KEY (card_id, user_id),
	FOREIGN KEY (card_id) REFERENCES card (id),
	FOREIGN KEY (user_id) REFERENCES "user" (id)
);
