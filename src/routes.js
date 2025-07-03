import { Database } from "./database.js";
import { createTaskFromCsv } from "./streams/create-task-csv.js";
import { buildRoutePath } from "./utils/build-route-path.js";
import { randomUUID } from "node:crypto";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select(
        "tasks",
        search
          ? {
              title: search,
            }
          : null
      );

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end("Enter title and description");
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end();
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;
      const task = database.selectById("tasks", id);

      if (!title || !description) {
        return res.writeHead(400).end("Enter title and description");
      }

      if (task.length > 0) {
        database.update("tasks", id, {
          title,
          description,
          completed_at: task[0].completed_at,
          created_at: task[0].created_at,
          updated_at: new Date(),
        });

        return res.writeHead(204).end();
      }

      return res.writeHead(404).end("Task not found");
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.selectById("tasks", id);

      if (task.length > 0) {
        database.update("tasks", id, {
          title: task[0].title,
          description: task[0].description,
          completed_at: new Date(),
          created_at: task[0].created_at,
          updated_at: new Date(),
        });

        return res.writeHead(204).end();
      }

      return res.writeHead(404).end("Task not found");
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const task = database.selectById("tasks", id);

      if (task.length > 0) {
        database.delete("tasks", id);
        return res.writeHead(204).end();
      }

      return res.writeHead(404).end("Task not found");
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/create-task-csv"),
    handler: async (_, res) => {
      await createTaskFromCsv(res);
    },
  },
];
