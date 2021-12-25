import { LockStateCode } from "../../lib/misc/LockStateCode.js";
import { YaleDoorman } from "../../lib/YaleDoorman.js";
import assert from "assert";
import bodyParser from "koa-bodyparser";
import crypto from "crypto";
import http from "http";
import Koa from "koa";
import Route from "koa-route";
import tape from "tape";
import util from "util";
import type { Configuration } from "../../lib/@types/Configuration";
import type {
  GetDeviceList, GetEventHistory, Lock, Unlock
} from "../../lib/@types/responses/index.js";
import type { Middleware, TestComposer } from "./compose-types.js";


export const compose: TestComposer = (...composers: unknown[]) => {
  const test = composers.pop() as (...args: unknown[]) => Promise<void>;
  const results: unknown[] = [];

  return async function _compose(t: tape.Test): Promise<void> {
    if (composers.length === 0) {
      await test(...results, t);
    }
    else {
      const middleware = composers.shift() as Middleware<unknown>; // leftmost middleware
      await middleware(
        async(result: unknown) => {
          if(result !== undefined) {
            results.push(result);
          }
          await _compose(t);
        }
      );
    }
  };
};

export function withApi(configuration: Configuration<true>, {
  email,
  password,
}: {
  email?: string;
  password?: string;
} = {}): Middleware<YaleDoorman<true>> {
  return async next => {
    await next(new YaleDoorman(
      email || configuration.mockData.userID,
      password || configuration.mockData.password,
      configuration
    ));
  };
}

class MockedYaleApi extends Koa {
  private mockBearerToken?: string;
  private mockRefreshToken?: string;
  private tokenExpiresAt?: Date;

  private readonly configuration: Configuration<true>;

  private hasLoggedIn = false;

  constructor(config: Configuration<true>, {
    area,
    zone,
    device_sid,
    userID,
    password,
    pincode,
    lockState,
  }: Configuration<true>["mockData"]) {
    super();
    this.configuration = config;

    this.use(Route.all("*", async(ctx, path, next: Koa.Next) => {
      try {
        await next();
      }
      catch(error) {
        config.logger.error(util.inspect(error, { breakLength: Infinity, depth: null }));
      }
    }));

    this.use(bodyParser({ enableTypes: ["form"] }));

    this.use(
      Route.post(
        this.configuration.yale.endpoints.token, ctx => {
          const body = ctx.request.body as Partial<{
          username: string;
          password: string;
          grant_type: string;
        }>;

          if(body.grant_type !== "password") {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request did not present a valid grant_type" };
            return;
          }
          if(body.password !== password) {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request did not present a valid password" };
            return;
          }
          else if(body.username !== userID) {
            ctx.response.status = 400;
            ctx.response.body = { message: "The request did not present a valid userID" };
            return;
          }

          this.generateNewBearerToken();

          ctx.response.status = 200;
          ctx.response.body = {
            "access_token": this.mockBearerToken,
            "token_type": "Bearer",
            /** Appears to be seconds */
            "expires_in": Math.floor((config.clock.Date.now() - (this.tokenExpiresAt?.valueOf() ?? assert.fail("Expect expiry to be defined"))) / 1000),
            "scope": "read basic_profile google_profile write groups",
            "refresh_token": this.mockRefreshToken,
          };

          this.hasLoggedIn = true;
        })
    );

    this.use(Route.all("*", async(ctx, path, next: Koa.Next) => {
      if(!this.hasLoggedIn) {
        ctx.response.status = 401;
        ctx.response.message = "not yet authenticated";
        return;
      }
      else if(ctx.headers.authorization !== `Bearer ${this.mockBearerToken ?? assert.fail("expect mockBearerToken to be defined")}`) {
        ctx.response.status = 401;
        return;
      }
      if((this.tokenExpiresAt ?? assert.fail("Expect expiry to be defined")) < new config.clock.Date()) {
        ctx.response.status = 401;
        ctx.response.body = "token expired";
        return;
      }

      await next();
    }));

    this.use(
      Route.post(this.configuration.yale.endpoints.lockDoor, ctx => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.area !== config.mockData.area) {
          ctx.response.status = 400;
          ctx.response.message = "invalid area";
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.zone !== config.mockData.zone) {
          ctx.response.status = 400;
          ctx.response.message = "invalid zone";
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.device_sid !== config.mockData.device_sid) {
          ctx.response.status = 400;
          ctx.response.message = "invalid device_sid";
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.device_type !== "device_type.door_lock") {
          ctx.response.status = 400;
          ctx.response.message = "invalid device_type";
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.request_value !== "1") {
          ctx.response.status = 400;
          ctx.response.message = "invalid request_value";
        }

        ctx.response.body = {
          "result": true,
          "code": "000",
          "message": "OK!",
          "token": "foobar",
          "data": {
            "area": config.mockData.area,
            "zone": config.mockData.zone,
            "device_sid": config.mockData.device_sid,
            "device_type": "device_type.door_lock",
            "request_value": "1",
            "dimmer_power_level": false,
            "hue": false,
            "saturation": false,
            "lightness": false,
            "x": false,
            "y": false,
            "temperature": false,
            "mod": false
          },
          "time": "4.1047"
        } as Lock;
      })
    );

    this.use(
      Route.post(this.configuration.yale.endpoints.unlockDoor, ctx => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.area !== config.mockData.area) {
          ctx.response.status = 400;
          ctx.response.message = "invalid area";
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.zone !== config.mockData.zone) {
          ctx.response.status = 400;
          ctx.response.message = "invalid zone";
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if(ctx.request.body.pincode !== config.mockData.pincode) {
          ctx.response.status = 400;
          ctx.response.message = "invalid pincode";
        }

        ctx.response.body = {
          "result": true,
          "code": "000",
          "message": "OK!",
          "token": "baz",
          "data": "",
          "time": "8.9735"
        } as Unlock;
      })
    );

    this.use(
      Route.get(this.configuration.yale.endpoints.getDevices, ctx => {
        ctx.response.body = {
          "result": true,
          "code": "000",
          "message": "OK!",
          "token": "fooza",
          "data": [
            {
              "area": config.mockData.area,
              "no": config.mockData.zone,
              "rf": null,
              "address": config.mockData.device_sid,
              "type": "device_type.door_lock",
              "name": "My lock",
              "status1": lockState,
              "status2": null,
              "status_switch": null,
              "status_power": null,
              "status_temp": null,
              "status_humi": null,
              "status_dim_level": null,
              "status_lux": "",
              "status_hue": null,
              "status_saturation": null,
              "rssi": "9",
              "mac": "00:11:22:33:44:55",
              "scene_trigger": "0",
              "status_total_energy": null,
              "device_id2": "",
              "extension": null,
              "minigw_protocol": "DM",
              "minigw_syncing": "0",
              "minigw_configuration_data": "02FF00000123456789",
              "minigw_product_data": "123456789",
              "minigw_lock_status": "35",
              "minigw_number_of_credentials_supported": "10",
              "sresp_button_3": null,
              "sresp_button_1": null,
              "sresp_button_2": null,
              "sresp_button_4": null,
              "ipcam_trigger_by_zone1": null,
              "ipcam_trigger_by_zone2": null,
              "ipcam_trigger_by_zone3": null,
              "ipcam_trigger_by_zone4": null,
              "scene_restore": null,
              "thermo_mode": null,
              "thermo_setpoint": null,
              "thermo_c_setpoint": null,
              "thermo_setpoint_away": null,
              "thermo_c_setpoint_away": null,
              "thermo_fan_mode": null,
              "thermo_schd_setting": null,
              "group_id": null,
              "group_name": null,
              "bypass": "0",
              "device_id": config.mockData.device_sid,
              "status_temp_format": "C",
              "type_no": "72",
              "device_group": "002",
              "status_fault": [],
              "status_open": [
                lockState
              ],
              "trigger_by_zone": []
            }
          ],
          "time": "0.0044"
        } as GetDeviceList;
      })
    );

    this.use(
      Route.get(this.configuration.yale.endpoints.getEventHistory, ctx => {
        ctx.response.body = {
          "result": true,
          "code": "000",
          "message": "OK!",
          "token": "foobar",
          "data": [
            {
              "report_id": "123456789",
              "cid": "123456789",
              "event_type": LockStateCode[1801],
              "user": 0,
              "area": config.mockData.area,
              "zone": config.mockData.zone,
              "name": "john.doe@example.com",
              "type": "device_type.door_lock",
              "event_time": null,
              "time": "1970/01/01 00:00:00",
              "status_temp_format": "C",
              "cid_source": "DEVICE"
            }
          ],
          "time": "0.0268"
        } as GetEventHistory;
      })
    );
  }

  private generateNewBearerToken() {
    this.mockBearerToken = crypto.randomBytes(6).toString("hex");
    this.mockRefreshToken = crypto.randomBytes(6).toString("hex");
    this.tokenExpiresAt = new Date(this.configuration.clock.Date.now() + 1000 * 60 * 60);
  }

  public invalidateToken() {
    this.generateNewBearerToken();
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function withMockedYaleApi<T extends boolean = false>(
  configuration: Configuration<true>,
  { expose = false as T }: {expose?: T} = { expose: false as T }
) {

  if(!configuration.yale.port) {
    throw new Error("[port] must be defined in tests");
  }

  if(expose) {
    return (async next => {
      const application = new MockedYaleApi(configuration, configuration.mockData);

      const server = http.createServer(application.callback());

      await new Promise<void>(resolve => server.listen(configuration.yale.port, resolve));

      let error: Error | undefined;

      await next(application).catch((err: Error | undefined) => error = err);

      await new Promise(resolve => server.close(resolve));

      if(error) {
        throw error;
      }
    }) as T extends true ? Middleware<MockedYaleApi> : never;
  }
  else {
    return (async next => {
      const application = new MockedYaleApi(configuration, configuration.mockData);

      const server = http.createServer(application.callback());

      await new Promise<void>(resolve => server.listen(configuration.yale.port, resolve));

      let error: Error | undefined;

      await next().catch((err: Error | undefined) => error = err);

      await new Promise(resolve => server.close(resolve));

      if(error) {
        throw error;
      }
    }) as T extends true ? never : Middleware<undefined>;
  }
}
