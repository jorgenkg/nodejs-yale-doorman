import { LockStates } from "./LockState";

export const LockStateCode = {
  /** Locked after a failed lock */
  "1816": LockStates.LOCK,
  /** Failed to lock */
  "1815": LockStates.UNLOCK,
  /** Auto-relocked */
  "1807": LockStates.LOCK,
  /** Unlock from inside */
  "1801": LockStates.UNLOCK,
  /** Unlock from outside, token or keypad, */
  "1802": LockStates.UNLOCK,
};
