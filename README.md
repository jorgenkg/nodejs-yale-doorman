# Yale Doorman

A Yale Smart Home Smart Living SDK for Yale Doorman written in TypeScript with test coverage using Tape. This is intended for use in Smart Home applications.

This SDK requires Yale Doorman *V2* or *V2N* with a RF lock module installed, and a Yale Home Smart Living hub.

This SDK does not work with Yale partner solutions like Verisure and Sector Alarm.

## Requirements

`node >= 10.0`

## Installation

```bash
npm i -S yale-doorman
```

## API

##### [Documentation is available here](https://jorgenkg.github.io/nodejs-yale-doorman/)

## Usage

```javascript
import { YaleDoorman } from "yale-doorman";

// Setup the API client
const api = new YaleDoorman(email, password);
// Fetch a list of devices from Yale Hub
const [devices] = await api.getDevices();
const door = deviceResponse.data.find(device => device.type === "device_type.door_lock");
// Lock the door
  await api.lockDoor(door.no, door.area, door.address);
```

## Debug logging

This library uses `debug`. Enable all logs by:
```bash
DEBUG=yale-doorman:*
```
or limit the logs to a certain log level by specifying {debug, info, warn, error} e.g:
```bash
DEBUG=yale-doorman:warn,yale-doorman:error
```

## Disclaimer
This library is NOT an official integration from Yale Home. This library is neither endorsed nor supported by Yale Home. This implementation is based on reverse engineering REST calls used by the Yale Home Smart Living iOS app, and may thus intermittently stop working if the underlying Yale API is updated.

Any utilization, consumption and application of this library is done at the user's own discretion. This library, its maintainers and Yale Home cannot guarantee the system's integrity if this library or any applications of this library are compromised.
