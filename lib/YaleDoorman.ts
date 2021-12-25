import { deepMerge } from "./misc/deepMerge.js";
import { default as DefaultConfiguration } from "./config/default.js";
import { URL } from "url";
import assert from "assert";
import got from "got";
import type { Area, RfAddress, Zone } from "./@types/responses/GetDeviceList";
import type { Configuration } from "./@types/Configuration";
import type {
  GetDeviceList, GetEventHistory, Lock, Unlock
} from "./@types/responses";
import type { Options } from "got";


/**
 * SDK class that expose the Yale doorman SDK.
 *
 * Note that `login()` does not need to be called explicitly.
 * The SDK will lazily call `login()` to (re)authenticate when necessary.
 */
export class YaleDoorman<Test extends boolean = false> {
  #accessToken?: string;
  #accessTokenExpiresAt?: Date;

  #configuration: Configuration<Test>;

  #email: string;
  #password: string;

  /** The generic type parameter should be either omitted or `false` in production. */
  constructor(email: string, password: string, configuration?: Configuration<Test>) {
    this.#configuration = (!configuration ? DefaultConfiguration : deepMerge(DefaultConfiguration, configuration)) as Configuration<Test>;
    this.#email = email;
    this.#password = password;
  }

  /** Send a REST request to the Sector API */
  private async httpRequest<T>({
    endpoint, method = "GET", form, isRetry = false, query
  }: {
    endpoint: Exclude<keyof Configuration["yale"]["endpoints"], "token">;
    method?: "POST" | "GET";
    form?: Options["form"];
    isRetry?: boolean;
    query?: Record<string, string>;
  }): Promise<T> {

    if (isRetry || !this.#accessTokenExpiresAt || (this.#accessTokenExpiresAt.valueOf() - this.#configuration.clock.Date.now()) < 1000 * 60) {
      await this.login();
    }

    assert(this.#accessToken, "Expect access token to be defined");

    const { yale: { host, endpoints } } = this.#configuration;

    const response = await got<T>(
      new URL(endpoints[endpoint], host),
      {
        method,
        form,
        searchParams: query,
        headers: { authorization: `Bearer ${this.#accessToken}` },
        resolveBodyOnly: false,
        throwHttpErrors: false,
        retry: { limit: 3 },
        responseType: "json"
      }
    );

    if(response.statusCode === 401 && !isRetry) {
      return await this.httpRequest({
        endpoint, method, form, isRetry: true, query
      });
    }
    else if(response.statusCode === 401) {
      throw new Error(`Authentication error (${method}). Body: ${response.rawBody.toString()}`);
    }
    else if(response.statusCode >= 400) {
      throw new Error(`HTTP error ${method} ${endpoint}: ${response.statusCode} ${response.rawBody.toString()}`);
    }

    return response.body;
  }

  /** Authenticate using the credentials specified in the constructor.
   *
   * This function is used internally and does not need to be called directly.
  */
  public async login(): Promise<void> {
    const { yale: { host, endpoints: { token } } } = this.#configuration;

    // Perform the actual login
    const response = await got<{
      "access_token": string,
      "token_type": "Bearer",
      /** Appears to be seconds */
      "expires_in": number,
      "scope": "read basic_profile google_profile write groups",
      "refresh_token": string
    }>(
      new URL(token, host),
      {
        method: "POST",
        resolveBodyOnly: false,
        throwHttpErrors: false,
        headers: { authorization: this.#accessToken },
        form: {
          grant_type: "password",
          username: this.#email,
          password: this.#password
        },
        responseType: "json",
        retry: { limit: 3 }
      }
    );

    if(response.statusCode === 401) {
      throw new Error(`Authentication error on login. Maybe the credentials are incorrect? Body: ${response.rawBody.toString()}`);
    }
    else if(response.statusCode >= 400) {
      throw new Error(`HTTP error: ${response.statusCode} ${response.rawBody.toString()}`);
    }

    this.#accessToken = response.body.access_token;
    this.#accessTokenExpiresAt = new Date(response.body.expires_in * 1000);
    this.#configuration.logger.info("Successfully authenticated with Yale API");
  }

  /** Fetch a list of devices connected to the Yale hub. */
  public async getDevices(): Promise<GetDeviceList> {
    return this.httpRequest<GetDeviceList>({ endpoint: "getDevices" });
  }

  /** Fetch events from the Yale hub. */
  public async getEventHistory(): Promise<GetEventHistory> {
    return this.httpRequest<GetEventHistory>({ endpoint: "getEventHistory" });
  }

  /** Locks a specific door. This request tends to take ~10 sec.
  The Zone, Area and RfAddress arguments may be retrieved using the getDevices() method. */
  public async lockDoor(zone: Zone, area: Area, rfAddress: RfAddress): Promise<Lock> {
    return this.httpRequest<Lock>({
      endpoint: "lockDoor",
      method: "POST",
      form: {
        area,
        zone,
        device_sid: rfAddress,
        device_type: "device_type.door_lock",
        request_value: "1"
      }
    });
  }

  /** Unlocks a specific door. This request tends to take ~10 sec.
  The Zone and Area arguments may be retrieved using the getDevices() method. */
  public async unlockDoor(zone: Zone, area: Area, pincode: string): Promise<Unlock> {
    return this.httpRequest<Unlock>({
      endpoint: "unlockDoor",
      method: "POST",
      form: {
        area,
        zone,
        pincode
      }
    });
  }
}
