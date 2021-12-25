import { LockState } from "./LockState";

export const LockStateCode = {
  /** Locked after a failed lock */
  "1816": LockState.LOCK,
  /** Failed to lock */
  "1815": LockState.UNLOCK,
  /** Auto-relocked */
  "1807": LockState.LOCK,
  /** Unlock from inside */
  "1801": LockState.UNLOCK,
  /** Unlock from outside, token or keypad, */
  "1802": LockState.UNLOCK,
};
