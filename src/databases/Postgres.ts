import { Client, Pool, types } from 'pg';
import { UserID, Username, VideoID, VideoOrderByColumn, VideoOrderDirection } from '../types/definitions';

// return numeric (pg_type oid=1700) as float
types.setTypeParser(1700, function(val) {
    return parseFloat(val);
});

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class Postgres {
  private pool: Pool;
  private active: boolean;

  isActive() {
    return this.active;
  }

  constructor(connectionString: string) {
    this.active = false;
    this.pool = new Pool({
      connectionString,
    });
    this.pool.on('error', async (error) => {
      console.info('[Postgres]', error.message);
    });
  }

  async init() {
    this.active = true;
  }

  async close() {
    this.active = false;
    await this.pool.end();
  }

  async getLatestSegments({page = 1, limit}: {page: number, limit: number}) {
    const offset = Math.max(0, (page - 1)) * limit;
    const fields = `"videoID", "startTime", "endTime", "votes", "views", "locked",
                    "UUID", "category", "shadowHidden", "userID", "userName", "timeSubmitted"`;
    const query = `SELECT distinct ${fields} FROM "sponsorTimes" LEFT OUTER JOIN "userNames" USING("userID") ORDER BY "timeSubmitted" DESC LIMIT $1 OFFSET $2`;
    const items = (await this.pool.query(query, [limit, offset]))?.rows ?? [];
    return {
      limit,
      items,
    };
  }

  async getSegmentsByVideoID({videoID, page = 1, limit = 100, orderBy = 'timeSubmitted', orderDirection = 'ASC'}: {videoID: VideoID, page?: number, limit?: number, orderBy?: VideoOrderByColumn, orderDirection?: VideoOrderDirection}) {
    const offset = Math.max(0, (page-1)) * limit;
    const result = await this.pool.query({
      text: `
        SELECT distinct
          "videoID", "startTime", "endTime", "votes", "views", "locked",
          "UUID", "category", "shadowHidden", "userID", "userName", "timeSubmitted"
        FROM "sponsorTimes"
        LEFT JOIN "userNames" USING("userID")
        WHERE "videoID" = $1
        ORDER BY "${orderBy}" ${orderDirection}
        LIMIT $2
        OFFSET $3`,
      values: [videoID, limit, offset]
    });
    const items = result?.rows;
    const result2 = await this.pool.query({
      text: `
        SELECT count(1) as total
        FROM "sponsorTimes"
        WHERE "videoID" = $1`,
      values: [videoID]
    });
    // postgres returns count() as string because of bigint conversion
    const total = Number(result2.rows[0]?.total ?? 0);
    return {
      page,
      total,
      items,
    }
  }

  async getSegmentsByUserID({userID, page = 1, limit = 100, orderBy = 'timeSubmitted', orderDirection = 'DESC'}: {userID: UserID, page?: number, limit?: number, orderBy?: VideoOrderByColumn, orderDirection?: VideoOrderDirection}) {
    const offset = Math.max(0, (page - 1)) * limit;
    const result = await this.pool.query(`
      SELECT distinct
        "videoID", "startTime", "endTime", "votes", "views", "locked",
        "UUID", "category", "shadowHidden", "userID", "timeSubmitted"
      FROM "sponsorTimes"
      WHERE "userID" = $1
      ORDER BY "${orderBy}" ${orderDirection}
      LIMIT $2
      OFFSET $3`, [userID, limit, offset]);
    const items = result?.rows ?? [];
    const result2 = await this.pool.query(`
      SELECT count(1) as total
      FROM "sponsorTimes"
      WHERE "userID" = $1`, [userID]);
    const total = Number(result2?.rows[0].total ?? 0);
    return {
      page,
      total,
      items,
    }
  }

  async getUserStats({userID}: {userID: UserID}): Promise<any> {
    const ignoredSubmissionsResult = await this.pool.query(`SELECT count(1) as total FROM "sponsorTimes" WHERE "userID" = $1 AND "votes" < -1`, [userID]);
    const submissionsIgnored = Number(ignoredSubmissionsResult?.rows[0].total ?? 0);

    const totalSubmissionsResult = await this.pool.query(`SELECT count(1) as total FROM "sponsorTimes" WHERE "userID" = $1`, [userID]);
    const submissionsTotal = Number(totalSubmissionsResult?.rows[0]?.total ?? 0);

    const viewsTotalResult = await this.pool.query(`SELECT SUM("views") as total FROM "sponsorTimes" WHERE "userID" = $1`, [userID]);
    const viewsTotal = Number(viewsTotalResult?.rows[0]?.total ?? 0);

    const viewsIgnoredResult = await this.pool.query(`SELECT SUM("views") as total FROM "sponsorTimes" WHERE "userID" = $1 AND "votes" < -1`, [userID]);
    const viewsIgnored = Number(viewsIgnoredResult?.rows[0]?.total ?? 0);

    const usernameResult = await this.pool.query(`SELECT "userName" FROM "userNames" WHERE "userID" = $1 LIMIT 1`, [userID]);
    const username = usernameResult?.rows[0]?.userName ?? '—';

    return {
      submissions: {
        total: submissionsTotal,
        ignored: submissionsIgnored,
      },
      views: {
        total: viewsTotal,
        ignored: viewsIgnored,
      },
      username: username,
    };
  }
}
