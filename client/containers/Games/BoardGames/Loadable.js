import React from 'react';
import universal from 'react-universal-component';
import path from 'path';

const BoardGamesLoadable = universal(() => import(/* webpackChunkName: 'board-games' */ './BoardGames'), {
  path: path.resolve(__dirname, './BoardGames'),
  resolve: () => require.resolveWeak('./BoardGames'),
  chunkName: 'board-games',
  minDelay: 500
})

export default BoardGamesLoadable;
