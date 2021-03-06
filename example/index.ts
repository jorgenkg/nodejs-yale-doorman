import { YaleDoorman } from "../lib/YaleDoorman.js";
import assert from "assert";

(async() => {
  assert(process.env.EMAIL, "Expect EMAIL to be defined");
  assert(process.env.PASSWORD, "Expect PASSWORD to be defined");

  const api = new YaleDoorman(process.env.EMAIL, process.env.PASSWORD);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [door] = await api.getDoors();

  await api.lockDoor(door.zone, door.area, door.address);
})()
  .catch(console.error);
