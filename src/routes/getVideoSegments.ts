import { compressSegmentsArray } from '../utils/compressSegmentsArray';
import { db, DB_OFFLINE_RESPONSE_OBJECT } from '../databases/databases';
import { IRequest, IReply } from '../types/definitions';
import { config } from '../config';

const ORDERBY_VALUES = [
  'timeSubmitted', '-timeSubmitted',
  'startTime', '-startTime',
  'votes', '-votes',
  'views', '-views',
  'locked', '-locked',
  'category', '-category',
  'shadowHidden', '-shadowHidden'
];

export async function getVideoSegments(req: IRequest, res: IReply): Promise<void> {
  try {
    const videoID = req.params.videoID;
    if (!videoID) {
      return res.code(400).send({
        status: 'error',
        code: 'MISSING_PARAMETER',
        msg: 'Parameter "videoID" missing',
      });
    }
    let orderBy = req.query?.orderby ?? 'timeSubmitted';
    if (!ORDERBY_VALUES.includes(orderBy)) {
      return res.code(400).send({
        status: 'error',
        code: 'INVALID_VALUE',
        msg: 'Invalid "orderby" value',
      });
    }
    let orderDirection = orderBy.startsWith('-') ? 'DESC' : 'ASC';
    orderBy = orderBy.startsWith('-') ? orderBy.substr(1) : orderBy;
    let page = Number(req.query?.page ?? 1);
    let limit = config.defaultItemLimit;
    const result = await db.getSegmentsByVideoID({
      videoID,
      page,
      limit,
      orderBy,
      orderDirection,
    });
    const totalPages = Math.ceil(result.total / limit);

    let segments = result.items;
    if (req.query?.type === 'compressed') {
      segments = compressSegmentsArray(segments);
    }

    res.code(result.total === 0 ? 404 : 200).send({
      status: 'ok',
      videoID,
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
