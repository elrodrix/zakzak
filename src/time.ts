/*!
 * Copyright 2019, Dynatrace LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
