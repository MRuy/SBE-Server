export function compressSegmentsArray(segments: Array<any>) {
  if (segments.length === 0) {
    return {keys:[], values:[]};
  }
  const keys = Object.keys(segments[0]);
  const values = segments.map(item => {
    const arr = [];
    keys.forEach(key => {
      arr.push(item[key]);
    });
    return arr;
  });
  return {
    keys,
    values,
  };
}
