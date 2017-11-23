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
      token: jwt.sign({ _id: userOneId.toHexString(), access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
  },
  {
    _id: userTwoId,
    email: 'usertwo@mail.com',
    password: 'usertwopass',
    tokens: [{
      access: 'auth',
      token: jwt.sign({ _id: userTwoId.toHexString(), access: 'auth' }, process.env.JWT_SECRET).toString()
    }]
  }
];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 123,
  _creator: userTwoId  
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