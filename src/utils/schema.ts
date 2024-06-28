import OpenAPISchemaValidator from "openapi-schema-validator";

export const validateOpenAPISchema = (data: any): boolean => {
  const openAPISchemaValidator = new OpenAPISchemaValidator({
    version: 3,
  });
  const validationResult = openAPISchemaValidator.validate(data);
  return validationResult.errors.length === 0;
};
