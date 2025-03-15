import express from "express";
import morgan from "morgan";
import taskRouter from "./test.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/task", taskRouter);

const port = 5000;

app.listen(port, () => {
  console.log(`server is start on ${port}`);
});
