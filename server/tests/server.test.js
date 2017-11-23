const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('../server');
const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const seed = require('./seed/seed');

beforeEach(seed.populateUsers);
beforeEach(seed.populateTodos);

/* -------------------- */
/*      POST /todos     */
/* -------------------- */

describe('POST /todos', () => {
  it ('should create a new todo', (done) => {
    const text = 'test todo text';

    request(app)
      .post('/todos')
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo
          .find({ text })
          .then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((err) => done(err));
      });
  });

  it ('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo
          .find()
          .then((todos) => {
            expect(todos.length).toBe(seed.todos.length);
            done();
          })
          .catch(err => done(err));
      });
  });
});

/* -------------------- */
/*      GET /todos      */
/* -------------------- */

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(seed.todos.length);
      })
      .end(done);
  })
});

/* -------------------- */
/*    GET /todos/:id    */
/* -------------------- */

describe('GET /todos/:id', () => {
  it('should return todo document', (done) => {
    request(app)
      .get(`/todos/${seed.todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(seed.todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
      .get(`/todos/${new ObjectID().toHexString()}`)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  });
});

/* -------------------- */
/*   DELETE /todos/:id  */
/* -------------------- */

describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const hexId = seed.todos[0]._id.toHexString();
    request(app)
      .delete(`/todos/${hexId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Todo
          .findById(hexId)
          .then((todo) => {
            expect(todo).toBeFalsy();
            done();
          })
          .catch((err) => {
            done(err);
          })
      })
  });

  it('should return 404 if todo not found', (done) => {
    request(app)
    .delete(`/todos/${new ObjectID().toHexString()}`)
    .expect(404)
    .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
    .delete('/todos/123')
    .expect(404)
    .end(done);
  });
});

/* -------------------- */
/*   PATCH /todos/:id   */
/* -------------------- */

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const id = seed.todos[0]._id.toHexString();
    const text = 'new text';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const id = seed.todos[1]._id.toHexString();
    const text = 'new text';

    request(app)
      .patch(`/todos/${id}`)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBeFalsy();
      })
      .end(done);
  });
});

/* -------------------- */
/*      POST /users     */
/* -------------------- */

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'test@mail.com';
    const password = 'testpass';

    request(app)
      .post('/users')
      .send({
        email,
        password
      })
      .expect(200)
      .expect((res) => {
        expect(res.header['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User
          .findOne({ email })
          .then((user) => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password);            
            expect(user.tokens).toBeTruthy();
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  it('should return validation errors if email is invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'testmail.com',
        password: 'abc123'
      })
      .expect(400)
      .end(done);
  });

  it('should return validation errors if password is invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'test@mail.com',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email is in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: seed.users[0].email,
        password: '123'
      })
      .expect(400)
      .end(done);
  });
});

/* -------------------- */
/*     GET /users/me    */
/* -------------------- */

describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', seed.users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.user._id).toBe(seed.users[0]._id.toHexString());
        expect(res.body.user.email).toBe(seed.users[0].email);
      })
      .end(done);
  });

  it ('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

/* ---------------------- */
/* DELETE /users/me/token */
/* ---------------------- */

describe('DELETE /users/me/token', () => {
  it('should remove valid auth token', (done) => {
    const user = seed.users[0];

    request(app)
      .delete('/users/me/token')
      .set('x-auth', user.tokens[0].token)
      .expect(200)
      .expect(() => {
        User
          .findById(user._id)
          .then((userResult) => {
            expect(userResult.tokens).not.toEqual(expect.objectContaining({
              token: user.tokens[0].token
            }))
          })
          .catch((err) => {
            done(err);
          });
      })
      .end(done);
  });
});

/* -------------------- */
/*   POST /users/login  */
/* -------------------- */

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    const user = seed.users[1];

    request(app)
      .post('/users/login')
      .send({
        email: user.email,
        password: user.password
      })
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(user._id.toHexString());
        expect(res.body.email).toBe(user.email);
        expect(res.header['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        User
          .findById(user._id)
          .then((user) => {
            expect(user.tokens[0]).toEqual(expect.objectContaining({
                access: 'auth',
                token: res.header['x-auth']
              })
            );
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  it('should reject invalid login', (done) => {
    const user = seed.users[1];

    request(app)
      .post('/users/login')
      .send({
        email: user.email,
        password: user.password + "1"
      })
      .expect(400)
      .expect((res) => {
        expect(res.header['x-auth']).toBeFalsy();
        User
          .findById(user._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
          })
          .catch((err) => {
            done(err);
          });
      })
      .end(done);
  });
});