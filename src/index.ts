import http from "http";

const port = 5859;

export const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ data: "Working" }));
});

server.listen(port, () => {
  console.log(`Server Running on Port ${port}`);
});
