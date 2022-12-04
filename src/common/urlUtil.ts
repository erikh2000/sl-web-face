// Example inputs in unit tests
export function replaceUrlResourceExtension(url:string, newExtension:string):string {
  const queryStringPos = url.lastIndexOf('?');
  const resourceEndPos = queryStringPos === -1 ? url.length : queryStringPos;
  const lastPathSeparator = url.lastIndexOf('/', resourceEndPos);
  if (lastPathSeparator === -1) {
    console.warn(`Invalid URL - "${url}"`);
    return url;
  }
  const extensionPos = url.lastIndexOf('.', resourceEndPos);
  if (extensionPos < lastPathSeparator) return url;

  if (!newExtension.startsWith('.')) newExtension = `.${newExtension}`;
  return `${url.substring(0, extensionPos)}${newExtension}${url.substring(resourceEndPos)}`;
}