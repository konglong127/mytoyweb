import MyToyWeb, { SetStatic, Router } from "../src/app";

const app = new MyToyWeb();
const route = new Router();

route
  .all('/name/:id/age', (ctx) => {
    console.log('suprise!!!!!!!!!', ctx.req.params);
  }, async (ctx) => {
    let { req, res } = ctx;
    // res.json({ url: req.url, method: req.method as string });
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
    // res.json({ url: req.url, method: req.method as string });
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
      console.log(`pass two, ${req.url}${req.method as string}`);
      resolve();
    });
  },
  (ctx) => {
    return new Promise((resolve, reject) => {
      let { req, res } = ctx;
      console.log(`pass two, ${req.url}${req.method as string}`);
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