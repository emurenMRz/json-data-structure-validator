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
		if (target !== null)
			throw new ValidationError(`${nodePath}Need null: ${JSON.stringify(target)}`);
		return null;
	},

	Empty: (target, nodePath) => {
		if (target === undefined) return undefined;
		if (target === null) return undefined;
		if (target instanceof Array && target.length === 0) return undefined;
		if (typeof target !== 'object') return undefined;
		if (Object.entries(target).length === 0) return undefined;

		throw new ValidationError(`${nodePath}Need empty: ${JSON.stringify(target)}`);
	},
};
Object.freeze(ValidType);

export default ValidType;