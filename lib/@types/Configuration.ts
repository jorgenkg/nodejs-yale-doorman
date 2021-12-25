import { LockState } from "../misc/LockState";
import type { Area, RfAddress, Zone } from "./responses/GetDeviceList";

export interface Configuration<Test extends boolean = false> {
  yale: {
    host: string;
    /** `port` shall only be defined in tests */
    port?: number;
    clientId: string;
    clientSecret: string;
    endpoints: {
      token: string;
      getDevices: string;
      getEventHistory: string;
      lockDoor: string;
      unlockDoor: string;
    };
  };
  logger: {
    debug: (msg: string, obj?: Record<string, unknown>) => void;
    info: (msg: string, obj?: Record<string, unknown>) => void;
    warn: (msg: string, obj?: Record<string, unknown>) => void;
    error: (msg: string, obj?: Record<string, unknown>) => void;
  };
  clock: {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    setInterval: typeof setInterval;
    clearInterval: typeof clearInterval;
    Date: typeof Date;
  };
  /** `mockData` shall only be defined in tests */
  mockData: Test extends false ? undefined : {
    userID: string;
    password: string;
    area: Area;
    zone: Zone;
    device_sid: RfAddress;
    pincode: string;
    lockState: LockState;
  };
}
