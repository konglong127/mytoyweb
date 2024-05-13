import raw from 'raw-body';
import inflate from 'inflation';
import querystring from 'querystring';
import url from 'url';
import { OptionType, ContextType, RequestType, ResponseType } from "./type";

export default async function createContext(req: RequestType, res: ResponseType, opts: OptionType | {}) {
  (opts as OptionType).RawBody = 'RawBody' in opts ? opts.RawBody : {};

  req.body;
  try {
    req.body = querystring.parse((await raw(inflate(req))).toString());
  } catch (err) {
    req.body = {};
    console.log('Request body parse Error in ctx.ts.', err);
  }

  req.query;
  try {
    req.query = url.parse(req.url as string, true).query;
  } catch (err) {
    req.query = {};
    console.log('Request params parse Error in ctx.ts.', err);
  }

  req.params = {};

  res.send = (value: any) => {
    res.setHeader('Content-Type', 'text/plain');
    if (typeof value === 'string') {
      res.end(value);
    } else {
      res.end(JSON.stringify(value));
    }
  }

  res.json = (value: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(value));
  }

  res.html = (content: string) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(content);
  }

  res.redirect = (Location: string) => {
    res.writeHead(301, { Location });
    res.end();
  }

  const ctx: ContextType = {
    method: String(req.method),
    url: String(req.url),
    headers: req.headers,
    status: res.statusCode,
    req,
    res,
    state: {}
  };

  Object.defineProperty(ctx.res, 'body', {
    set: function (newValue) {
      ctx.res.send(newValue);
    }
  });

  return ctx;
}