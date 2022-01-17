export function escapeFilename(str) {
  return str.replace(/(["\s'$`\\])/g,'\\$1');
}
