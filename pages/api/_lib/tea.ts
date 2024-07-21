/* c8 ignore start */

type EventMap = {
  url_preview_get: {
    hostname: string;
    full_mode: boolean;

    sender_user_union_id?: string;
    observer_user_union_id?: string;
    operator_user_union_id?: string;
    sender_type?: string;
    sender_app_id?: string;
    preview_token?: string;
    open_chat_id?: string;
    lark_app_id?: string;

    is_in_sign: boolean;
    is_observing_self: boolean;
  };
  handle_custom_link: {
    has_token_name: boolean;
    has_token_time: boolean;
    has_token_name_short: boolean;
    has_token_name_last: boolean;
    has_token_holiday: boolean;
    has_hbs_helper: boolean;
    has_enable_name: boolean;

    has_text: boolean;
    image_key: string;
    has_url: boolean;
    has_cp: boolean;
    has_bio_expand: boolean;
    has_text_2: boolean;
    hostname: string;
    target_hostname?: string;

    sender_type?: string;
    sender_app_id?: string;
    sender_user_union_id?: string;
    observer_user_union_id?: string;
    operator_user_union_id?: string;
    preview_token?: string;
    open_chat_id?: string;
    lark_app_id?: string;

    is_in_sign: boolean;
    is_observing_self: boolean;
  };

  handle_open_user_chat_preview: {
    sender_type?: string;
    sender_app_id?: string;
    sender_user_union_id?: string;
    observer_user_union_id?: string;
    operator_user_union_id?: string;
    preview_token?: string;
    open_chat_id?: string;
    lark_app_id?: string;

    is_in_sign: boolean;
    is_observing_self: boolean;
  };

  open_user_chat_visit: {
    hostname: string;
    prefix: string;
    prefix_open_id: string;
  };
  index_page_visit: {
    hostname: string;
    has_token_name: boolean;
    has_text: boolean;
    image_key: string;
    has_url: boolean;
    target_hostname?: string;

    has_hbs_helper: boolean;
  };
};

export function sendEvent<T extends keyof EventMap>({
  uid,
  name,
  params,
}: {
  uid?: string;
  name: T;
  params: EventMap[T];
}) {
  return;
}
