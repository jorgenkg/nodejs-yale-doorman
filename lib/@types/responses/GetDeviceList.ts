import type { LockState } from "../../misc/LockState.js";

export type Zone = string & {_never: never};
export type Area = string & {_never: never};
export type RfAddress = string & {_never: never};

export type GetDeviceList = {
  result: boolean;
  code: string;
  message: string;
  token: string;
  data: Array<{
    area: Area;
    no: Zone;
    rf: null;
    address: RfAddress;
    type: string;
    name: string;
    status1: LockState;
    status2: null;
    status_switch: null;
    status_power: null;
    status_temp: null;
    status_humi: null;
    status_dim_level: null;
    status_lux: string;
    status_hue: null;
    status_saturation: null;
    rssi: string;
    mac: string;
    scene_trigger: string;
    status_total_energy: null;
    device_id2: string;
    extension: null;
    minigw_protocol: string;
    minigw_syncing: string;
    minigw_configuration_data: string;
    minigw_product_data: string;
    minigw_lock_status: string;
    minigw_number_of_credentials_supported: string;
    sresp_button_3: null;
    sresp_button_1: null;
    sresp_button_2: null;
    sresp_button_4: null;
    ipcam_trigger_by_zone1: null;
    ipcam_trigger_by_zone2: null;
    ipcam_trigger_by_zone3: null;
    ipcam_trigger_by_zone4: null;
    scene_restore: null;
    thermo_mode: null;
    thermo_setpoint: null;
    thermo_c_setpoint: null;
    thermo_setpoint_away: null;
    thermo_c_setpoint_away: null;
    thermo_fan_mode: null;
    thermo_schd_setting: null;
    group_id: null;
    group_name: null;
    bypass: string;
    device_id: string;
    status_temp_format: string;
    type_no: string;
    device_group: string;
    status_fault: any[];
    status_open: Array<LockState>;
    trigger_by_zone: any[];
  }>;
  time: string;
}
