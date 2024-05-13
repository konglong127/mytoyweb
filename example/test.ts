import http from "http";
import MyToyWeb, { SetStatic, Router } from "../src/app";
// import Router from "../src/router/router";

const app = new MyToyWeb({ server: { type: 'http' } });
const route = new Router();

route
  .get('/', async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .post('/', async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .put('/', async (ctx) => {
    let { req, res } = ctx;
    res.redirect('/');
  })
  .patch('/', async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .del('/', async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .options('/', async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .all('/name/:id/age', (ctx) => {
    console.log('suprise!!!!!!!!!', ctx.req.params);
    return 'ok11';
  }, async (ctx) => {
    let { req, res } = ctx;
    // res.json({ url: req.url, method: req.method as string });
    return JSON.stringify({ url: req.url, method: req.method as string });
  }, async (ctx) => {
    let { req, res } = ctx;
    res.json({ url: req.url, method: req.method as string });
  })
  .all('/*', (ctx) => {
    let { req, res } = ctx;
    res.json({ msg: 'not found!', url: req.url, method: req.method as string });
  });

app.task((ctx) => {
  let { req, res } = ctx;
  (ctx.req as any).date = new Date().getTime();
  // return 'ok';
});

app.task([
  (ctx) => {
    return new Promise((resolve, reject) => {
      let { req, res } = ctx;
      console.log(`pass promise.all, ${req.url}${req.method as string}`);
      resolve();
    });
  },
  (ctx) => {
    return new Promise((resolve, reject) => {
      let { req, res } = ctx;
      console.log(`pass promise.all, ${req.url}${req.method as string}`);
      resolve();
    });
  }
]);

app.task((ctx) => {
  let { req, res } = ctx;
  console.log(`pass three, ${req.url}${req.method as string}`);
});


// app.task((ctx) => {
//   let { req, res } = ctx;
//   throw new Error('123');
//   res.end(`${req.url}${req.method as string}`);
// });

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

// let server=http.createServer(app.callback())
// server.listen(8080, () => {
//   console.log('127.0.0.1:8080');
// });

export default app.callback;