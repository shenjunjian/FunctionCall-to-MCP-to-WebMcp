export const filesToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const cache = new Map();
export const arrayBufferToImageUrl = (arrayBuffer: ArrayBuffer) => {
  if (cache.has(arrayBuffer)) return cache.get(arrayBuffer);

  const blob = new Blob([arrayBuffer], { type: "image/jpeg" }); // 可根据实际情况指定MIME类型
  cache.set(arrayBuffer, URL.createObjectURL(blob));
  return cache.get(arrayBuffer);
};
