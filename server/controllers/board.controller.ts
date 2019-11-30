import * as express from "express";

import isAuthenticated from "../middleware/i";
import genId from "../utils/genId";
import db from "../db";
import { QueryResult } from "pg";

class BoardController {
    public path: string = "/api/boards";
    public router: express.Router = express.Router();

    constructor() {
        this.createBoard = this.createBoard.bind(this);

        this.initializeRoutes();
    }

    initializeRoutes(): void {
        this.router.post(this.path, isAuthenticated, this.createBoard);
        this.router.route(`${this.path}/:boardId`).get(isAuthenticated, this.getBoard);
        this.router.route(`${this.path}/:boardId/lists`).post(isAuthenticated, this.createList);
    }

    createBoard(req: express.Request | any, res: express.Response) {
        const uid = req.uid;
        const { visibility = "public", title } = req.body;

        if (!title) {
            return res.status(400).send({
                message: "400: Bad request"
            });
        }

        const queryStr = "INSERT INTO board (id, owner_id, visibility, title) VALUES ($1, $2, $3, $4) RETURNING *";
        const values: any[] = [genId(), uid, visibility, title];
        db.query(queryStr, values)
            .then((result) => {
                const board = result.rows[0];
                res.send({
                    board
                });
            })
            .catch((error) => {
                // handle error
            });
    }

    createList(req: express.Request | any, res: express.Response) {
        const boardId = req.params.boardId;
        const { title }: { title: string } = req.body;
        const uid = req.uid;
        const selQuery = "SELECT * FROM board WHERE id = $1 AND owner_id = $2";
        db.query(selQuery, [boardId, uid])
            // @ts-ignore TODO: Fix this ignoring TypeScript error
            .then((result: QueryResult) => {
                if (result.rowCount <= 0) {
                    return res.status(404).send({
                        message: "Board Not Found"
                    });
                }

                const insertQuery = "INSERT INTO list (id, board_id, title) VALUES ($1, $2, $3) RETURNING *";
                return db.query(insertQuery, [genId(), boardId, title]);
            })
            .then((result: QueryResult) => {
                const list = result.rows[0];
                res.send({ list });
            })
            .catch((err: any) => {
                // handle PosgreSQL error
            });
    }

    // https://trello.com/api/boards/:boardId (GET)
    getBoard(req: express.Request | any, res: express.Response) {
        const boardId = req.params.boardId;
        const userId = req.uid;
        const selectBoardQuery = `SELECT id, title, visibility, owner_id FROM board WHERE id = $1 AND owner_id = $2`;
        const selectListsQuery = `SELECT list.id, list.title FROM board, list WHERE list.board_id = $1 
            AND board.id = $1 AND board.owner_id = $2`;
        Promise.all([
            db.query(selectBoardQuery, [boardId, userId]),
            db.query(selectListsQuery, [boardId, userId])
        ]).then((results: QueryResult[]) => {
            const board = results[0].rows[0];
            if (board === undefined) {
                return res.status(404).send({
                    message: "Board Not Found"
                });
            }
            const lists = results[1].rows;
            res.send({
                board: {
                    ...board,
                    lists
                }
            });
        });
    }
}

export default BoardController;
