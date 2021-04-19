import { IReply, IRequest } from '../types/definitions';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function readPublicConfigFile() {
  try {
    const publicConfigFile = path.join(__dirname, './../../public_config.json');
    const publicConfigContent = fs.readFileSync(publicConfigFile, 'utf8');
    return JSON.parse(publicConfigContent);
  }
  catch (error) {
    console.error('Failed to load or parse public_config.json', error);
    return {};
  }
}

function generateEtagFromObject(obj: object) {
  return crypto.createHash('md5').update(obj.toString()).digest('hex');
}

const publicConfig = readPublicConfigFile();
const etag = generateEtagFromObject(publicConfig);

export async function getConfig(req: IRequest, res: IReply): Promise<void> {
  if ('if-none-match' in req.headers) {
    if (req.headers['if-none-match'] === etag) {
      return res.code(304).send();
    }
  }
  res.header('ETag', etag);
  res.code(200).send({
    status: 'ok',
    data: { ...publicConfig },
  });
}
