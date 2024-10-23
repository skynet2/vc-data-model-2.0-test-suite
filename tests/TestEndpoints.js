/*
 * Copyright 2024 Digital Bazaar, Inc.
 *
 * SPDX-License-Identifier: LicenseRef-w3c-3-clause-bsd-license-2008 OR LicenseRef-w3c-test-suite-license-2023
 */

import {challenge, domain} from './data-generator.js';
import {
  createRequestBody,
  createVerifyRequestBody
} from './mock.data.js';
import http from 'http';
import receiveJson from './receive-json.js';

import axios from 'axios';
import qs from 'qs';

let accessToken = "";

export class TestEndpoints {
  constructor({implementation, tag}) {
    this.implementation = implementation;
    this.tag = tag;
    this.verifier = implementation.verifiers?.find(
      verifier => verifier.tags.has(tag)) || null;
    this.issuer = implementation.issuers?.find(
      issuer => issuer.tags.has(tag)) || null;
    this.vpVerifier = implementation.vpVerifiers?.find(
      vpVerifier => vpVerifier.tags.has(tag)) || null;

    console.log("yyy")
  }
  async issue(credential) {
    if (this.implementation.settings.oauth2) {
      let authData = this.implementation.settings.oauth2;

      let token = await issueAccessToken(authData.tokenEndpoint, authData.clientId, authData.clientSecret, authData.scopes);
    }

    const {issuer} = this;
    const issueBody = createRequestBody({issuer, vc: credential});
    return post(issuer, issueBody);
  }
  // FIXME implement createVp for implementation endpoints in the future
  // @see https://w3c-ccg.github.io/vc-api/#create-presentation
  async createVp() {
    throw new Error('Create VP not implemented yet.');
  }
  async verify(vc) {
    const verifyBody = createVerifyRequestBody({vc});
    const result = await post(this.verifier, verifyBody);
    if(result?.errors?.length) {
      throw result.errors[0];
    }
    return result;
  }
  async verifyVp(vp, options = {}) {
    if(this.vpVerifier === null) {
      return null;
    }
    const {settings: {options: vpVerifierOptions}} = this.vpVerifier;
    const body = {
      verifiablePresentation: vp,
      options: {
        domain,
        challenge,
        ...vpVerifierOptions,
        // request-specific options should override endpoint options
        ...options
      }
    };
    const result = await post(this.vpVerifier, body);
    if(result?.errors?.length) {
      throw result.errors[0];
    }
    return result;
  }
}


/**
 * Function to issue an access token
 * @param {string} oidcProviderURL - The OIDC Provider URL
 * @param {string} clientID - The Client ID
 * @param {string} secret - The Client Secret
 * @param {Array} scopes - Array of scopes
 * @returns {Promise<string>} - A promise that resolves to the ID token
 */
export async function issueAccessToken(oidcProviderURL, clientID, secret, scopes) {
  const tokenURL = `${oidcProviderURL}`;

  // Prepare the form data
  const formData = qs.stringify({
    grant_type: 'client_credentials',
    client_id: clientID,
    client_secret: secret,
    scopes: scopes,
  });

  const authHeader = Buffer.from(`${clientID}:${secret}`).toString('base64');

  // Configure the HTTP client
  const response = await axios.post(tokenURL, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${authHeader}`,
    },
  });

  // Extract and return the id_token
  // return response.data.id_token;

  accessToken = response.data.id_token

  return accessToken
}

class HTTPError extends Error {
  constructor(message) {
    super(message);
    this.name = 'HTTPError';
  }
}

export async function post(endpoint, object) {
  const url = endpoint.settings.endpoint;
  if(url.startsWith('https')) {
    // Use vc-test-suite-implementations for HTTPS requests.
    const {data, error} = await endpoint.post({json: object});
    if(error) {
      throw error;
    }
    return data;
  }
  const postData = Buffer.from(JSON.stringify(object));

  console.log("Sending request to: " + url)
  console.log("Data: " + postData)

  const res = await new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length,
        Accept: 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-Tenant-ID': '00000000-0000-0000-0000-000000000001',
        'X-API-Key' : 'rw_token'
      }
    }, resolve);
    req.on('error', reject);
    req.end(postData);
  });
  const result = await receiveJson(res);
  if (result){
    console.log("Result")
    console.log(result)
  }

  if(res.statusCode >= 400) {
    if(result != null && result.errors) {
      throw new HTTPError(result.errors);
    }
      throw new HTTPError(result);
  }
  if(res.statusCode >= 300) {
    throw new Error('Redirect not supported');
  }
  return result;
}
