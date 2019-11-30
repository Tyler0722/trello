import * as express from "express";
import * as morgan from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";

import Controller from "./interfaces/controller.interface";

class App {
    public app: express.Application;

    constructor(controllers: Controller[]) {
        this.app = express();

        this.initializeMiddleware();
        this.initializeControllers(controllers);
    }

    public listen() {
        const port: number = process.env.PORT ? parseInt(process.env.PORT) : 5000;
        this.app.listen(port, () => {
            console.log(`Server is listening on http://localhost:${port}`);
        });
    }

    public getServer() {
        return this.app;
    }

    private initializeMiddleware() {
        this.app.use(
            morgan("dev", {
                skip: (req: express.Request, res: express.Response) => {
                    return res.statusCode < 400;
                }
            })
        );
        this.app.use(cookieParser());
        this.app.use(bodyParser.json());
    }

    private initializeControllers(controllers: Controller[]) {
        for (const controller of controllers) {
            this.app.use("/", controller.router);
        }
    }
}

export default App;
