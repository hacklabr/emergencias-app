#!/usr/bin/env python

import json, urllib

#percursos = [ 82, 79, 87, 74, 72, 26, 83, 77, 92, 88, 81, 80, 86, ]

BASE_URL = 'http://emergencias.cultura.gov.br/wp-content/uploads/json'

def load(name):
    data = urllib.urlopen('%s/%s-pb.json' % (BASE_URL, name)).read()
    return json.loads(data)

events = load('events')
spaces = load('spaces')
speakers = load('speakers')
spaces = load('spaces')

meetings = {}
territories = {}

for event in events:
    types = []
    encontros = []
    percursos = []
    for track in event['terms']['tracks']:
        if track.startswith('Encontro '):
            encontro = track[9:]
            if encontro.startswith('de '):
                encontro = encontro[3:]
            if encontro.startswith('Rede '):
                    encontro = encontro[5:]
            if encontro.startswith('Redes'):
                encontro = encontro[6:]
            if encontro.startswith('de '):
                encontro = encontro[3:]
            encontros.append(encontro)
            meetings[encontro] = 1
        elif track.startswith('Percurso '):
            percurso = track[9:]
            percursos.append(percurso)
            territories[percurso] = 1
        else:
            types.append(track)
    event['terms']['types'] = types
    event['terms']['meetings'] = encontros
    event['terms']['territories'] = percursos
    del event['terms']['tracks']

open('www/data/events-pb.json', 'w').write(json.dumps(events))
open('www/data/meetings-pb.json', 'w').write(json.dumps(sorted(meetings.keys())))
open('www/data/territories-pb.json', 'w').write(json.dumps(sorted(territories.keys())))
open('www/data/speakers-pb.json', 'w').write(json.dumps(speakers))
open('www/data/spaces-pb.json', 'w').write(json.dumps(spaces))
