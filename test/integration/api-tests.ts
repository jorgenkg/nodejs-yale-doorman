import {
  compose,
  defaults,
  withApi,
  withMockedYaleApi
} from "../test-helpers/index.js";
import FakeTimer from "@sinonjs/fake-timers";
import test from "tape";

const clock = FakeTimer.createClock(0, Infinity);

test("It shall support authenticating with the user credentials specified in the constructor", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }), async(api, t) => {
    t.ok(await api.login() === undefined, "Expected to successfully sign in");
  }
));

test("When the credentials have expired, it shall re-authenticate using a refresh token sending the request", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  async(api, t) => {
    await api.login();
    await clock.tickAsync("24:00:00");
    await api.getDevices();
  }
));

test("If the refresh token has expired, it shall re-authenticate using the user credentials", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }, { expose: true }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  async(yale, api, t) => {
    await api.login();
    await clock.tickAsync("24:00:00");
    yale.invalidateToken();
    await api.getDevices();
  }
));

test("If the credentials have been revoked, it shall re-authenticate before sending the request", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }, { expose: true }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  async(yale, api, t) => {
    await api.login();
    yale.invalidateToken();
    await api.getDevices();
  }
));

test("It shall support fetching a list of Yale devices", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }), async(api, t) => {
    const doors = await api.getDevices();
    t.equals(doors.data[0].device_id, defaults.mockData.device_sid, "Expected `device_id` to equal mocked data");
    t.equals(doors.data[0].address, defaults.mockData.device_sid, "Expected `address` to equal mocked data");
    t.equals(doors.data[0].area, defaults.mockData.area, "Expected `area` to equal mocked data");
    t.equals(doors.data[0].no, defaults.mockData.zone, "Expected `no` to equal mocked data");
  }
));

test("It shall support fetching Yale state history", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }), async(api, t) => {
    const history = await api.getEventHistory();
    t.equals(history.data[0].area, defaults.mockData.area, "Expected `area` to equal mocked data");
    t.equals(history.data[0].zone, defaults.mockData.zone, "Expected `zone` to equal mocked data");
  }
));

test("It shall support locking a door", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }), async(api, t) => {
    await api.lockDoor(defaults.mockData.zone, defaults.mockData.area, defaults.mockData.device_sid);
  }
));

test("It shall support unlocking a door", compose(
  withMockedYaleApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }),
  withApi({ ...defaults, clock: clock as unknown as typeof defaults.clock }), async(api, t) => {
    await api.unlockDoor(defaults.mockData.zone, defaults.mockData.area, defaults.mockData.pincode);
  }
));
