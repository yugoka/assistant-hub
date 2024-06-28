import OpenAPISchemaValidator from "openapi-schema-validator";
import yaml from "js-yaml";

export const validateOpenAPISchema = (data: string): boolean => {
  try {
    const openAPISchemaValidator = new OpenAPISchemaValidator({
      version: 3,
    });
    const jsonSchema = convertSchemaToJson(data);

    const validationResult = openAPISchemaValidator.validate(
      JSON.parse(jsonSchema)
    );
    return validationResult.errors.length === 0;
  } catch {
    return false;
  }
};

export const convertSchemaToJson = (data: string): string => {
  try {
    JSON.parse(data);
    return data;
  } catch {
    try {
      const schema = yaml.load(data);
      return JSON.stringify(schema);
    } catch {
      throw new Error("Failed to parse schema");
    }
  }
};

// JSONスキーマを見やすく整形する
export const formatJsonSchema = (data: string): string => {
  try {
    const result = JSON.stringify(JSON.parse(data), null, 2);
    return result;
  } catch {
    return data;
  }
};
