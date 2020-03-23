import {
  GRANT_TYPE_AUTHORIZATION_CODE,
  StringMap,
  TokenRequest,
  TokenRequestJson,
} from '@openid/appauth';
import invariant from 'invariant';

/**
 * Represents the Token Request as JSON.
 */
export interface ExpoTokenRequestJson extends TokenRequestJson {
  client_secret?: string;
  scope?: string;
  code_verifier?: string;
  grant_type: 'authorization_code' | 'refresh_token';
}

/**
 * Represents an Access Token request.
 * For more information look at:
 * https://tools.ietf.org/html/rfc6749#section-4.1.3
 */
export class ExpoTokenRequest extends TokenRequest {
  clientSecret?: string;
  scope?: string;
  codeVerifier?: string;

  constructor(request: ExpoTokenRequestJson) {
    super(request);
    this.clientSecret = request.client_secret;
    this.scope = request.scope;
    this.codeVerifier = request.code_verifier;

    // Additional validation for the authorization_code grant type
    // From iOS
    if (request.grant_type === GRANT_TYPE_AUTHORIZATION_CODE) {
      // redirect URI must not be nil
      invariant(
        request.redirect_uri,
        `A \`ExpoTokenRequest\` was created with a \`grant_type\` (${request.grant_type}) that requires a \`redirect_uri\`, but a nullish \`redirect_uri\` was given`
      );
    }
  }

  toStringMap(): StringMap {
    const map: StringMap = {
      grant_type: this.grantType,
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
    };

    if (this.code) {
      map['code'] = this.code;
    }

    if (this.refreshToken) {
      map['refresh_token'] = this.refreshToken;
    }

    // Maybe just platform iOS
    if (this.clientSecret) {
      delete map.client_id;
    }

    if (this.codeVerifier) {
      map['code_verifier'] = this.codeVerifier;
    }

    if (this.scope) {
      map['scope'] = this.scope;
    }

    // copy over extras
    if (this.extras) {
      for (const extra in this.extras) {
        if (extra in this.extras && !(extra in map)) {
          // check before inserting to requestMap
          map[extra] = this.extras[extra];
        }
      }
    }
    return map;
  }
}
