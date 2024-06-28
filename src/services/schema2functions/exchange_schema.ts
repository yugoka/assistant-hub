const exchange = async (openApiSchema: any) => {
  const functions: any[] = [];
  
  for (const path in openApiSchema.paths) {
    for (const method in openApiSchema.paths[path]) {
      const endpoint = openApiSchema.paths[path][method];
      const functionDefinition: any = {
        name: '',
        description: endpoint.description,
        parameters: {
          type: 'object',
          properties: {},
          required: []
        }
      };
      
      // Function name construction
      const methodName = method.charAt(0).toUpperCase() + method.slice(1);
      functionDefinition.name = method + path.replace(/[/{}/]/g, '');
      
      // Parameters
      if (endpoint.parameters) {
        for (const param of endpoint.parameters) {
          functionDefinition.parameters.properties[param.name] = {
            type: param.schema.type,
            description: param.description
          };
          if (param.required) {
            functionDefinition.parameters.required.push(param.name);
          }
        }
      }
  
      // Request body
      if (endpoint.requestBody) {
        const requestBodySchemaRef = endpoint.requestBody.content['application/json'].schema.$ref;
        const requestBodySchemaName = requestBodySchemaRef.split('/').pop();
        const requestBodySchema = openApiSchema.components.schemas[requestBodySchemaName];
        for (const prop in requestBodySchema.properties) {
          functionDefinition.parameters.properties[prop] = {
            type: requestBodySchema.properties[prop].type,
            description: requestBodySchema.properties[prop].description
          };
          if (requestBodySchema.required.includes(prop)) {
            functionDefinition.parameters.required.push(prop);
          }
        }
      }
      
      functions.push(functionDefinition);
    }
  }
  
  console.log(functions[1].parameters.properties);
}

// 実行例
exchange(
{
  "openapi": "3.0.3",
  "info": {
    "title": "ユーザー管理API",
    "description": "ユーザー情報を管理するための簡単なAPIです。",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.example.com/v1"
    }
  ],
  "paths": {
    "/users": {
      "get": {
        "summary": "ユーザー一覧の取得",
        "description": "すべてのユーザーを取得します。",
        "responses": {
          "200": {
            "description": "ユーザーのリスト",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/User"
                  }
                }
              }
            }
          }
        }
      },
      "post": {
        "summary": "新しいユーザーの作成",
        "description": "新しいユーザーを作成します。",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/NewUser"
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "作成されたユーザー",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          }
        }
      }
    },
    "/users/{userId}": {
      "get": {
        "summary": "特定のユーザーの取得",
        "description": "特定のユーザーの詳細を取得します。",
        "parameters": [
          {
            "name": "userId",
            "in": "path",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "ユーザーの詳細",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/User"
                }
              }
            }
          },
          "404": {
            "description": "ユーザーが見つかりません"
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "ユーザーID"
          },
          "name": {
            "type": "string",
            "description": "ユーザーの名前"
          },
          "email": {
            "type": "string",
            "description": "ユーザーのメールアドレス"
          }
        }
      },
      "NewUser": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "ユーザーの名前"
          },
          "email": {
            "type": "string",
            "description": "ユーザーのメールアドレス"
          }
        },
        "required": [
          "name",
          "email"
        ]
      }
    }
  }
}
)