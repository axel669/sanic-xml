export const setup = (_, assertions) => {
    assertions.is = (value, target) => value instanceof target
}
