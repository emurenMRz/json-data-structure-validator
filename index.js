import ValidationError from "./ValidationError.js";
import ValidType from "./ValidType.js";
import Format from "./Format.js";

export { ValidationError, ValidType };

class DifferentTypeError extends ValidationError {
	constructor(target, requiredFormat, nodePath) {
		let l = typeof target;
		let r = typeof requiredFormat;
		if (l === "object") l += `: ${JSON.stringify(target)}`
		if (r === "object") r += `: ${JSON.stringify(requiredFormat)}`

		super(`${nodePath}Required format different:\n\tobject: ${l}\n\trequired format: ${r}`);
	}
}

function core(o, format, parentKey = undefined) {
	const nodePath = parentKey ? `[${parentKey}] ` : '';
	if (format === undefined || format === null)
		throw new ValidationError(`${nodePath}Empty format: ${format}`);

	if (typeof format === "function")
		return format(o, nodePath);

	if (format instanceof Array) {
		if (format.length === 0)
			throw new ValidationError(`${nodePath}Type is not specified.`);
		let result = undefined;
		const find = format.some((type, index) => {
			try {
				result = core(o, type, `${nodePath}[${index}]`);
				return true;
			} catch {
				return false;
			}
		});
		if (!find)
			throw new ValidationError(`${nodePath}None of the types apply: ${JSON.stringify(format)}, ${JSON.stringify(o)}`);
		return result;
	}

	if (typeof o !== typeof format)
		throw new DifferentTypeError(o, format, nodePath);
	if (!(format instanceof Format))
		throw new ValidationError(`${nodePath}Invalid format: ${JSON.stringify(o)}`);

	format.clear();
	const extra = [];
	for (const key in o) {
		const l = o[key];
		const r = format.find(key);
		if (r === undefined)
			extra.push(key);
		else if (r.isArray) {
			if (!(l instanceof Array))
				throw new DifferentTypeError(l, r, nodePath);
			o[key] = l.map((v, index) => core(v, r.type, `${parentKey}.${key}[${index}]`));
		} else
			o[key] = core(l, r.type, `${parentKey}.${key}`);
	}
	if (extra.length > 0)
		console.warn(`Extra key: ${parentKey}{${extra.join(", ")}}`);
	const noRef = format.noReference;
	if (noRef.length > 0)
		throw new ValidationError(`Need key: ${parentKey}{${noRef.join(", ")}}`);
	return o;
}

export function validate(o, format) {
	if (typeof format !== "function")
		format = new Format(format);

	if (o instanceof Array)
		o.forEach((oo, i, a) => a[i] = core(oo, format, `*[${i}]`));
	else
		core(o, format, "*");
}
