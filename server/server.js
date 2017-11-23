require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');
const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT;
const app = express();

// Parse JSON data in body
app.use(bodyParser.json());

// ADD A TODO
app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo
    .save()
    .then((todo) => {
        res.send({ todo });
      })
      .catch((err) => {
        res.status(400).send(err);
      });
});

// RETRIEVE ALL USER'S TODOS
app.get('/todos', authenticate, (req, res) => {
  Todo
    .find({ _creator: req.user._id })
    .then((todos) => {
      res.send({ todos });
    })
    .catch((err) => {
      res.status(400).send(err);
    })
});

// RETRIEVE USER'S TODO BY ID
app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid ID' });
  }

  Todo
    .findOne({
      _creator: req.user._id,
      _id: id
    })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send({ error: 'Todo not found' });
      }

      res.send({ todo });
    })
    .catch((err) => {
      res.status(400).send({ error: err });
    });
});

// DELETE USER'S TODO BY ID
app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid ID' });
  }

  Todo
    .findOneAndRemove({
      _id: id,
      _creator: req.user._id
    })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send({ error: 'Todo not found' });
      }

      res.send({ todo });
    })
    .catch((err) => {
      res.status(400).send({ error: err }); 
    })
});

// EDIT USER'S TODO BY ID
app.patch('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid ID' });
  }

  const body = _.pick(req.body, [ 'text', 'completed' ]);
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo
    .findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: body },
      { new: true }
    )
    .then((todo) => {
      if (!todo) {
        return res.status(404).send({ error: 'Todo not found' });
      }

      res.send({ todo });
    })
    .catch((err) => {
      res.status(400).send({ error: err });
    });
});

// SIGN UP NEW USER
app.post('/users', (req, res) => {
  const body = _.pick(req.body, [ 'email', 'password' ]);
  const user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.header('x-auth', token).send(user);
    })
    .catch((err) => {
      res.status(400).send({ error: err });
    })
});

// GET LOGGED IN USER'S INFORMATION
app.get('/users/me', authenticate, (req, res) => {
  res.send({ user: req.user });
});

// LOGIN USER
app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, [ 'email', 'password' ]);

  User
    .findByCredentials(body.email, body.password)
    .then((user) => {
      return user
        .generateAuthToken()
        .then((token) => {
          res.header('x-auth', token).send(user);
        });
    })
    .catch((err) => {
      res.status(400).send({ error: err });
    });
});

// LOGOUT USER (DELETE RELATED TOKEN)
app.delete('/users/me/token', authenticate, (req, res)=> {
  req.user.removeToken(req.token)
    .then(() => {
      res.status(200).send();
    })
    .catch((err) => {
      res.status(400).send({ error: err });
    })
});

// START SERVER
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

module.exports = {
  app
};