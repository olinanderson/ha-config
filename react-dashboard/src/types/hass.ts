/** Minimal HA type definitions for the hass object passed by panel_custom */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed: string;
  last_updated: string;
}

export interface HassUser {
  name: string;
  is_admin: boolean;
}

export interface HassAuth {
  data: {
    access_token: string;
  };
}

/** Minimal Connection type matching home-assistant-js-websocket */
export interface HassConnection {
  subscribeMessage: <T>(
    callback: (msg: T) => void,
    params: Record<string, unknown>,
    options?: { resubscribe?: boolean },
  ) => Promise<() => void>;
  sendMessagePromise: <T>(msg: Record<string, unknown>) => Promise<T>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, any>,
    target?: { entity_id?: string | string[] },
  ) => Promise<void>;
  connection: HassConnection;
  user: HassUser;
  auth: HassAuth;
  language: string;
}
