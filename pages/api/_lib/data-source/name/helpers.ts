import {
  getLarkUserLastName,
  getLarkUserShorterName,
} from "@/pages/api/_lib/data-source/name/name-parser";
export function extractNameInfo(options: any): string {
  return options?.data?.root?._fullName ?? "LarkUser";
}
export function helperName(options: any) {
  const info = extractNameInfo(options);
  return info;
}

export function helperNameShort(options: any) {
  const info = extractNameInfo(options);
  return getLarkUserShorterName(info);
}

export function helperNameLast(options: any) {
  const info = extractNameInfo(options);
  return getLarkUserLastName(info);
}
