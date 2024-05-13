import { AdapterMapDataType, ContextType, RouterFunction, RouterMethod } from "../../type";
import url from "url";

export default class MapRoute {
  Get: RouterMethod;
  Post: RouterMethod;
  Put: RouterMethod;
  Patch: RouterMethod;
  Delete: RouterMethod;
  Options: RouterMethod;
  Head: RouterMethod;
  All: RouterMethod;

  constructor(data: AdapterMapDataType) {
    this.Get = data.Get;
    this.Post = data.Post;
    this.Put = data.Put;
    this.Patch = data.Patch;
    this.Delete = data.Delete;
    this.Options = data.Options;
    this.Head = data.Head;
    this.All = data.All;
  }

  private async run(funs: Array<RouterFunction>, ctx: ContextType) {
    for (let i = 0; i < funs.length; ++i) {
      let res = await funs[i](ctx);
      if (res) {
        ctx.res.html(res);
        return;
      }
    }
  }

  private async inAll(path: string, ctx: ContextType) {
    let all = this.All[path];
    if (all) {
      await this.run(all, ctx);
    } else {
      all = this.All['/*'];
      if (all) {
        await this.run(all, ctx);
      }
    }
  }

  allocate = async (ctx: ContextType) => {
    let { req, res } = ctx;
    const parsedUrl = url.parse(String(req.url), true);
    const path = String(parsedUrl.pathname);

    switch (req.method) {
      case 'GET':
        let gets = this.Get[path];
        // console.log('get??????',gets,path);
        if (gets) {
          await this.run(gets, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'POST':
        let posts = this.Post[path];
        if (posts) {
          await this.run(posts, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'PUT':
        let puts = this.Put[path];
        if (puts) {
          await this.run(puts, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'PATCH':
        let patch = this.Patch[path];
        if (patch) {
          await this.run(patch, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'DELETE':
        let del = this.Delete[path];
        if (del) {
          await this.run(del, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'OPTIONS':
        let options = this.Options[path];
        if (options) {
          await this.run(options, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'HEAD':
        let head = this.Head[path];
        if (head) {
          await this.run(head, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
    }
  }
};