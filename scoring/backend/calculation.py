from aiohttp import web

routes = web.RouteTableDef()

@routes.get('/hello')
async def hello(req):
    return web.Response(text='Hello, students')

@routes.post('/python')
async def main(req):
    data = await req.json()
    print(data)
    return web.json_response(data)

app = web.Application()
app.add_routes(routes)
web.run_app(app, port=8081)