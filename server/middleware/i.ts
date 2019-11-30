import * as express from "express";
import * as jwt from "jsonwebtoken";

const i = (req: express.Request | any, res: express.Response, next: express.NextFunction): void => {
  const token = req.cookies.token;
  jwt.verify(token, <string>process.env.JWT_SECRET, (err: jwt.VerifyErrors, decoded: any) => {
    if (err) {
      return res.status(401).json({
        message: "401: Unauthorized"
      });
    }
    const uid = decoded.uid;
    req.uid = uid;
    next();
  });
};

export default i;
