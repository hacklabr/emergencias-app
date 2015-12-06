#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json, urllib, sys, os, md5, datetime

try:
    DEST = sys.argv[1]
except IndexError:
    DEST = 'www/data'

BASE_URL = 'http://emergencias.cultura.gov.br/wp-content/uploads/json'

def load(name):
    data = urllib.urlopen('%s/%s-pb.json' % (BASE_URL, name)).read()
    return json.loads(data)

def get_index(data):
    index = {}
    for item in data:
        index[item['id']] = item
    return index

events = load('events')
spaces = load('spaces')
speakers = load('speakers')

for space in spaces:
    del space['shortDescription']
for spk in speakers:
    for key in ('speaker_title', 'speaker_keynote', 'shortDescription'):
        del spk[key]

def format_description(desc):
    ps = desc.split('\n')
    desc = ''
    for p in ps:
        if not p:
            continue
        desc += '<p>%s</p>\n' % p
    return desc;

def format_date(date):
    if not date:
        return ''

    week = [ '2ª feira',
             '3ª feira',
             '4ª feira',
             '5ª feira',
             '6ª feira',
             'Sábado',
             'Domingo' ]

    date = datetime.datetime.strptime(date, '%Y-%m-%d')

    return '%02d/%02d - %s' % (date.day, date.month, week[date.weekday()])

for speaker in speakers:
    speaker['description'] = format_description(speaker['description'])

speakers_ind = get_index(speakers)
spaces_ind = get_index(spaces)

meetings = {}
territories = {}

for event in events:
    types = []
    encontros = []
    percursos = []
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

    spk = []
    for speaker in event['speakers']:
        spk.append(speakers_ind[speaker])
    event['speakers'] = spk

    spaceId = event.pop('spaceId')
    if spaceId:
        event['space'] = spaces_ind[spaceId]
    else:
        event['space'] = ''

    event['date'] = format_date(event['startsOn'])

    keys = ['registration_code_text',
            'defaultImageThumb',
            'timestamp',
            'defaultImage',
            'registration_code_title',
            'registration_code',
            'shortDescription',
        ]
    for key in keys:
        del event[key]

    
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
}
data = json.dumps(data, indent=ind)
open(os.path.join(DEST, 'data-pb.json'), 'w').write(data)
open(os.path.join(DEST, 'data-pb.md5'), 'w').write(md5.md5(data).hexdigest())
