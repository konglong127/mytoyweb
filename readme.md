## mytoyweb

web framework

## Installation

```
$ npm install mytoyweb
```

## Example 1

```typescript
import MyToyWeb, { SetStatic, Router } from "../src/app";

const app = new MyToyWeb();
const route = new Router();

route
  .all('/name/:id/age', (ctx) => {
    console.log('params=', ctx.req.params);
  }, async (ctx) => {
    let { req, res } = ctx;
    return JSON.stringify({ url: req.url, method: req.method as string });
  }, async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .get('/', async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string, desc: 'index page' });
  })
  .put('/', async (ctx) => {
    let { req, res } = ctx;
    res.redirect('/');
  })
  .all('/*', (ctx) => {
    let { req, res } = ctx;
    res.json({ msg: 'not found!', url: req.url, method: req.method as string });
  });

app.task((ctx) => {
  let { req, res } = ctx;
  (ctx.req as any).date = new Date().getTime();
});

app.task([
  (ctx) => {
    return new Promise((resolve, reject) => {
      let { req, res } = ctx;
      console.log(`promise all, ${req.url}${req.method as string}`);
      resolve();
    });
  },
  (ctx) => {
    return new Promise((resolve, reject) => {
      let { req, res } = ctx;
      console.log(`promise all, ${req.url}${req.method as string}`);
      resolve();
    });
  }
]);

app.task(SetStatic('./public'));

app.task(route.allocate());

app.task((ctx) => {
  let { req, res } = ctx;
  console.log(new Date().getTime() - (req as any).date, 'ms');
});

app.on('error', (err, ctx, i) => {
  let { req, res } = ctx;
  console.log('test.ts, line 28 ', err);
  res.json({ url: req.url, method: req.method as string, err: String(err) });
});

app.listen(8080, () => {
  console.log('127.0.0.1:8080');
});
```

## Example 2

```typescript
import MyToyWeb, { SetStatic, Compose, 
  Controller, Get, Request, Context, Post, Put, 
  Delete, Response, Params, Service, All 
} from "../src/app";
import { ContextType, RequestType, ResponseType } from "../src/type";
const app = new MyToyWeb();

class Services {
  public hello() {
    return 'hello';
  }
};

@Controller()
class Index extends Services {
  @Get('/main/id')
  public getUserInfo(@Context ctx: ContextType, @Params params: { [key: string]: any }, @Service service: any) {
    ctx.res.send({ msg: service.hello(), params });
  }
  @Get('/abc')
  setUserInfo(@Request req: RequestType, @Response res: ResponseType) {
    res.send('abc');
  }
  @Post('/admin')
  IndexPage(@Context ctx: ContextType) {
    ctx.res.html('admin');
  }
};

@Controller()
class Home {
  @Get()
  getUserInfo(@Context ctx: ContextType) {
    console.log('home!!!!!!!!!');
    ctx.res.send({ msg: 'ok' });
  }
  @Put('/update')
  setUserInfo(@Response res: ResponseType) {
    res.send({ msg: 'update' });
  }
  @Delete('/delete')
  IndexPage(@Response res: ResponseType) {
    res.send({ msg: 'del' });
  }
  @All('/id/car')
  all(@Params params: { [key: string]: any }, @Request req: RequestType, @Response res: ResponseType) {
    res.send({ method: req.method, msg: 'del', params });
  }
};

@Controller('/*')
class Other {
  @All('')
  all(@Params params: { [key: string]: any }, @Request req: RequestType, @Response res: ResponseType) {
    console.log('not found!!!!!!!!!!!!!!');
    res.send({ method: req.method, msg: 'del', params });
  }
};

app.task(Compose(Index, Home, Other));

app.task(SetStatic('./public'));

app.task((ctx) => {
  let { req, res } = ctx;
  (ctx.req as any).date = new Date().getTime();
  console.log(`response: ${req.url} method: ${req.method as string} query: ${new Date().getTime() - (req as any).date}ms`);
});

app.on('error', (err, ctx, i) => {
  let { req, res } = ctx;
  console.log('test.ts, line 28 ', err);
  res.json({ url: req.url, method: req.method as string, err: String(err) });
});

app.listen(8080, () => {
  console.log('127.0.0.1:8080');
});
```

