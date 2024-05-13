import { AdapterTrieDataType, ContextType, RouterFunction } from "../../type";
import Trie from "../../utils/trie";
import url from "url";

export default class TrieRouter {
  Get: Trie = new Trie();
  Post: Trie = new Trie();
  Put: Trie = new Trie();
  Patch: Trie = new Trie();
  Delete: Trie = new Trie();
  Options: Trie = new Trie();
  Head: Trie = new Trie();
  All: Trie = new Trie();

  constructor(data: AdapterTrieDataType) {
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
    let { params, funs } = this.All.match(path);
    ctx.req.params = params;
    // console.log(all);
    if (funs.length) {
      await this.run(funs, ctx);
    } else {
      funs = this.All.match('/*').funs;
      if (funs.length) {
        await this.run(funs, ctx);
      }
    }
  }

  public allocate = async (ctx: ContextType) => {
    let { req, res } = ctx;
    const parsedUrl = url.parse(String(req.url), true);
    const path = String(parsedUrl.pathname);

    switch (req.method) {
      case 'GET':
        let { params: getParams, funs: gets } = this.Get.match(path);
        ctx.req.params = getParams;
        // console.log('gets=', gets);
        if (gets.length) {
          await this.run(gets, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'POST':
        let { params: postParams, funs: posts } = this.Post.match(path);
        ctx.req.params = postParams;
        if (posts.length) {
          await this.run(posts, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'PUT':
        let { params: putParams, funs: puts } = this.Put.match(path);
        ctx.req.params = putParams;
        if (puts.length) {
          await this.run(puts, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'PATCH':
        let { params: patchParams, funs: patch } = this.Patch.match(path);
        ctx.req.params = patchParams;
        if (patch.length) {
          await this.run(patch, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'DELETE':
        let { params: deleteParams, funs: del } = this.Delete.match(path);
        ctx.req.params = deleteParams;
        if (del.length) {
          await this.run(del, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'OPTIONS':
        let { params: optionsParams, funs: options } = this.Options.match(path);
        ctx.req.params = optionsParams;
        if (options.length) {
          await this.run(options, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
      case 'HEAD':
        let { params: headParams, funs: head } = this.Options.match(path);
        ctx.req.params = headParams;
        if (head.length) {
          await this.run(head, ctx);
        } else {
          await this.inAll(path, ctx);
        }
        break;
    }
  }
};

