import { compressSegmentsArray } from '../utils/compressSegmentsArray';
import { db, DB_OFFLINE_RESPONSE_OBJECT } from '../databases/databases';
import { IRequest, IReply } from '../types/definitions';
import { config } from '../config';

const ORDERBY_VALUES = [
  "timeSubmitted", "-timeSubmitted",
  "startTime", "-startTime",
  "votes", "-votes",
  "views", "-views",
  "locked", "-locked",
  "category", "-category",
  "shadowHidden", "-shadowHidden"
];

export async function getUserSegments(req: IRequest, res: IReply): Promise<void> {
  try {
    const userID = req.params.userID;
    if (!userID) {
      return res.code(400).send({
        status: 'error',
        code: 'MISSING_PARAMETER',
        msg: 'Parameter "userID" missing',
      });
    }
    let orderBy = req.query?.orderby ?? '-timeSubmitted';
    if (!ORDERBY_VALUES.includes(orderBy)) {
      return res.code(400).send({
        status: 'error',
        code: 'INVALID_VALUE',
        msg: 'Invalid "orderby" value',
      });
    }
    let orderDirection = orderBy.startsWith('-') ? 'DESC' : 'ASC';
    orderBy = orderBy.startsWith('-') ? orderBy.substr(1) : orderBy;
    const page = Number(req.query?.page ?? 1);
    let limit = config.defaultItemLimit;
    const result = await db.getSegmentsByUserID({
      userID,
      page,
      limit,
      orderBy,
      orderDirection,
    });
    let segments = result.items;
    if (req.query?.type === 'compressed') {
      segments = compressSegmentsArray(segments);
    }
    const totalPages = Math.ceil(result.total / limit);
    res.code(result.total === 0 ? 404 : 200).send({
      status: 'ok',
      userID,
      totalPages,
      totalItems: result.total,
      page: result.page,
      segments,
    });
  }
  catch (error) {
    return res.code(503).send(DB_OFFLINE_RESPONSE_OBJECT);
  }
}
