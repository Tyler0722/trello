require("dotenv").config();

import App from "./app";
import GoogleController from "./controllers/google.controller";
import BoardController from "./controllers/board.controller";

const app = new App([new GoogleController(), new BoardController()]);

app.listen();
