import path from "path";
import fs from "fs";
import { ContextType } from "../type";

export default function SetStatic(basePath: string) {
  return (ctx: ContextType) => {
    const { req, res } = ctx;
    const filePath = path.join(basePath, String(req.url));

    // 检查文件是否存在
    fs.stat(filePath, (err, stat) => {
      if (err || !stat.isFile()) {
        // 文件不存在
        res.statusCode = 404;
        res.end('File not found');
        return;
      }

      // 获取文件扩展名
      const fileExtension = path.extname(filePath);
      let contentType;

      // 根据扩展名设置合适的Content-Type
      switch (fileExtension) {
        case '.html':
          contentType = 'text/html';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.js':
          contentType = 'application/javascript';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.mp4':
          contentType = 'video/mp4';
          break;
        default:
          contentType = 'application/octet-stream';
      }

      // 设置Content-Type头
      res.setHeader('Content-Type', contentType);

      // 创建可读流并将文件内容发送给客户端
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    });

    // fs.access(filePath, fs.constants.F_OK, (err) => { });
  }
}