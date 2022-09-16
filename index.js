import ValidationError from "./ValidationError.js";
import ValidType from "./ValidType.js";
import Format from "./Format.js";

export { ValidationError, ValidType };

function core(o, format, parentKey = undefined) {
	const nodePath = parentKey ? `[${parentKey}] ` : '';
	if (format === undefined || format === null)
		throw new ValidationError(`${nodePath}Empty format: ${format}`);

	if (typeof format === "function")
		return format(o);

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
		throw new ValidationError(`${nodePath}Different type: ${typeof o} <=> ${typeof format}`);
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
				throw new ValidationError(`${nodePath}Different type: ${typeof l} <=> ${typeof r}`);
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
		o.forEach((oo, i, a) => a[i] = core(oo, format));
	else
		core(o, format);
}
