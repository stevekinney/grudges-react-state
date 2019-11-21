import React, { useContext } from 'react';

import Grudges from './Grudges';
import NewGrudge from './NewGrudge';
import { GrudgeContext } from './GrudgeContext';

const Application = () => {
  const { undo, isPast } = useContext(GrudgeContext);

  console.log({ undo, isPast });

  return (
    <div className="Application">
      <NewGrudge />
      <section>
        <button disabled={!isPast} onClick={undo}>
          Undo
        </button>
        <button>Redo</button>
      </section>
      <Grudges />
    </div>
  );
};

export default Application;
