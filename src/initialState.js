import name from 'random-name';
import id from 'uuid/v4';

// This is some dummy data.
const initialState = [
  {
    id: id(),
    person: name.first(),
    reason: 'Parked too close to me in the parking lot',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Did not brew another pot of coffee after drinking the last cup',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Failed to wish me a happy birthday but ate my cake',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Generally obnoxious and unrepentant about that fact',
    forgiven: true
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Cut me in line at Safeway and then made eye contact',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Ate the last slice of pizza and left the box out',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Brought "paper products" to a potluck',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Talked over me when I was telling a story',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Changed my playlist as soon as I left the room for 30 seconds',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Spoiled the plot line for Avengers: Endgame',
    forgiven: false
  },
  {
    id: id(),
    person: name.first(),
    reason: 'Ate all of the vegan ham leftovers despite being labelled',
    forgiven: false
  }
];

export default initialState;
