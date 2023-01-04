import { Hono } from 'hono';
import { z } from 'zod';
import {
  createTodo,
  CreateTodo,
  deleteTodo,
  getTodo,
  getTodos,
  updateTodo,
  UpdateTodo,
} from './model';
import { Env } from '../../index';

const schema = z.object({
  title: z.string().trim().min(1),
});

const todos = new Hono<{ Bindings: Env }>();

todos.get('/', async (c) => {
  const todos = await getTodos(c.env.HONO_TODO);
  return c.json(todos);
});

todos.post('/', async (c) => {
  const param = await c.req.json<CreateTodo>();
  const parseBody = schema.safeParse(param);

  if (!parseBody.success) {
    return c.json({ error: 'Title is require' }, 400);
  }

  const newTodo = await createTodo(c.env.HONO_TODO, param);

  return c.json(newTodo, 201);
});

todos.put('/:id', async (c) => {
  const id = c.req.param('id');
  const todo = await getTodo(c.env.HONO_TODO, id);

  if (!todo) {
    return c.json({ message: 'not found' }, 404);
  }

  const param = await c.req.json<UpdateTodo>();
  await updateTodo(c.env.HONO_TODO, id, param);

  return new Response(null, { status: 204 });
});

todos.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const todo = await getTodo(c.env.HONO_TODO, id);

  if (!todo) {
    return c.json({ message: 'not found' }, 404);
  }

  await deleteTodo(c.env.HONO_TODO, id);

  return new Response(null, { status: 204 });
});

export { todos };
