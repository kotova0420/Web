from aiohttp import web

routes=web.RouteTableDef()

@routes.get('/hello')
async def hello(req):
    return web.Response(text=f"hello students")

@routes.get('/python')
async def main(req):
    data=await req.json()
    print(data)
    return web.Response(text=f"accepted")

app=web.Application()
app.add_routes(routes)
web.run_app(app, port=8081)
