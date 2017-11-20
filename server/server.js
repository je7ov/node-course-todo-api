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

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
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

app.get('/todos', (req, res) => {
  Todo
    .find()
    .then((todos) => {
      res.send({ todos });
    })
    .catch((err) => {
      res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid ID' });
  }

  Todo
    .findById(req.params.id)
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

app.delete('/todos/:id', (req, res) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send({ error: 'Invalid ID' });
  }

  Todo
    .findByIdAndRemove(id)
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

app.patch('/todos/:id', (req, res) => {
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
    .findByIdAndUpdate(id, { $set: body }, { new: true })
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

app.get('/users/me', authenticate, (req, res) => {
  res.send({ user: req.user });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})

module.exports = {
  app
}