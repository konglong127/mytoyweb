import MyToyWeb, {
  SetStatic, Compose,
  Controller, Get, Request, Context, Post, Put,
  Delete, Response, Params, Service, All, useGuard, useFilter
} from "../src/app";
// import Router from "../src/router/router";
import { ContextType, RequestType, ResponseType } from "../src/type";
const app = new MyToyWeb();

class Services {
  public hello() {
    return 'hello';
  }
};

const guard = (ctx: ContextType) => { console.log('guard1'); }

@Controller()
class Index extends Services {
  // baseUrl:string=''
  @Get('/main/id')
  @useGuard(
    guard,
    (ctx:ContextType) => { console.log('2',ctx.req.url); },
    () => { console.log('2.5'); }
  )
  @useFilter(
    () => { console.log('3'); },
    () => { console.log('4'); },
    () => { console.log('5'); },
    guard
  )
  public getUserInfo(@Context ctx: ContextType, @Params params: { [key: string]: any }, @Service service: any) {
    // console.log(this);
    ctx.res.send({ msg: service.hello(), params });
  }

  @Get('/abc')
  setUserInfo(@Request req: RequestType, @Response res: ResponseType) {
    res.send('abc');
  }

  @Post('/admin')
  @useGuard(
    guard,
    (ctx:ContextType) => { console.log('2',ctx.req.url); },
    () => { console.log('2.5'); }
  )
  @useFilter(
    () => { console.log('3'); },
    () => { console.log('4'); },
    () => { console.log('5'); },
    guard
  )
  IndexPage(@Context ctx: ContextType) {
    ctx.res.html('admin');
  }
};

@Controller()
class Home {
  // baseUrl:string=''
  @Get('/')
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
  // baseUrl:string=''
  @All('')
  all(@Params params: { [key: string]: any }, @Request req: RequestType, @Response res: ResponseType) {
    console.log('not found!!!!!!!!!!!!!!');
    res.send({ method: req.method, msg: 'not found!', params });
  }
};

app.task(Compose(Index, Home, Other));

// app.task((ctx) => {
//   let { req, res } = ctx;
//   return `${req.url} ${req.method as string}`;
// });

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