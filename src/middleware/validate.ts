import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

type ValidateTarget = "body" | "params" | "query";

export const validate = (
    schema: ZodType<unknown, unknown>,
    target: ValidateTarget = "body",
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            req[target] = schema.parse(req[target]);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const details: Record<string, string> = {};

                for (const issue of error.issues) {
                    details[issue.path.join(".")] = issue.message;
                }

                return res.status(400).json({
                    message: "Validation error",
                    details,
                });
            }
            next(error);
        }
    };
};
