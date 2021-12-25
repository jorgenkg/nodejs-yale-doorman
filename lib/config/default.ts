import { default as debug } from "debug";
import type { Configuration } from "../@types/Configuration";

export default {
  yale: {
    host: "https://mob.yalehomesystem.co.uk",
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
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
    setInterval: global.setInterval,
    clearInterval: global.clearInterval,
    Date: Date
  }
} as Configuration;
