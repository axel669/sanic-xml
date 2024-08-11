/**
Class for errors in parsing or stringifying.
@extends Error
@property {string} message
@property {any} detail
*/
export class SanicError extends Error {
    constructor(message, detail) {
        super(message)
        this.detail = detail
    }
}
