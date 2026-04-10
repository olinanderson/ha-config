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

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, any>,
    target?: { entity_id?: string | string[] },
  ) => Promise<void>;
  user: HassUser;
  auth: HassAuth;
  language: string;
}
