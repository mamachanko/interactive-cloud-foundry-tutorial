/* eslint-disable max-nested-callbacks */

import {cleanup, render} from 'ink-testing-library';
import * as React from 'react';
import stripAnsi from 'strip-ansi';
import {FINISHED} from './actions';
import {Page, PageProps} from './page';
import {INPUT_REQUIRED, RUNNING, UNSTARTED} from './state';

describe('<Page/>', () => {
	const ENTER = '\r';
	const SPACE = ' ';
	const defaultProps: PageProps = {
		title: 'The Test Page',
		subtitle: 'a test page it is',
		body: `
This is

a test page
`,
		command: {
			filename: 'test',
			args: ['command'],
			status: UNSTARTED,
			stdout: []
		},
		waitForTrigger: true,
		pinOutput: false,
		run: () => {},
		complete: () => {},
		submit: () => {}
	};

	afterEach(() => {
		cleanup();
	});

	describe('when command has not yet been run', () => {
		it('shows the title', () => {
			const {lastFrame} = render(<Page {...defaultProps}/>);

			expect(lastFrame()).toMatch(/The Test Page/);
		});

		it('shows the subtitle', () => {
			const {lastFrame} = render(<Page {...defaultProps}/>);

			expect(lastFrame()).toMatch(/~ a test page it is ~/);
		});

		it('shows the page body', () => {
			const {lastFrame} = render(<Page {...defaultProps}/>);

			expect(lastFrame()).toMatch(/this is\s+a test page/i);
		});

		it('shows which command can be run', () => {
			const {lastFrame} = render(<Page {...defaultProps}/>);

			expect(lastFrame()).toMatch(/>_ test command/i);
		});

		it('runs command on <space>', () => {
			const run = jest.fn();
			const {stdin} = render(<Page {...defaultProps} run={run}/>);

			expect(run).toHaveBeenCalledTimes(0);

			stdin.write(SPACE);

			expect(run).toHaveBeenCalledTimes(1);
		});

		describe('when not waiting for trigger', () => {
			it('runs command right away', () => {
				const run = jest.fn();

				render(<Page {...defaultProps} waitForTrigger={false} run={run}/>);

				expect(run).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('when command is running', () => {
		it('shows the page body', () => {
			const runningCommand: PageProps = {
				...defaultProps,
				command: {
					filename: 'test',
					args: ['command'],
					status: RUNNING,
					stdout: []
				}
			};
			const {lastFrame} = render(<Page {...runningCommand}/>);

			expect(lastFrame()).toMatch(/this is\s+a test page/i);
		});

		it('shows a spinner', () => {
			const runningCommand: PageProps = {
				...defaultProps,
				command: {
					filename: 'test',
					args: ['command'],
					status: RUNNING,
					stdout: []
				}
			};
			const {lastFrame} = render(<Page {...runningCommand}/>);

			expect(stripAnsi(lastFrame())).toMatch(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏] test command/i);
		});

		describe('when there is stdout', () => {
			describe('when it is not pinned', () => {
				it('shows stdout', () => {
					const runningCommandWithStdout: PageProps = {
						...defaultProps,
						body: '',
						command: {
							filename: 'test',
							args: ['command'],
							status: RUNNING,
							stdout: [
								{text: 'test command output 1', uid: '1'},
								{text: 'test command output 2', uid: '2'}
							]
						}
					};
					const {lastFrame} = render(<Page {...runningCommandWithStdout}/>);

					expect(lastFrame()).toMatch(/output.*\s+test command output 1\s+test command output 2/si);
				});
			});
			describe('when it is pinned', () => {
				it('renders stdout as <Static/>', () => {
					const runningCommandWithStdout: PageProps = {
						...defaultProps,
						pinOutput: true,
						command: {
							filename: 'test',
							args: ['command'],
							status: RUNNING,
							stdout: [
								{text: 'test command output 1', uid: '1'},
								{text: 'test command output 2', uid: '2'}
							]
						}
					};
					const {lastFrame} = render(<Page {...runningCommandWithStdout}/>);

					// It is not possible to test for <Static/>
					// let's at least not require the "output" section title
					expect(lastFrame()).toMatch(/test command output 1\s*test command output 2/i);
				});
			});
		});

		describe('when there is no stdout', () => {
			it('shows no stdout', () => {
				const runningCommandWithoutStdout: PageProps = {
					...defaultProps,
					body: '',
					command: {
						filename: 'test',
						args: ['command'],
						status: RUNNING,
						stdout: []
					}
				};
				const {lastFrame} = render(<Page {...runningCommandWithoutStdout}/>);

				expect(lastFrame()).toMatch(/no command output/i);
			});
		});

		describe('when input is required', () => {
			const commandWaitingForInput: PageProps = {
				...defaultProps,
				command: {
					filename: 'test',
					args: ['command'],
					status: INPUT_REQUIRED,
					stdout: []
				}
			};

			it('shows the page body', () => {
				const {lastFrame} = render(<Page {...commandWaitingForInput}/>);

				expect(lastFrame()).toMatch(/this is\s+a test page/i);
			});

			it('shows input prompt', () => {
				const {lastFrame} = render(<Page {...commandWaitingForInput}/>);

				expect(stripAnsi(lastFrame())).toMatch(/⚠️ {2}test command \(needs input\)/i);
			});

			describe('when user provides input', () => {
				it('shows user input', () => {
					const {lastFrame, stdin} = render(<Page {...commandWaitingForInput}/>);

					stdin.write('test user input');

					expect(lastFrame()).toMatch(/>_ testuserinput/i);
				});

				describe('when user submits input', () => {
					it('submits input on <enter>', () => {
						const submit = jest.fn();
						const {stdin} = render(<Page {...commandWaitingForInput} submit={submit}/>);

						stdin.write('test user input');
						stdin.write(ENTER);

						expect(submit).toHaveBeenCalledWith('testuserinput');
						expect(submit).toHaveBeenCalledTimes(1);
					});
				});
			});
		});
	});

	describe('when the command has finished', () => {
		const finishedCommand: PageProps = {
			...defaultProps,
			command: {
				filename: 'test',
				args: ['command'],
				status: FINISHED,
				stdout: [
					{text: 'test output 1', uid: '1'},
					{text: 'test output 2', uid: '2'}
				]
			}
		};

		it('shows the page body', () => {
			const {lastFrame} = render(<Page {...finishedCommand}/>);

			expect(lastFrame()).toMatch(/this is\s+a test page/i);
		});

		it('shows stdout', () => {
			const {lastFrame} = render(<Page {...finishedCommand}/>);

			expect(lastFrame()).toMatch(/test output 1\s*test output 2\s*/si);
		});

		it('shows it has finished', () => {
			const {lastFrame} = render(<Page {...finishedCommand}/>);

			expect(stripAnsi(lastFrame())).toMatch(/✅️ {2}test command/i);
		});

		it('shows prompt to continue', () => {
			const {lastFrame} = render(<Page {...finishedCommand}/>);

			expect(lastFrame()).toMatch(/press <space> to continue/i);
		});

		describe('when pressing <space>', () => {
			it('completes the command', () => {
				const complete = jest.fn();
				const {stdin} = render(<Page {...finishedCommand} complete={complete}/>);

				stdin.write(SPACE);

				expect(complete).toHaveBeenCalledTimes(1);
			});
		});
	});

	describe('when there is no command', () => {
		const {command, ...commandLessPage}: PageProps = {...defaultProps, body: 'there is no command here. just text.'};

		it('shows the page body', () => {
			const {lastFrame} = render(<Page {...commandLessPage}/>);

			expect(stripAnsi(lastFrame())).toMatch(/the test page\s+~ a test page it is ~\s+there is no command here\. just text\./si);
		});

		it('shows prompt to continue', () => {
			const {lastFrame} = render(<Page {...commandLessPage}/>);

			expect(lastFrame()).toMatch(/press <space> to continue/i);
		});

		describe('when pressing <space>', () => {
			it('completes the page', () => {
				const complete = jest.fn();
				const {stdin} = render(<Page {...{...commandLessPage, complete}}/>);

				stdin.write(SPACE);

				expect(complete).toHaveBeenCalledTimes(1);
			});
		});
	});
});
