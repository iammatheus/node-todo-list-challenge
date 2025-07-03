import { parse } from "csv-parse";
import fs from "fs";

export async function createTaskFromCsv(res) {
  const filePath = new URL("./tasks.csv", import.meta.url);
  const urlPath = "http://localhost:3333";

  if (!fs.existsSync(filePath)) {
    return res.writeHead(404).end("Arquivo tasks.csv não encontrado");
  }

  const stream = fs.createReadStream(filePath);

  const parser = parse({
    columns: true,
    skip_empty_lines: true,
  });

  const records = [];

  try {
    const lines = stream.pipe(parser);

    for await (const record of lines) {
      const { title, description } = record;

      await fetch(`${urlPath}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      records.push(record);
    }

    return res.writeHead(201).end("Tarefas importadas com sucesso!");
  } catch (err) {
    console.error(err);
    return res.writeHead(500).end("Erro ao importar CSV");
  }
}
