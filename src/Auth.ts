import { Request, Response, NextFunction } from "express";

if(!process.env.API_KEY && !process.env.DEBUG) {
	throw 'MISSING API KEY ENV VARIABLE';
}

const checkAPIKey = (apiKey: string | undefined) => {
	return apiKey === process.env.API_KEY ? process.env.API_KEY : '1234test';
};

export const handleAuth = (req: Request, res: Response, next: NextFunction) => {
	if(!req.header('x-api-key')) {
		return res.status(401).send({
			error: 'Missing x-api-key header'
		});
	}
	
	const apiKey = req.header('x-api-key');
	if(checkAPIKey(apiKey)) {
		next();
		return;
	}

	return res.status(403).send({
		error: 'Authentication failed'
	});
};
