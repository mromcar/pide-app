declare interface ErrorConstructor {
  captureStackTrace?: (targetObject: object, constructorOpt?: Function) => void
  stackTraceLimit?: number
}
