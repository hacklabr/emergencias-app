#!/usr/bin/env python

import json, urllib, sys, os, md5

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

def format_description(desc):
    ps = desc.split('\n')
    desc = ''
    for p in desc:
        if not p:
            continue
        desc += '<p>%s</p>\n' % p
    return desc;

meetings = {}
territories = {}

for event in events:
    types = []
    encontros = []
    percursos = []
    event['startsOn'] = event['startsOn'][:8] + '%02d' % (int(event['startsOn'][8:])+1)
    event['description'] = format_description(event['description'])
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
    event['types'] = types
    event['meetings'] = encontros
    event['territories'] = percursos
    del event['terms']

for speaker in speakers:
    speaker['description'] = format_description(speaker['description'])

ind = 4

meetings_data = []
for meeting in sorted(meetings.keys()):
    meetings_data.append({
        'id': meeting,
    })

territories_data = []
for territory in sorted(territories.keys()):
    territories_data.append({
        'id': territory,
    })

meetings_data[0]['telegram'] = 'http://emergencias.hacklab.com.br/chats/Xis'
territories_data[0]['telegram'] = 'http://emergencias.hacklab.com.br/chats/Xis'

data = {
    'events': events,
    'meetings': meetings_data,
    'territories': territories_data,
    'speakers': speakers,
    'spaces': spaces,
}
data = json.dumps(data, indent=ind)
open(os.path.join(DEST, 'data-pb.json'), 'w').write(data)
open(os.path.join(DEST, 'data-pb.md5'), 'w').write(md5.md5(data).hexdigest())
