# Grudges (Frontend Masters: React State)

We're starting out with a basic version of an application that uses hooks to manage state.

There are two issues that we'd like to solve for.

- **Prop drilling**: `Grudges` needs to receive `toggleForgiveness` even though it will never use it. It's just passing it down to `Grudge`.
- **Needless re-renders**: Everything re-renders even when we just check a single checkbox. We could try to get clever with some of React's performance helpers—or we can just manage our state better.

## Introducting the Application

- Turn on the "Highlight updates when components render." feature in the React developer tools.
- Notice how a checking a checkbox re-renderers everything.
- Notice how this is not the case in `NewGrudge`.

## Using a Reducer

We could try to get clever here with `useCallback` and `React.memo`, but since we're always replacing the array of grudges, this is never really going to work out.

What if we took a different approach to managing state?

Let's make a new file called `reducer.js`.

```js
const reducer = (state = [], action) => {
  return state;
};
```

And then we swap out that `useState` with a `useReducer`.

```js
const [grudges, dispatch] = useReducer(reducer, initialState);
```

We're going to create an action type and an action creator.

```js
const GRUDGE_ADD = 'GRUDGE_ADD';
const GRUDGE_FORGIVE = 'GRUDGE_FORGIVE';
```

```js
const addGrudge = ({ person, reason }) => {
  dispatch({
    type: GRUDGE_ADD,
    payload: {
      person,
      reason
    }
  });
};
```

We'll add it to the reducer.

```js
const reducer = (state = [], action) => {
  if (action.type === GRUDGE_ADD) {
    return [
      {
        id: id(),
        ...action.payload
      },
      ...state
    ];
  }
  return state;
};
```

### Forgiveness

Let's make an action creator

```js
const forgiveGrudge = id => {
  dispatch({
    type: GRUDGE_FORGIVE,
    payload: {
      id
    }
  });
};
```

We'll also update the reducer here.

```js
if (action.type === GRUDGE_FORGIVE) {
  return state.map(grudge => {
    if (grudge.id === action.payload.id) {
      return { ...grudge, forgiven: !grudge.forgiven };
    }
    return grudge;
  });
}
```

We'll thread through `forgiveGrudge` as `onForgive`.

```js
<button onClick={() => onForgive(grudge.id)}>Forgive</button>
```

That prop drilling isn't great, but we'll deal with it in a bit.

## Memoization

- Wrap the action creators in `useCallback`
- Wrap `NewGrudge` and `Grudge` in `React.memo`
- Notice how we can reduce re-renders

## The Context API

The above example wasn't _too_ bad. But, you can see how it might get a bit out of hand as our application grows.

What if two very different distant cousin components needed the same data?

Modern builds of React allow you to use something called the Context API to make this better. It's basically a way for very different pieces of your application to communicate with each other.

We're going to rip a lot out of `Application.js` and move it to a new file called `GrudgeContext.js` and it's going to look something like this.

```js
import React, { useReducer, createContext, useCallback } from 'react';
import initialState from './initialState';
import id from 'uuid/v4';

export const GrudgeContext = createContext();

const GRUDGE_ADD = 'GRUDGE_ADD';
const GRUDGE_FORGIVE = 'GRUDGE_FORGIVE';

const reducer = (state = [], action) => {
  if (action.type === GRUDGE_ADD) {
    return [
      {
        id: id(),
        ...action.payload
      },
      ...state
    ];
  }

  if (action.type === GRUDGE_FORGIVE) {
    return state.map(grudge => {
      if (grudge.id === action.payload.id) {
        return { ...grudge, forgiven: !grudge.forgiven };
      }
      return grudge;
    });
  }

  return state;
};

export const GrudgeProvider = ({ children }) => {
  const [grudges, dispatch] = useReducer(reducer, initialState);

  const addGrudge = useCallback(
    ({ person, reason }) => {
      dispatch({
        type: GRUDGE_ADD,
        payload: {
          person,
          reason
        }
      });
    },
    [dispatch]
  );

  const toggleForgiveness = useCallback(
    id => {
      dispatch({
        type: GRUDGE_FORGIVE,
        payload: {
          id
        }
      });
    },
    [dispatch]
  );

  return (
    <GrudgeContext.Provider value={{ grudges, addGrudge, toggleForgiveness }}>
      {children}
    </GrudgeContext.Provider>
  );
};
```

Now, `Application.js` looks a lot more slimmed down.

```js
import React from 'react';

import Grudges from './Grudges';
import NewGrudge from './NewGrudge';

const Application = () => {
  return (
    <div className="Application">
      <NewGrudge />
      <Grudges />
    </div>
  );
};

export default Application;
```

### Wrapping the Application in Your New Provider

```js
ReactDOM.render(
  <GrudgeProvider>
    <Application />
  </GrudgeProvider>,
  rootElement
);
```

That works and it's cool, but it's still missing the point.

### Hooking Up the Context API

So, we don't need that pass through on `Grudges` anymore. Let's rip that out completely.

```js
import React from 'react';
import Grudge from './Grudge';

const Grudges = ({ grudges = [] }) => {
  return (
    <section className="Grudges">
      <h2>Grudges ({grudges.length})</h2>
      {grudges.map(grudge => (
        <Grudge key={grudge.id} grudge={grudge} />
      ))}
    </section>
  );
};

export default Grudges;
```

But, we will need to tell it about the grudges so that it can iterate through them.

```js
import React from 'react';
import Grudge from './Grudge';
import { GrudgeContext } from './GrudgeContext';

const Grudges = () => {
  const { grudges } = React.useContext(GrudgeContext);

  return (
    <section className="Grudges">
      <h2>Grudges ({grudges.length})</h2>
      {grudges.map(grudge => (
        <Grudge key={grudge.id} grudge={grudge} />
      ))}
    </section>
  );
};

export default Grudges;
```

#### Individual Grudges

```js
import React from 'react';
import { GrudgeContext } from './GrudgeContext';

const Grudge = ({ grudge }) => {
  const { toggleForgiveness } = React.useContext(GrudgeContext);

  return (
    <article className="Grudge">
      <h3>{grudge.person}</h3>
      <p>{grudge.reason}</p>
      <div className="Grudge-controls">
        <label className="Grudge-forgiven">
          <input
            type="checkbox"
            checked={grudge.forgiven}
            onChange={() => toggleForgiveness(grudge.id)}
          />{' '}
          Forgiven
        </label>
      </div>
    </article>
  );
};

export default Grudge;
```

### Adding a New Grudge with the Context API

In this case, we _just_ need the ability to add a grudge.

```js
const NewGrudge = () => {
  const [person, setPerson] = React.useState('');
  const [reason, setReason] = React.useState('');
  const { addGrudge } = React.useContext(GrudgeContext);

  const handleSubmit = event => {
    event.preventDefault();

    addGrudge({
      person,
      reason
    });
  };

  return (
    // …
  );
};

export default NewGrudge;
```

## Implementing Undo/Redo

```js
{
  past: [allPastStates],
  present: currentStateOfTheWorld,
  future: [anyAndAllFutureStates]
}
```

### Some Tasting Notes

- We lost all of our performance optimizations.
- It's a trade off.
- Grudge List might seem like a toy application, but it could also represent a smaller part of a larger system.
- Could you use the Context API to get things all of the way down to this level and then use the approach we had previous?

## Alternative Data Structures

Okay, so that array stuff is a bit wonky.

What if we used an object?

All of this is going to happen in `GrudgeContext.js`.

What if our data was structured more like this?

```js
const defaultGrudges = {
  1: {
    id: 1,
    person: name.first(),
    reason: 'Parked too close to me in the parking lot',
    forgiven: false
  },
  2: {
    id: 2,
    person: name.first(),
    reason: 'Did not brew another pot of coffee after drinking the last cup',
    forgiven: false
  }
};
```

```js
export const GrudgeProvider = ({ children }) => {
  const [grudges, setGrudges] = useState({});

  const addGrudge = grudge => {
    grudge.id = id();
    setGrudges({
      [grudge.id]: grudge,
      ...grudges
    });
  };

  const toggleForgiveness = id => {
    const newGrudges = { ...grudges };
    const target = grudges[id];
    target.forgiven = !target.forgiven;
    setGrudges(newGrudges);
  };

  return (
    <GrudgeContext.Provider
      value={{ grudges: Object.values(grudges), addGrudge, toggleForgiveness }}
    >
      {children}
    </GrudgeContext.Provider>
  );
};
```

## Implementing Undo and Redo

We need to think about the past, present, and future.

```js
const defaultState = {
  past: [],
  present: [],
  future: []
};
```

We've broken almost everything. So, let's make this a bit better.

```js
const reducer = (state, action) => {
  if (action.type === ADD_GRUDGE) {
    return {
      past: [],
      present: [
        {
          id: uniqueId(),
          ...action.payload
        },
        ...state.present
      ],
      future: []
    };
  }

  if (action.type === FORGIVE_GRUDGE) {
    return {
      past: [],
      present: state.present.filter(grudge => grudge.id !== action.payload.id),
      future: []
    };
  }

  return state;
};
```

### Adding to the Stack

```js
past: [state.present, ...state.past];
```

```js
if (action.type === UNDO) {
  const [newPresent, ...newPast] = state.past;
  return {
    past: newPast,
    present: newPresent,
    future: [state.present, ...state.present]
  };
}
```

```js
const undo = useCallback(() => {
  dispatch({ type: UNDO });
}, [dispatch]);
```

```js
<button disabled={!state.past.length} onClick={undo}>
  Undo
</button>
```

### Getting Redo

```js
if (action.type === REDO) {
  const [newPresent, ...newFuture] = state.future;
  return {
    past: [state.present, ...state.past],
    present: newPresent,
    future: newFuture
  };
}
```

## Abstracting All of This

```js
const useUndoReducer = (reducer, initialState) => {
  const undoState = {
    past: [],
    present: initialState,
    future: []
  };

  const undoReducer = (state, action) => {
    const newPresent = reducer(state, action);

    if (action.type === UNDO) {
      const [newPresent, ...newPast] = state.past;
      return {
        past: newPast,
        present: newPresent,
        future: [state.present, ...state.future]
      };
    }

    if (action.type === REDO) {
      const [newPresent, ...newFuture] = state.future;
      return {
        past: [state.present, ...state.past],
        present: newPresent,
        future: newFuture
      };
    }

    return {
      past: [state.present, ...state.past],
      present: newPresent,
      future: []
    };
  };

  return useReducer(undoReducer, undoState);
};
```

## Implementing a React/Redux-like Abstraction

Let's make a new file called `connect.js`.

We'll start with some simple imports.

```js
import React, { createContext, useReducer } from 'react';
import initialState from './initialState';
import id from 'uuid/v4';
```

Let's also pull in the action types and reducer from `GrudgeContext.js`.

```js
export const GRUDGE_ADD = 'GRUDGE_ADD';
export const GRUDGE_FORGIVE = 'GRUDGE_FORGIVE';

export const reducer = (state = [], action) => {
  if (action.type === GRUDGE_ADD) {
    return [
      {
        id: id(),
        ...action.payload
      },
      ...state
    ];
  }

  if (action.type === GRUDGE_FORGIVE) {
    return state.map(grudge => {
      if (grudge.id === action.payload.id) {
        return { ...grudge, forgiven: !grudge.forgiven };
      }
      return grudge;
    });
  }

  return state;
};
```

We'll also want to create a context that we can use.

Alright, so now we'll make a new provider that will take the reducer's state and dispatch and thread it through the application.

Okay, let's make a generalized `Provider`.

```js
export const Provider = ({ reducer, initialState, children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};
```

Next, we'll make the `connect` function.

```js
export const connect = (
  mapStateToProps,
  mapDispatchToProps
) => Component => ownProps => {
  const { state, dispatch } = useContext(Context);

  let stateProps = {};
  let dispatchProps = {};

  if (isFunction(mapStateToProps)) {
    stateProps = mapStateToProps(state, ownProps);
  }

  if (isFunction(mapDispatchToProps)) {
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
  }

  Component.displayName = `Connected(${Component.displayName})`;

  return <Component {...stateProps} {...dispatchProps} {...ownProps} />;
};
```

We're going to make three container functions:

- `NewGrudgeContainer`
- `GrudgesContainer`
- `GrudgeContainer`

We're also going to need to rip the previous context out of.

#### index.js

```js
import React from 'react';
import ReactDOM from 'react-dom';

import Application from './Application';

import { reducer, Provider } from './connect';
import initialState from './initialState';

import './styles.css';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <Provider reducer={reducer} initialState={initialState}>
    <Application />
  </Provider>,
  rootElement
);
```

#### GrudgesContainer.js

```js
import { connect } from './connect';
import Grudges from './Grudges';

const mapStateToProps = state => {
  console.log({ state });
  return { grudges: state };
};

export default connect(mapStateToProps)(Grudges);
```

#### GrudgeContainer.js

```js
import { connect, GRUDGE_FORGIVE } from './connect';
import Grudge from './Grudge';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    forgive() {
      dispatch({
        type: GRUDGE_FORGIVE,
        payload: {
          id: ownProps.grudge.id
        }
      });
    }
  };
};

export default connect(null, mapDispatchToProps)(Grudge);
```

#### Grudges.js

```js
import React from 'react';
import GrudgeContainer from './GrudgeContainer';

const Grudges = ({ grudges }) => {
  return (
    <section className="Grudges">
      <h2>Grudges ({grudges.length})</h2>
      {grudges.map(grudge => (
        <GrudgeContainer key={grudge.id} grudge={grudge} />
      ))}
    </section>
  );
};

export default Grudges;
```

#### Grudge.js

```js
import React from 'react';
import { GrudgeContext } from './GrudgeContext';

const Grudge = React.memo(({ grudge, forgive }) => {
  return (
    <article className="Grudge">
      <h3>{grudge.person}</h3>
      <p>{grudge.reason}</p>
      <div className="Grudge-controls">
        <label className="Grudge-forgiven">
          <input type="checkbox" checked={grudge.forgiven} onChange={forgive} />{' '}
          Forgiven
        </label>
      </div>
    </article>
  );
});

export default Grudge;
```

#### Exercise

Can you implement `NewGrudgeContainer`?
