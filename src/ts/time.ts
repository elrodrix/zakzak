export enum TimeUnit {
    Nanosecond = 1,
    Microsecond = Nanosecond * 1e3,
    Millisecond = Microsecond * 1e3,
    Second = Millisecond * 1e3,
    Minute = TimeUnit.Second * 60,
    Hour = TimeUnit.Minute * 60
}