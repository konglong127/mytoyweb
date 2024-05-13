import http from 'http';
import Trie from './utils/trie';

export enum Method { atask, task, koa, express };

declare module 'http' {
  interface IncomingMessage {
    body: { [key: string]: any };
    query: { [key: string]: any };
    params: { [key: string]: any };
  }

  interface ServerResponse {
    send: (value: any) => void;
    json: (value: any) => void;
    html: (content: string) => void;
    redirect: (Location: string) => void;
    body: any;
  }
}

export type RequestType = http.IncomingMessage;

export type ResponseType = http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage; };

export type ContextType = {
  method: string,
  url: string,
  headers: http.IncomingHttpHeaders,
  status: number,
  req: RequestType,
  res: ResponseType,
  state: {
    [key: string]: any
  }
};

export type MiddlewareFunctionType = (ctx: ContextType) => (Promise<(void | string)> | (void | string));

export type KoaMiddlewareFunctionType = (ctx: ContextType, next: () => void) => Promise<void>;;

export type ExpressMiddlewareFunctionType = (req: RequestType, res: ResponseType, next: () => void) => Promise<void>;;

export type TaskType = Array<MiddlewareFunctionType | Array<MiddlewareFunctionType> | KoaMiddlewareFunctionType | ExpressMiddlewareFunctionType>;

export type OptionType = {
  server: {
    type: "http" | "https" | "http2",
    SSL?: {
      cert: string,
      key: string
    }
  },
  RawBody?: {
    limit?: number;
    length?: number;
    expected?: number;
    received?: number;
    encoding?: string;
    status?: number;
    statusCode?: number;
    type?: string;
  }
};

export type RouterFunction = MiddlewareFunctionType;

export type RouterMethod = { [key: string]: Array<RouterFunction> };
// export type RouterMethod = { [key: string]: Array<RouterFunction> };

export interface AdapterMapDataType {
  Get: RouterMethod,
  Post: RouterMethod,
  Put: RouterMethod,
  Patch: RouterMethod,
  Delete: RouterMethod,
  Options: RouterMethod,
  Head: RouterMethod,
  All: RouterMethod,
}

export interface AdapterTrieDataType {
  Get: Trie,
  Post: Trie,
  Put: Trie,
  Patch: Trie,
  Delete: Trie,
  Options: Trie,
  Head: Trie,
  All: Trie,
};


export interface GuardInfoType {
  order: string[], funs: Array<(ctx: ContextType) => void>
}

export interface FilterInfoType {
  order: string[], funs: Array<(ctx: ContextType) => void>
}