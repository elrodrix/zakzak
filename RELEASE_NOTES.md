Change from `childprocess.spawn` to `childprocess.fork` and use `stdin` and `stdout` instead of the IPC channel, due to memory limits.
Also changed console exporters to no longer print `O Benchmarks failed` when there have been no errors.
