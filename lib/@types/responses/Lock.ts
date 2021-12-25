export type Lock = {
  result: boolean;
  code: "000" | string;
  message: string;
  token: string;
  data: {
    area: string;
    zone: string;
    device_sid: string;
    device_type: "device_type.door_lock";
    request_value: string;
    dimmer_power_level: boolean;
    hue: boolean;
    saturation: boolean;
    lightness: boolean;
    x: boolean;
    y: boolean;
    temperature: boolean;
    mod: boolean;
  };
  time: string;
}
