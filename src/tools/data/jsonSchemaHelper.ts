export interface ValidationError {
  path: string;
  message: string;
  expected?: string;
  received?: string;
}

// Client-side JSON Schema generator from sample JSON data
export const generateJsonSchema = (data: any, title: string = 'GeneratedSchema'): any => {
  const inferType = (val: any): string => {
    if (val === null) return 'null';
    if (Array.isArray(val)) return 'array';
    return typeof val;
  };

  const buildNode = (val: any): any => {
    const type = inferType(val);

    if (type === 'object') {
      const properties: any = {};
      const required: string[] = [];

      Object.entries(val).forEach(([key, subVal]) => {
        properties[key] = buildNode(subVal);
        required.push(key);
      });

      return {
        type: 'object',
        properties,
        required,
        additionalProperties: true,
      };
    }

    if (type === 'array') {
      const itemSchema = val.length > 0 ? buildNode(val[0]) : { type: 'string' };
      return {
        type: 'array',
        items: itemSchema,
      };
    }

    if (type === 'string') {
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) return { type: 'string', format: 'date-time' };
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return { type: 'string', format: 'email' };
      if (/^https?:\/\//.test(val)) return { type: 'string', format: 'uri' };
      return { type: 'string' };
    }

    if (type === 'number') {
      return Number.isInteger(val) ? { type: 'integer' } : { type: 'number' };
    }

    return { type };
  };

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title,
    ...buildNode(data),
  };
};

// Client-side JSON Schema validator validating types, required properties, and basic constraints
export const validateJsonAgainstSchema = (instance: any, schema: any, path: string = '#'): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!schema || typeof schema !== 'object') return errors;

  // Check type
  if (schema.type) {
    const actualType = Array.isArray(instance) ? 'array' : instance === null ? 'null' : typeof instance;
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];

    const matched = expectedTypes.some((t: string) => {
      if (t === 'integer') return Number.isInteger(instance);
      if (t === 'number') return typeof instance === 'number';
      return actualType === t;
    });

    if (!matched) {
      errors.push({
        path,
        message: `Type mismatch at ${path}`,
        expected: expectedTypes.join(' | '),
        received: actualType,
      });
      return errors;
    }
  }

  // Object checks
  if (schema.type === 'object' && typeof instance === 'object' && instance !== null) {
    if (Array.isArray(schema.required)) {
      schema.required.forEach((reqKey: string) => {
        if (!(reqKey in instance)) {
          errors.push({
            path: `${path}/${reqKey}`,
            message: `Missing required property '${reqKey}'`,
          });
        }
      });
    }

    if (schema.properties) {
      Object.entries(instance).forEach(([key, val]) => {
        if (schema.properties[key]) {
          errors.push(...validateJsonAgainstSchema(val, schema.properties[key], `${path}/${key}`));
        } else if (schema.additionalProperties === false) {
          errors.push({
            path: `${path}/${key}`,
            message: `Additional property '${key}' not allowed by schema`,
          });
        }
      });
    }
  }

  // Array checks
  if (schema.type === 'array' && Array.isArray(instance) && schema.items) {
    instance.forEach((item, idx) => {
      errors.push(...validateJsonAgainstSchema(item, schema.items, `${path}/${idx}`));
    });
  }

  return errors;
};
