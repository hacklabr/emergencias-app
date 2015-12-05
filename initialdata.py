#!/usr/bin/python

import json

def get(name):
    data = open('www/data/%s-pb.json' % name).read()
    checksum = open('www/data/%s-pb.md5' % name).read()
    return {
        'checksum': checksum,
        'data': json.loads(data)
    }

data = {}

for key in ('meetings',):
    data[key] = get(key)

open('www/js/initialdata.js', 'w').write('var initialData = ' + json.dumps(data, indent=4))
