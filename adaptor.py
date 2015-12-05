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

meetings = {}
territories = {}

for event in events:
    types = []
    encontros = []
    percursos = []
    event['startsOn'] = event['startsOn'][:8] + '%02d' % (int(event['startsOn'][8:])+1)
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

def save(name, data):
    data = json.dumps(data, indent=ind)
    checksum = md5.md5(data).hexdigest()
    open(os.path.join(DEST, '%s-pb.json' % name), 'w').write(data)
    open(os.path.join(DEST, '%s-pb.md5' % name), 'w').write(checksum)

save('events', events)
save('meetings', meetings_data)
save('territories', territories_data)
save('speakers', speakers)
save('spaces', spaces)
