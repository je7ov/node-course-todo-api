const jwt = require('jsonwebtoken');
const { ObjectID } = require('mongodb');

const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
  {
    _id: userOneId,
    email: 'userone@mail.com',
    password: 'useronepass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userOneId.toHexString(), access: 'auth' }, 'abc123').toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'usertwo@mail.com',
    password: 'usertwopass'
  }
];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 123
}];

const populateTodos = (done) => {
  Todo
    .remove({})
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => done());
};

const populateUsers = (done) => {
  User
    .remove({})
    .then(() => {
      const user1 = new User(users[0]).save();
      const user2 = new User(users[1]).save();
    
      return Promise.all([ user1, user2 ]);
    })
    .then(() => done());
};

module.exports = {
  populateTodos,
  todos,
  populateUsers,
  users
};