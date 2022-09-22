import ValidationError from "./ValidationError.js";

const ValidType = {
	Number: (target, nodePath) => {
		if (!isFinite(target))
			throw new ValidationError(`${nodePath}Need number: ${JSON.stringify(target)}`);
		return +target;
	},

	Boolean: (target, nodePath) => {
		if (typeof target !== "boolean")
			throw new ValidationError(`${nodePath}Need boolean: ${JSON.stringify(target)}`);
		return target;
	},

	String: (target, nodePath) => {
		if (target === null)
			throw new ValidationError(`${nodePath}Need string: ${JSON.stringify(target)}`);
		return '' + target;
	},

	Null: (target, nodePath) => {
		if (target !== null && !(target instanceof Array && target.length == 0))
			throw new ValidationError(`${nodePath}Need null: ${JSON.stringify(target)}`);
		return null;
	},
};
Object.freeze(ValidType);

export default ValidType;