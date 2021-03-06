import {Output} from './state';

export const RUN_COMMAND = 'RUN_COMMAND';
export interface RunCommand {
	type: typeof RUN_COMMAND;
}

export const STARTED = 'STARTED';
export interface Started {
	type: typeof STARTED;
}

export const STDOUT_RECEIVED = 'STDOUT_RECEIVED';
export interface StdoutReceived {
	type: typeof STDOUT_RECEIVED;
	payload: Output;
}

export const INPUT_REQUIRED = 'INPUT_REQUIRED';
export interface InputRequired {
	type: typeof INPUT_REQUIRED;
}

export const INPUT_RECEIVED = 'INPUT_RECEIVED';
export interface InputReceived {
	type: typeof INPUT_RECEIVED;
	payload: {
		input: string;
	};
}

export const FINISHED = 'FINISHED';
export interface Finished {
	type: typeof FINISHED;
	payload?: {error: Error};
	error?: boolean;
}

export const COMPLETED = 'COMPLETED';
export interface Completed {
	type: typeof COMPLETED;
}

export const UPDATE_CF_CONTEXT = 'UPDATE_CF_CONTEXT';
export interface UpdateCfContext {
	type: typeof UPDATE_CF_CONTEXT;
	payload: any;
}

export const EXIT_APP = 'EXIT_APP';
export interface ExitApp {
	type: typeof EXIT_APP;
}

export type Action =
	| RunCommand
	| Started
	| StdoutReceived
	| InputRequired
	| InputReceived
	| Finished
	| Completed
	| UpdateCfContext
	| ExitApp;

export const runCommand = (): RunCommand => ({type: RUN_COMMAND});
export const started = (): Started => ({type: STARTED});
export const stdoutReceived = (output: Output): StdoutReceived => ({type: STDOUT_RECEIVED, payload: output});
export const inputRequired = (): InputRequired => ({type: INPUT_REQUIRED});
export const inputReceived = (input: string): InputReceived => ({type: INPUT_RECEIVED, payload: {input}});
export const completed = (): Completed => ({type: COMPLETED});
export const updateCfContext = (contextUpdate: any): UpdateCfContext => ({type: UPDATE_CF_CONTEXT, payload: contextUpdate});
export const exitApp = (): ExitApp => ({type: EXIT_APP});
export const finished = (error?: Error): Finished => {
	if (error) {
		return {
			type: FINISHED,
			error: true,
			payload: {error}
		};
	}

	return {type: FINISHED};
};
