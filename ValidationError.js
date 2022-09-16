export default class ValidationError extends Error {
	constructor(...params) {
		super(...params)
		this.name = "ValidationError";
	}
}
