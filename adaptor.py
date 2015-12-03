#!/usr/bin/env python

import json, urllib, sys, os

try:
    DEST = sys.argv[1]
except IndexError:
    DEST = 'www/data'

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
            encontro = encontro.replace(' e ', '').replace(' ', '')
            encontros.append(encontro)
            meetings[encontro] = 1
        elif track.startswith('Percurso '):
            percurso = track[9:]
            percurso = percurso.replace(' e ', '').replace(' ', '')
            percursos.append(percurso)
            territories[percurso] = 1
        elif track.startswith('Percursos Territoriais'):
            pass
        else:
            types.append(track)
    event['terms']['types'] = types
    event['terms']['meetings'] = encontros
    event['terms']['territories'] = percursos
    del event['terms']['tracks']

ind = 4

open(os.path.join(DEST, 'events-pb.json'), 'w').write(json.dumps(events, indent=ind))
open(os.path.join(DEST, 'meetings-pb.json'), 'w').write(json.dumps(sorted(meetings.keys()), indent=ind))
open(os.path.join(DEST, 'territories-pb.json'), 'w').write(json.dumps(sorted(territories.keys()), indent=ind))
open(os.path.join(DEST, 'speakers-pb.json'), 'w').write(json.dumps(speakers, indent=ind))
open(os.path.join(DEST, 'spaces-pb.json'), 'w').write(json.dumps(spaces, indent=ind))
