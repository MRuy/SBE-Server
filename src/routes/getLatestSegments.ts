import { compressSegmentsArray } from '../utils/compressSegmentsArray';
import { db, DB_OFFLINE_RESPONSE_OBJECT } from '../databases/databases';
import { IRequest, IReply } from '../types/definitions';
import { config } from '../config';

export async function getLatestSegments(req: IRequest, res: IReply): Promise<void> {
  const page: number = Math.max(1, Number(req.query?.page ?? 1));
  const limit: number = Math.max(0, Math.min(config.defaultItemLimit, req.query?.limit ?? config.defaultItemLimit));
  try {
    const result = await db.getLatestSegments({ page, limit });
    let segments = result.items;

    if (req.query?.type === 'compressed') {
      segments = compressSegmentsArray(segments);
    }

    res.code(result.total === 0 ? 404 : 200).send({
      status: 'ok',
      segments,
    });
  }
  catch (error) {
    console.error(error);
    return res.code(503).send(DB_OFFLINE_RESPONSE_OBJECT);
  }
}
