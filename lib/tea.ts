import { EditMode } from "./App";

export function init() {}

type EventMap = {
  docx_picker_visit: {
    docx_is_dark_mode: boolean;
  };
  docx_picker_copy: {
    docx_picker_mode: EditMode;
    docx_picker_copy_success: boolean;
    docx_picker_copy_length: number;
    docx_is_dark_mode: boolean;
  };
  docx_picker_click_time: {};
  docx_picker_import: {};
  docx_display_require_permission: {};
  docx_apply_permission_click: {};
  docx_apply_permission_detail_click: {};
};

export function setCustomParams(params: {
  docx_userinfo_nickname: string;
  docx_token: string;
}) {}

export function sendEvent<T extends keyof EventMap>({
  name,
  params,
}: {
  uid?: string;
  name: T;
  params: EventMap[T];
}) {}
