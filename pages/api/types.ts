export interface PreviewCallback {
  schema?: string;
  header?: Header;
  event?: Event;
  type?: string;
  encrypt?: string;
}

export interface Header {
  event_id?: string;
  token?: string;
  create_time?: string;
  event_type?: string;
  tenant_key?: string;
  app_id?: string;
}

export interface Event {
  operator?: Operator;
  observer?: Observer;
  sender?: Sender;
  host?: string;
  context?: Context;
  preview_token?: string;
  url?: string;
}

export interface Operator {
  tenant_key?: string;
  open_id?: string;
  union_id?: string;
}

export interface Observer {
  tenant_key?: string;
  id?: Id;
}

export interface Id {
  open_id?: string;
  union_id?: string;
  app_id?: string;
}

export interface Sender {
  tenant_key?: string;
  id?: Id;
  type?: string;
}

export interface Context {
  url?: string;
  preview_token?: string;
  send_type?: string;
  open_message_id?: string;
  open_chat_id?: string;
}
