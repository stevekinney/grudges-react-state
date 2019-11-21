import React, { useContext } from 'react';

import Grudges from './Grudges';
import NewGrudge from './NewGrudge';
import { GrudgeContext } from './GrudgeContext';

const Application = () => {
  const { undo, isPast, redo, isFuture } = useContext(GrudgeContext);

  console.log({ undo, isPast });

  return (
    <div className="Application">
      <NewGrudge />
      <section>
        <button className="full-width" disabled={!isPast} onClick={undo}>
          Undo
        </button>
        <button className="full-width" disabled={!isFuture} onClick={redo}>
          Redo
        </button>
      </section>
      <Grudges />
    </div>
  );
};

export default Application;
