import { RouterFunction, RouterMethod } from "../type";
import Adapter from "./adapter";

/* 
  collect key and functions, determine a good router match method.
  map,trie
*/

class Router {
  type: "map" | "trie" = "map";
  Get: RouterMethod = {};
  Post: RouterMethod = {};
  Put: RouterMethod = {};
  Patch: RouterMethod = {};
  Delete: RouterMethod = {};
  Options: RouterMethod = {};
  Head: RouterMethod = {};
  All: RouterMethod = {};

  constructor() { }

  public get(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Get[RequestPath] = fun;
    return this;
  }

  public post(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Post[RequestPath] = fun;
    return this;
  }

  public put(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Put[RequestPath] = fun;
    return this;
  }

  public patch(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Patch[RequestPath] = fun;
    return this;
  }

  public del(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Delete[RequestPath] = fun;
    return this;
  }

  public options(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Options[RequestPath] = fun;
    return this;
  }

  public head(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.Head[RequestPath] = fun;
    return this;
  }

  public all(RequestPath: string, ...fun: RouterFunction[]) {
    this.match(RequestPath);
    this.All[RequestPath] = fun;
    return this;
  }

  public allocate = () => {
    let data = {
      Get: this.Get,
      Post: this.Post,
      Put: this.Put,
      Patch: this.Patch,
      Delete: this.Delete,
      Options: this.Options,
      Head: this.Head,
      All: this.All
    };
    return Adapter(this.type, data);
  }

  private match(RequestPath: string) {
    if (RequestPath.indexOf(':') != -1) {
      this.type = 'trie';
    }
  }
};

export default Router;