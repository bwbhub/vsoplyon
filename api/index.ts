import type { VercelRequest, VercelResponse } from '@vercel/node'
import { withApi } from './_lib/handler.js'

export default withApi(async (_req: VercelRequest, _res: VercelResponse) => {
  return {
    name: 'VSOP-LYON API',
    version: '2.0.0',
    runtime: 'Vercel Serverless (Node.js)',
    endpoints: {
      'POST /api/auth':            'Login (login + password) -> { token, user }',
      'GET  /api/users':           'Liste / search (auth)',
      'GET  /api/users?id=<id>':   'Detail user (auth)',
      'POST /api/users':           'Creation (admin)',
      'PUT  /api/users?id=<id>':   'Maj (admin)',
      'DEL  /api/users?id=<id>':   'Suppression (admin)',
      'GET  /api/tournois':        'Liste (auth)',
      'GET  /api/lieux':           'Liste (auth)',
      'GET  /api/evenements':      'Liste, filtres ?upcoming=1 / ?recent=1 / ?tournoi=<id> (auth)',
      'GET  /api/evenements?id=':  'Detail session (auth)',
      'GET  /api/scores?evenement=<id>':   'Scores d\u2019une session (auth)',
      'GET  /api/scores?utilisateur=<id>': 'Historique d\u2019un joueur (auth)',
      'GET  /api/scores?tournoi=<id>':     'Scores agreges d\u2019un tournoi (auth)',
      'POST /api/scores':                  'Creation d\u2019un score (admin)',
      'GET  /api/leaderboard?tournoi=<id>': 'Classement saison (auth)',
      'GET  /api/leaderboard?all=1':        'Classement all-time (auth)',
    },
  }
})
