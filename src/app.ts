import http from 'http';
import https from 'https';
import http2 from 'http2';
import fs from 'fs';
import Emitter from 'events';
import createContext from './ctx';

import {
  Method, OptionType, RequestType, ResponseType, ContextType,
  MiddlewareFunctionType, TaskType
} from "./type";

class MyToyWeb extends Emitter {
  private Tasks: TaskType = [];
  private LifeCycle: Method[] = [];
  public opts: OptionType | {} = {};
  public ctx: ContextType | {} = {};

  public constructor(opts?: OptionType) {
    super();
    this.opts = opts || { server: { type: 'http' } };
  }

  public task(fun: MiddlewareFunctionType | Array<MiddlewareFunctionType>) {
    if (typeof fun === 'function') {
      this.Tasks.push(fun);
      this.LifeCycle.push(Method.task);
    } else if (Array.isArray(fun)) {
      this.Tasks.push(fun);
      this.LifeCycle.push(Method.atask);
    }
  }

  private errorResponse(err: unknown) {
    if (this.listenerCount('error') > 0) {
      this.emit('error', err, this.ctx);
    } else {
      console.log('app.ts, line 37 ', err);
      let { res } = (<{ req: RequestType, res: ResponseType }>this.ctx);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'text/plain');
      res.end(String(err));
    }
  }

  private async run() {
    // console.log(this.LifeCycle, this.Tasks);
    for (let i = 0; i < this.LifeCycle.length; ++i) {

      switch (this.LifeCycle[i]) {
        case Method.task:
          try {
            let fun = <MiddlewareFunctionType>this.Tasks[i];
            let stop = await fun(this.ctx as ContextType);
            // console.log('stop==',stop,this.Tasks[i]);
            if (stop) {
              (<ContextType>this.ctx).res.html(String(stop));
              return;
            }
          } catch (err) {
            this.errorResponse(err);
            return;
          }
          break;
        case Method.atask:
          try {
            let funs = <Array<MiddlewareFunctionType>>this.Tasks[i];
            let query = [];
            for (let i = 0; i < funs.length; ++i) {
              query.push(await funs[i](this.ctx as ContextType));
            }
            await Promise.all(query);
          } catch (err) {
            this.errorResponse(err);
            return;
          }
          break;
      }

    }
  }

  public callback = () => {
    return async (req: RequestType, res: ResponseType) => {
      this.ctx = await createContext(req, res, this.opts);
      this.run();
      // res.end('ok');
    }
  }

  public listen(...params: any[]) {
    let { type, SSL } = (this.opts as OptionType).server;

    switch (type) {
      case 'http':
        let httpServer = http.createServer(this.callback());
        httpServer.listen(...params);
        break;
      case 'https':
        if (!SSL || !SSL.cert || !SSL.key) {
          throw new Error(`https' cert and key are missing. {
            server: {
              type: "http" | "https" | "http2",
              SSL?: {
                cert: string,
                key: string
              }
            }
          }`);
        }
        let httpsServer = https.createServer({
          cert: fs.readFileSync(SSL.cert),
          key: fs.readFileSync(SSL.key)
        }, this.callback());
        httpsServer.listen(...params);
        break;
      case 'http2':
        // 泛型 generic
        // if (!SSL || !SSL.cert || !SSL.key) {
        //   return;
        // }
        // let http2Server = http2.createSecureServer({
        //   cert: fs.readFileSync(SSL.cert),
        //   key: fs.readFileSync(SSL.key)
        // }, this.callback());
        // http2Server.listen(...params);
        break;
      default:
        break;
    }

  }
};

export default MyToyWeb;

export { default as SetStatic } from './utils/static';
export { default as Router } from './router/router';

export * from './router/decorate';

// export {
//   Compose, Controller, Services,
//   Context, Request, Response,
//   Params, Query, Body,
//   Get, Post, Put, Delete, Patch, Option, Head, All
// } from './router/decorate';
