import basex from "base-x";
const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const bs62 = basex(BASE62);

export function decode62(s: string) {
  return new TextDecoder().decode(bs62.decode(s));
}

export function encode62(s: string) {
  return bs62.encode(new TextEncoder().encode(s));
}
