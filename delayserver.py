#!/usr/bin/python
# Este servidor foi criado pro desenvolvimento, pra simular uma conexao lenta durante

import tornado.ioloop
import tornado.web
import tornado.options
import time, random

class MainHandler(tornado.web.RequestHandler):
    def get(self, name, ext):
        if name == 'meetings':
            time.sleep(1)
        self.write(open('www/data/%s-pb.%s' % (name, ext)).read())
        #self.write('%d' % (random.random()*10000))


def make_app():
    return tornado.web.Application([
        (r"/data/(.+)-pb.(json|md5)", MainHandler),
    ], debug=True)

if __name__ == "__main__":
    tornado.options.parse_command_line()
    app = make_app()
    app.listen(8000)
    tornado.ioloop.IOLoop.current().start()
