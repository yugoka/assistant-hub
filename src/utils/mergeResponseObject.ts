const customizer = (objValue: any, srcValue: any, key: string) => {
  if (
    // contentとargumentsだけ足し合わせる
    (key === "content" || key === "arguments") &&
    typeof objValue === "string" &&
    typeof srcValue === "string"
  ) {
    return objValue + srcValue;
  }
  return undefined; // 他のキーの場合はundefinedを返す
};

export const mergeResponseObjects = (obj1: any, obj2: any) => {
  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      const objValue = obj1[key];
      const srcValue = obj2[key];
      const customizedValue = customizer(objValue, srcValue, key);

      // customizerが値を返した場合、その値を使用
      if (customizedValue !== undefined) {
        obj1[key] = customizedValue;
      } else {
        // customizerが値を返さなかった場合、通常のマージを行う
        if (
          typeof objValue === "object" &&
          typeof srcValue === "object" &&
          objValue !== null &&
          srcValue !== null
        ) {
          if (Array.isArray(objValue) && Array.isArray(srcValue)) {
            // 配列の場合
            for (let i = 0; i < srcValue.length; i++) {
              if (i < objValue.length) {
                if (
                  typeof objValue[i] === "object" &&
                  typeof srcValue[i] === "object" &&
                  objValue[i] !== null &&
                  srcValue[i] !== null
                ) {
                  mergeResponseObjects(objValue[i], srcValue[i]);
                } else {
                  objValue[i] = srcValue[i];
                }
              } else {
                objValue.push(srcValue[i]);
              }
            }
          } else {
            // オブジェクトの場合
            mergeResponseObjects(objValue, srcValue);
          }
        } else {
          obj1[key] = srcValue;
        }
      }
    }
  }

  return obj1;
};
