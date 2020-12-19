// tslint:disable-next-line: no-namespace
declare namespace React {
  function createContext<T>(
    defaultValue: T,
    calculateChangedBits: () => number,
  ): Context<T>
}
