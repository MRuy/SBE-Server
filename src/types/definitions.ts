import { FastifyReply, FastifyRequest } from 'fastify';

export interface IReply extends FastifyReply { }
export interface IRequest extends FastifyRequest {
  query: any;
  params: any;
}

export type VideoOrderByColumn = "timeSubmitted" | "startTime" | "votes" | "views" | "locked" | "category" | "shadowHidden";
export type VideoOrderDirection = "ASC" | "DESC";

export type Username = "string";
export type UserID = "string";
export type VideoID = "string";

export interface Config {
  web: {
    host: string;
    port: number;
  };
  postgres: string;
  defaultItemLimit: number;
}

export interface IGetUserStatsRequest extends FastifyRequest {
  query: {
    userID: string;
  }
}
