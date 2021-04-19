import { IGetUserStatsRequest, IReply, IRequest } from '../types/definitions';
import { db, DB_OFFLINE_RESPONSE_OBJECT } from '../databases/databases';

export async function getUserStats(req: IRequest, res: IReply): Promise<any> {
  try {
    let userID = req.params.userID;
    if (!userID) {
      return res.code(400).send({
        status: 'error',
        code: 'MISSING_PARAMETER',
        msg: 'Parameter "userID" missing',
      });
    }
    const result = await db.getUserStats({userID});
    res.code(result ? 200 : 404).send({
      status: 'ok',
      data: result,
    });
  }
  catch (error) {
    return res.code(503).send(DB_OFFLINE_RESPONSE_OBJECT);
  }
}
