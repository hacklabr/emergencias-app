#!/usr/bin/python

import json

data = open('www/data/data-pb.json').read()
checksum = open('www/data/data-pb.md5').read()
version = open('www/data/api_version.txt').read()

code = "var API_VERSION = %d;\n\n" % int(version)
code += "var INITIAL_CHECKSUM = '%s';\n\n" % checksum
code += 'var INITIAL_DATA = ' + data + ';'

open('www/js/initialdata.js', 'w').write(code)
