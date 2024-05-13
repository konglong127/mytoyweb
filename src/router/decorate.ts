import 'reflect-metadata';
import { RouterMethod, ContextType, RequestType, MiddlewareFunctionType, GuardInfoType, FilterInfoType } from "../type";
import Adapter from './adapter';
// 属性 > 方法 > 方法参数 > 类

const GetMethod: RouterMethod = {};
const PostMethod: RouterMethod = {};
const PutMethod: RouterMethod = {};
const PatchMethod: RouterMethod = {};
const DeleteMethod: RouterMethod = {};
const OptionsMethod: RouterMethod = {};
const HeadMethod: RouterMethod = {};
const AllMethod: RouterMethod = {};
const service: { [key: string]: (params?: any) => Promise<any> } = {};
let routerType: string = 'map';

function matchRouterType(RequestPath: string) {
  if (RequestPath.indexOf(':') != -1) {
    routerType = 'trie';
  }
}

// restful,export to middleware compose controller class 
export function Compose(...args: (new () => any)[]) {
  // console.log('args=', args[0]);

  let data = {
    Get: GetMethod,
    Post: PostMethod,
    Put: PutMethod,
    Patch: PatchMethod,
    Delete: DeleteMethod,
    Options: OptionsMethod,
    Head: HeadMethod,
    All: AllMethod
  };
  // console.log(data);
  return Adapter(routerType, data);
}

// set function params Array 
function methodParamsCompose(order: string[], fun: Function): MiddlewareFunctionType {
  let setfun = async (ctx: ContextType) => {
    let setParams = [];
    for (let item of order) {
      if (item == 'ctx') {
        setParams.push(ctx);
      } else if (item == 'req') {
        setParams.push(ctx.req);
      } else if (item == 'res') {
        setParams.push(ctx.res);
      } else if (item == 'body') {
        setParams.push(ctx.req.body);
      } else if (item == 'params') {
        setParams.push(ctx.req.params);
      } else if (item == 'query') {
        setParams.push(ctx.req.query);
      } else if (item == 'service') {
        setParams.push(service);
      }
    }
    fun(...setParams);
  };

  return setfun;
}

// classDecorator collect params and functions
export function Controller(baseUrl?: string) {
  // console.log(baseUrl);
  return function (target: Function) {
    // if (baseUrl === undefined) baseUrl = `/${target.name}`;
    if (baseUrl === undefined) baseUrl = '';
    // console.log(baseUrl);
    // console.log('Controller==', target.prototype, baseUrl, target);
    let funs = Object.getOwnPropertyNames(target.prototype);

    // console.log(funs, Object.getPrototypeOf(target).prototype);

    if (Object.getPrototypeOf(target).prototype) {
      let base = Object.getPrototypeOf(target).prototype;
      let str = Object.getOwnPropertyNames(base);

      for (let key of str) {
        if (typeof base[key] === 'function' && key != 'constructor') {
          service[key] = base[key];
        }
      }
      // console.log(service.hello());
    }

    const addGuardFilter = (funs: RouterMethod, path: string, guard: GuardInfoType, filter: FilterInfoType) => {
      if (guard?.order && guard?.funs?.length) {
        for (let i in guard.funs) {
          funs[path].unshift(methodParamsCompose(guard.order, guard.funs[i]));
        }
      }
      if (filter?.order && filter?.funs?.length) {
        for (let i in filter.funs) {
          funs[path].push(methodParamsCompose(filter.order, filter.funs[i]));
        }
      }
    }

    for (let key of funs) {
      if (typeof target.prototype[key] === 'function' && key != 'constructor') {

        let res = Reflect.getMetadata(key, target.prototype, key);
        if (!res) break;

        const { param, order, method, fun, guard, filter }: {
          param: string, order: string[], method: string, fun: Function,
          guard: GuardInfoType, filter: FilterInfoType
        } = res;
        guard.funs = guard.funs.reverse();
        // console.log('receive====', param, order, method, fun, guard, filter);

        let RequestUrl = baseUrl + param;
        matchRouterType(RequestUrl);

        switch (method) {
          case 'get':
            // let get: MiddlewareFunctionType
            GetMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(GetMethod, RequestUrl, guard, filter);
            break;
          case 'post':
            PostMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(PostMethod, RequestUrl, guard, filter);
            break;
          case 'put':
            PutMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(PutMethod, RequestUrl, guard, filter);
            break;
          case 'delete':
            DeleteMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(DeleteMethod, RequestUrl, guard, filter);
            break;
          case 'patch':
            PatchMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(PatchMethod, RequestUrl, guard, filter);
            break;
          case 'option':
            OptionsMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(OptionsMethod, RequestUrl, guard, filter);
            break;
          case 'head':
            HeadMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(HeadMethod, RequestUrl, guard, filter);
            break;
          case 'all':
            AllMethod[RequestUrl] = [methodParamsCompose(order, fun)];
            addGuardFilter(AllMethod, RequestUrl, guard, filter);
            break;
        };
        // console.log('res===', res);
      }
    }
  }
}

// generate function params Array
function setMethodParams(target: Object, propertyKey: string | symbol) {
  let order: string[] = [];
  let setContext: { position: number[], type: string } = Reflect.getMetadata('setContext', target, propertyKey);
  if (setContext) {
    for (let i of setContext.position) {
      order[i] = setContext.type;
    }
  }
  let setRequest: { position: number[], type: string } = Reflect.getMetadata('setRequest', target, propertyKey);
  if (setRequest) {
    for (let i of setRequest.position) {
      // console.log('req=', i, setRequest);
      order[i] = setRequest.type;
    }
  }
  let setResponse: { position: number[], type: string } = Reflect.getMetadata('setResponse', target, propertyKey);
  if (setResponse) {
    for (let i of setResponse.position) {
      // console.log('res=', i, setResponse);
      order[i] = setResponse.type;
    }
  }
  let setBody: { position: number[], type: string } = Reflect.getMetadata('setBody', target, propertyKey);
  if (setBody) {
    for (let i of setBody.position) {
      order[i] = setBody.type;
    }
  }
  let setParams: { position: number[], type: string } = Reflect.getMetadata('setParams', target, propertyKey);
  if (setParams) {
    for (let i of setParams.position) {
      order[i] = setParams.type;
    }
  }
  let setQuery: { position: number[], type: string } = Reflect.getMetadata('setQuery', target, propertyKey);
  if (setQuery) {
    for (let i of setQuery.position) {
      order[i] = setQuery.type;
    }
  }
  let setService: { position: number[], type: string } = Reflect.getMetadata('setService', target, propertyKey);
  if (setService) {
    for (let i of setService.position) {
      order[i] = setService.type;
    }
  }

  return order;
}

/* 
  MethodDecorator collect get,post,delete,put,patch,head,option,all function 
  and params position that give to classDecorator
*/
export const useGuard = (...funs: Array<(ctx: ContextType) => void>): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {

    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] }
    };

    let value: { guard: GuardInfoType, filter: FilterInfoType } = {
      guard: { order: ['ctx'], funs: [...existingMetadata.guard.funs, ...funs] },
      filter: { order: ['ctx'], funs: [...existingMetadata.filter.funs] },
    };

    Reflect.defineMetadata(propertyKey, value, target);
  }
}

export const useFilter = (...funs: Array<(ctx: ContextType) => void>): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {

    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] }
    };

    let value: { guard: GuardInfoType, filter: FilterInfoType } = {
      guard: { order: ['ctx'], funs: [...existingMetadata.guard.funs] },
      filter: { order: ['ctx'], funs: [...existingMetadata.filter.funs, ...funs] },
    };

    Reflect.defineMetadata(propertyKey, value, target);
  }
}

export const Get = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;
    // console.log('get===', target, propertyKey, param);
    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'get', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const Post = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'post', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const Put = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'put', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const Delete = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'delete', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const Patch = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'patch', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const Options = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'option', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const Head = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'head', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

export const All = (param?: string): MethodDecorator => {
  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
    if (param === undefined) param = `/${String(propertyKey)}`;

    let order = setMethodParams(target, propertyKey);
    // console.log(order);
    const existingMetadata = Reflect.getMetadata(propertyKey, target) || {};
    // console.log('get existing===', existingMetadata);

    let value = {
      param, order, method: 'all', fun: descriptor.value,
      guard: { order: ['ctx'], funs: [] },
      filter: { order: ['ctx'], funs: [] },
      ...existingMetadata
    };

    Reflect.defineMetadata(propertyKey, value, target, propertyKey);
  }
}

/* 
  ParameterDecorator collect the params position
  give to MethodDecorator
 */
export const Context: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setContext', { position, type: 'ctx' }, target, String(propertyKey));
}


export const Request: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setRequest', { position, type: 'req' }, target, String(propertyKey));
}

export const Response: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setResponse', { position, type: 'res' }, target, String(propertyKey));
}

export const Body: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setBody', { position, type: 'body' }, target, String(propertyKey));
}

export const Params: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setParams', { position, type: 'params' }, target, String(propertyKey));
}

export const Query: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setQuery', { position, type: 'query' }, target, String(propertyKey));
}

export const Service: ParameterDecorator = (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
  let position: number[] = [];
  position.push(parameterIndex);
  // console.log('????', target.constructor, propertyKey, parameterIndex);
  Reflect.defineMetadata('setService', { position, type: 'service' }, target, String(propertyKey));
}
