import { default as debug } from "debug";
import { LockStates } from "../../lib/misc/LockState";
import type { Area, RfAddress, Zone } from "../../lib/@types/responses/GetDeviceList";
import type { Configuration } from "../../lib/@types/Configuration";

export {
  compose,
  withMockedYaleApi,
  withApi
} from "./compose-helpers.js";


export const defaults: Configuration<true> = {
  yale: {
    host: "http://localhost:8080/",
    port: 8080,
    endpoints: {
      token: "/yapi/o/token/", // post credentials
      getDevices: "/yapi/api/panel/device_status/",
      getEventHistory: "/yapi/api/event/report/", // query: page_num=1&set_utc=1
      lockDoor: "/yapi/api/panel/device_control/", // post: area=1,zone=1,device_sid=RF%3Axxxxxxxx,,device_type=device_type.door_lock,request_value=1  || area=1&zone=1&pincode=xxxxxxxx
      unlockDoor: "/yapi/api/minigw/unlock/" // port: area=1,zone=1,pincode=xxxxxxxx
    }
  },
  logger: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    debug: (msg: string, obj?: Record<string, unknown>) => obj ? debug("yale-doorman:debug")("%s %o", msg, obj) : debug("yale-doorman:debug")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    info: (msg: string, obj?: Record<string, unknown>) => obj ? debug("yale-doorman:info")("%s %o", msg, obj) : debug("yale-doorman:info")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    warn: (msg: string, obj?: Record<string, unknown>) => obj ? debug("yale-doorman:warn")("%s %o", msg, obj) : debug("yale-doorman:warn")("%s", msg),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    error: (msg: string, obj?: Record<string, unknown>) => obj ? debug("yale-doorman:error")("%s %o", msg, obj) : debug("yale-doorman:error")("%s", msg),
  },
  clock: {
    setInterval,
    setTimeout,
    clearInterval,
    clearTimeout,
    Date,
  },
  mockData: {
    userID: "john@example.com",
    password: "super-secret",
    area: "1" as Area,
    zone: "1" as Zone,
    device_sid: "RF:123456789" as RfAddress,
    pincode: "1234",
    lockState: LockStates.LOCK
  }
};
