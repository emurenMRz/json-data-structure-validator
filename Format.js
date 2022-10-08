import ValidationError from "./ValidationError.js";

class Item {
	#name = null;
	#isOption = false;
	#isArray = false;
	#rawKey = null;
	#type = null;
	#reference = false;

	constructor(rawKey, rawType) {
		let name = rawKey;

		// "keyname?": unrequired key.
		const isOption = name.endsWith("?");
		if (isOption) name = name.substring(0, name.length - 1);

		// "keyname[]": this value of key is array. 
		const isArray = name.endsWith("[]");
		if (isArray) name = name.substring(0, name.length - 2);

		// "/regex/": the key name specified by a regular expression.
		if (name.at(0) === "/" && name.at(-1) === "/")
			name = new RegExp(`^${name.substring(1, name.length - 1)}$`);

		let type = rawType;
		if (typeof type !== "function") {
			if (type instanceof Array)
				type = type.map(v => {
					if (typeof v === "function") return v;
					if (typeof v === "object" && !(v instanceof Array)) return new Format(v);
					throw new ValidationError(`Unsupport type: ${v}`);
				});
			else if (typeof type === "object")
				type = new Format(type);
			if (!type)
				throw new ValidationError(`Unknown 'type': ${type}`);
		}

		this.#name = name;
		this.#isOption = isOption;
		this.#isArray = isArray;
		this.#rawKey = rawKey;
		this.#type = type;
	}

	toString() { return this.#rawKey + ": " + JSON.stringify(this.toJSON()); }
	toJSON() {
		const type = this.#type;
		if (type instanceof Array)
			return type.map(v => v.toJSON());
		else if (type instanceof Format)
			return type.toJSON();
		return type.name;
	}

	get name() { return this.#name; }
	get isOption() { return this.#isOption; }
	get isArray() { return this.#isArray; }
	get rawKey() { return this.#rawKey; }
	get type() { return this.#type; }
	get reference() { return this.#reference; }
	set reference(state) { this.#reference = state; }
}

export default class Format {
	#item = [];

	constructor(format) {
		if (typeof format !== "object")
			throw new ValidationError("'format' is not object.");
		this.#item = Object.keys(format).map(key => new Item(key, format[key]));
	}

	toString() { return JSON.stringify(this.toJSON()); }
	toJSON() { return Object.fromEntries(this.#item.map(v => [v.rawKey, v.toJSON()])); }

	get empty() { return this.#item.length === 0; }
	get noReference() { return this.#item.filter(v => !v.reference && !v.isOption).map(v => v.rawKey); }

	clear() { this.#item.forEach(v => v.reference = false); }

	find(name) {
		const item = this.#item.find(v => typeof v.name === "string" ? v.name === name : v.name.exec(name) !== null);
		if (item)
			item.reference = true;
		return item;
	}
}
