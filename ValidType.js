import ValidationError from "./ValidationError.js";

const ValidType = {
	Number: target => {
		if (isNaN(target))
			throw new ValidationError(`Need number '${target}'`);
		return +target;
	},

	Boolean: target => {
		if (typeof target !== "boolean")
			throw new ValidationError(`Need boolean '${target}'`);
		return target;
	},

	String: target => {
		if (target === null)
			throw new ValidationError(`Need string '${target}'`);
		return '' + target;
	},

	Null: target => {
		if (target !== null && !(target instanceof Array && target.length == 0))
			throw new ValidationError(`Need null '${target}'`);
		return null;
	},
};
Object.freeze(ValidType);

export default ValidType;