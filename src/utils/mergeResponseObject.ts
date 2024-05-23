// プリミティブ型の定義
type Primitive = string | number | boolean | null | undefined;

// JSONオブジェクトと配列の型定義
type JsonObject = { [key: string]: any };
type JsonArray = any[];

/**
 * 2つのプリミティブ値をマージします。
 * 特定のキーに対しては特別な処理を行います。
 *
 * @param value1 - 最初のプリミティブ値
 * @param value2 - 2番目のプリミティブ値
 * @param key - マージするキー
 * @returns マージされたプリミティブ値
 */
function mergePrimitives(
  value1: Primitive,
  value2: Primitive,
  key: string
): Primitive {
  if (key === "content" || key === "arguments") {
    if (typeof value1 === "string" && typeof value2 === "string") {
      return value1 + value2;
    }
  }
  return value2;
}

/**
 * 2つの配列をマージします。
 * 特定のキーに対しては特別な処理を行います。
 *
 * @param arr1 - 最初の配列
 * @param arr2 - 2番目の配列
 * @param key - マージするキー
 * @returns マージされた配列
 */
function mergeArrays(arr1: JsonArray, arr2: JsonArray, key: string): JsonArray {
  if (key === "tool_calls") {
    const map = new Map<number, JsonObject>();

    // arr1の要素をマップに追加
    arr1.forEach((item: JsonObject) => map.set(item.index, item));

    // arr2の要素をマップに追加またはマージ
    arr2.forEach((item: JsonObject) => {
      if (map.has(item.index)) {
        map.set(item.index, mergeResponseObjects(map.get(item.index)!, item));
      } else {
        map.set(item.index, item);
      }
    });

    return Array.from(map.values());
  } else {
    const result: JsonArray = [];
    const maxLength = Math.max(arr1.length, arr2.length);

    // 配列の要素をマージ
    for (let i = 0; i < maxLength; i++) {
      if (i < arr1.length && i < arr2.length) {
        result.push(mergeResponseObjects(arr1[i], arr2[i]));
      } else if (i < arr1.length) {
        result.push(arr1[i]);
      } else {
        result.push(arr2[i]);
      }
    }

    return result;
  }
}

/**
 * 2つのJSONオブジェクトをマージします。非破壊的な関数です。
 *
 * @param obj1 - 最初のオブジェクト
 * @param obj2 - 2番目のオブジェクト
 * @returns マージされたオブジェクト
 */
export function mergeResponseObjects(
  obj1: JsonObject,
  obj2: JsonObject
): JsonObject {
  const result: JsonObject = { ...obj1 };

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (Array.isArray(obj2[key])) {
        result[key] = mergeArrays(result[key] || [], obj2[key], key);
      } else if (typeof obj2[key] === "object" && obj2[key] !== null) {
        result[key] = mergeResponseObjects(result[key] || {}, obj2[key]);
      } else {
        result[key] = mergePrimitives(result[key], obj2[key], key);
      }
    }
  }

  return result;
}
