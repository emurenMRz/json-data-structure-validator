# json-data-structure-validator

Validates the keys required for an object and the type of its value.

## Example

### Basic usage

The validate() function validates the JSON object passed as its first argument with the format object passed as its second argument.

```
import { ValidationError, ValidType, validate } from "./json-data-structure-validator/index.js";

const json = {
	alice: {
		height: 123,
		gender: "girl"
	},
	bob: {
		height: 116,
		weight: 35,
		gender: "boy"
	}
};

validate(json, {
	alice: {
		height: ValidType.Number,
		gender: ValidType.String
	},
	bob: {
		height: ValidType.Number,
		weight: ValidType.Number,
		gender: ValidType.String
	}
});
```

If a problem occurs during validation, such as a different type or missing key required by the format object, a "ValidationError" exception is raised.

```
import { ValidationError, ValidType, validate } from "./json-data-structure-validator/index.js";

const json = {
	alice: {
		height: 123,
		gender: "girl"
	},
};

validate(json, {
	alice: {
		height: ValidType.Number,
		weight: ValidType.Number,
		gender: ValidType.String
	},
});
# ValidationError Need key: {weight}
```

### Option key

"`?`" in the key name in the format object. in the key name in the format object makes it an optional key.

```
import { ValidationError, ValidType, validate } from "./json-data-structure-validator/index.js";

const json = {
	alice: {
		height: 123,
		gender: "girl"
	},
};

validate(json, {
	alice: {
		height: ValidType.Number,
		"weight?": ValidType.Number,
		gender: ValidType.String
	},
});
# Exceptions disappear
```

### Array data

The "`[]`" in the key name indicates an array.

```
import { ValidationError, ValidType, validate } from "./json-data-structure-validator/index.js";

const json = {
	people: [
		"debbie",
		"eliza",
		"flora"
	],
	"high people": [
		{
			name: "alice",
			age: 20
		},
		{
			name: "bob",
			age: 21
		},
		{
			name: "charlie",
			age: 22
		},
	]
};

validate(json, {
	"people[]": ValidType.String,
	"high people[]": {
		name: ValidType.String,
		age: ValidType.Number
	},
});
```

### Regexp key

Key names can be specified by regular expressions.

```
import { ValidationError, ValidType, validate } from "./json-data-structure-validator/index.js";

const json = {
	"100": "hundred",
	"150": "one hundred and fifty",
	"1000": "thousand",
};

validate(json, {
	"/\\d+/": ValidType.String
});
```

### User type

Since `ValidType` is a normal function, you may specify your own conversion function.

After validation by the validate() function, the contents of json.ids are replaced with the return value of the original function.

```
import { ValidationError, ValidType, validate } from "./json-data-structure-validator/index.js";

const json = {
	ids: "1,2,3,4,5"
};

validate(json, {
	ids: v => {
		if (typeof v !== "string")
			throw new ValidationError(`Need ids '${v}'`);
		return v.split(",");
	}
});
# json.ids: "1,2,3,4,5" => json.ids: [1,2,3,4,5]
```
