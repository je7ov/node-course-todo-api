const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { User } = require('./models/user');
const { Todo } = require('./models/todo');

const port = process.env.PORT || 3000;
const app = express();

// Parse JSON data in body
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo.save()
  .then((doc) => {
      res.send(doc);
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

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
})

module.exports = {
  app
}