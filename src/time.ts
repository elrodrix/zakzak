/**
 * Enum for helping with time calculations.
 * Smallest unit is 1 nanosecond.
 */
export enum TimeUnit {
	Nanosecond = 1,
	Microsecond = Nanosecond * 1e3,
	Millisecond = Microsecond * 1e3,
	Second = Millisecond * 1e3,
	Minute = TimeUnit.Second * 60,
	Hour = TimeUnit.Minute * 60
}
