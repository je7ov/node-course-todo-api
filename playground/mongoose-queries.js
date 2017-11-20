const { ObjectID } = require('mongodb');

const { mongoose } = require('../server/db/mongoose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');

// const id = '5a122e623f29b60f10d51356111';
// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Todo.find({
//     _id: id
//   })
//   .then((todos) => {
//     console.log('Todos: ', todos);
//   });

// Todo.findOne({
//     _id: id
//   })
//   .then((todo) => {
//     console.log('Todo: ', todo);
//   })

// Todo.findById(id)
//   .then((todo) => {
//     if (!todo) {
//       return console.log('Id not found');
//     }
//     console.log('Todo by id: ', todo);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const id = '5a12324cd7f0bf3533de5b69';

User
  .findById(id)
  .then((user) => {
    if (!user) {
      return console.log('User not found');
    }

    console.log('User: ', user);
  })
  .catch((err) => {
    console.log(err);
  })