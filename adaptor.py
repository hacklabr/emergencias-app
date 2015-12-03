#!/usr/bin/env python

import json

#percursos = [ 82, 79, 87, 74, 72, 26, 83, 77, 92, 88, 81, 80, 86, ]

events = json.loads(open('events-pb.json').read())
spaces = json.loads(open('spaces-pb.json').read())
meetings = {}
territories = {}

for event in events:
    tracks = []
    encontros = []
    percursos = []
    for track in event['terms']['tracks']:
        if track.startswith('Encontro '):
            encontro = track[9:]
            encontros.append(encontro)
            meetings[encontro] = 1
        elif track.startswith('Percurso '):
            percurso = track[9:]
            percursos.append(percurso)
            territories[percurso] = 1
        else:
            tracks.append(track)
    event['terms']['tracks'] = tracks
    event['terms']['meetings'] = encontros
    event['terms']['territories'] = territories

open('data/events-pb.json', 'w').write(json.dumps(events))
open('data/meetings-pb.json', 'w').write(json.dumps(sorted(meetings.keys())))
open('data/territories-pb.json', 'w').write(json.dumps(sorted(territories.keys())))
