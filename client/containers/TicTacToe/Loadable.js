import React from 'react';
import universal from 'react-universal-component';
import path from 'path';

const TicTacToeLoadable = universal(() => import(/* webpackChunkName: 'tic-tac-toe' */ './TicTacToe'), {
  path: path.resolve(__dirname, './TicTacToe'),
  resolve: () => require.resolveWeak('./TicTacToe'),
  chunkName: 'tic-tac-toe',
  minDelay: 500
})

export default TicTacToeLoadable;
