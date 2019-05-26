import shell from 'shelljs'

export interface ExecReturnValue {
  code: number
  stdout: string
  stderr: string
}

export function execAsync(
  command: string,
  ...params: string[]
): Promise<ExecReturnValue>
export function execAsync(
  command: string,
  silent: false,
  ...params: string[]
): Promise<number>
export function execAsync(
  command: string,
  silent: boolean,
  ...params: string[]
): Promise<ExecReturnValue>
export function execAsync(
  command: string,
  silent?: boolean | string,
  ...params: string[]
): Promise<ExecReturnValue | number> {
  const allParams = typeof silent === 'string' ? [silent, ...params] : params
  const fullCommand = `${command} ${allParams.filter(p => !!p).join(' ')}`
  const silentBoolean = typeof silent === 'boolean' ? silent : true
  return new Promise(resolve =>
    shell.exec(fullCommand, { silent: silentBoolean }, (code, stdout, stderr) =>
      !silentBoolean ? code : resolve({ code, stdout, stderr }),
    ),
  )
}
