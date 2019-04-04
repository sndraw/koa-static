/**
 * Created by sn on 2019/4/4.
 */
const Koa = require('koa')
const path = require('path')
const iconv = require('iconv-lite')
const content = require('./util/content')
const mimes = require('./util/mimes')
const app = new Koa()

const port=3002
const staticPath = './static'

function parseMime (url) {
    let extName = path.extname(url)
    extName = extName ? extName.slice(1) : "unknown"
    return mimes[extName]
}


app.use(async (ctx) => {
    // 静态资源目录在本地的绝对路径
    let fullStaticPath = path.join(__dirname, staticPath)
    // 获取静态资源内容，有可能是文件内容，目录，或404
    let _content = await content(ctx, fullStaticPath)
    // 解析请求内容的类型
    let _mime = parseMime(ctx.url)
    // 如果有对应的文件类型，就配置上下文的类型
    if (_mime) {
        ctx.type = _mime
    }
    // 输出静态资源内容
    if (_mime && _mime.indexOf('image/') >= 0) {
        // 如果是图片，则用node原生res，输出二进制数据
        ctx.res.statusCode=200
        ctx.res.write(_content, 'binary')
        ctx.res.end()
    } else {
        const buf = Buffer.from(_content, 'binary')
        _content=iconv.decode(buf,'utf8')
        // 其他则输出文本
        ctx.body = _content
    }
})

app.listen(port)
console.log(`static-server is starting at port ${port}`)