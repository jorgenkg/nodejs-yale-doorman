import type { Area, Zone } from "./GetDeviceList.js";
import type { LockStateCode } from "../../misc/LockStateCode.js";


export type GetEventHistory = {
  result: boolean;
  code: "000" | string; // 000 -> success
  message: string;
  token: string;
  data: Array<{
    report_id: string;
    cid: string;
    event_type: keyof typeof LockStateCode | string;
    user: number;
    area: Area;
    zone: Zone;
    name: string;
    type: "device_type.door_lock" | string;
    event_time: null;
    time: string;
    status_temp_format: "C",
    cid_source: "DEVICE";
  }>;
  time: string;
}
