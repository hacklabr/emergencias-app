#!/usr/bin/python

import json

data = open('www/data/data-pb.json').read()
checksum = open('www/data/data-pb.md5').read()

code = "var INITIAL_CHECKSUM = '%s';\n\n" % checksum
code += 'var INITIAL_DATA = ' + data + ';'

open('www/js/initialdata.js', 'w').write(code)
