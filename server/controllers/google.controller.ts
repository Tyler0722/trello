import * as express from "express";
import * as queryString from "query-string";
import axios, { AxiosResponse } from "axios";
import * as pg from "pg";
import { sign, decode } from "jsonwebtoken";

import db from "../db";
import genId from "../utils/genId";
import User from "../interfaces/user.interface";

class GoogleController {
    public path: string = "/api/auth/google";
    public router: express.Router = express.Router();

    private callbackPath: string = "http://localhost:5000/api/auth/google/callback";

    constructor() {
        this.login = this.login.bind(this);
        this.callback = this.callback.bind(this);

        this.initializeRoutes();
    }

    initializeRoutes(): void {
        this.router.get(this.path, this.login);
        this.router.get(`${this.path}/callback`, this.callback);
    }

    login(req: express.Request, res: express.Response): void {
        const queryStr = queryString.stringify({
            client_id: process.env.GOOGLE_CLIENT_ID,
            redirect_uri: this.callbackPath,
            response_type: "code",
            scope: "profile email"
        });

        res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${queryStr}`);
    }

    callback(req: express.Request, res: express.Response) {
        const code = req.query.code;
        const queryStr = queryString.stringify({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: this.callbackPath,
            grant_type: "authorization_code"
        });

        axios
            .post(`https://www.googleapis.com/oauth2/v4/token?${queryStr}`)
            .then((response: AxiosResponse) => {
                const { id_token } = response.data;
                const { given_name, family_name, email }: any = decode(id_token);

                const insertQuery =
                    'INSERT INTO "user" (id, email, first_name, last_name) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email RETURNING id, email, first_name, last_name';
                const values = [genId(), email, given_name, family_name];
                db.query(insertQuery, values).then((result: pg.QueryResult) => {
                    const user: User = result.rows[0];

                    const token = sign({ uid: user.id }, <string>process.env.JWT_SECRET, {
                        expiresIn: 600000
                    });

                    res.cookie("token", token, {
                        httpOnly: true
                        // secure: true
                    });

                    // TODO: Redirect back to client application
                    res.send("Authenticated successfully");
                });
            })
            .catch((error) => console.error(error.message));
    }
}

export default GoogleController;
