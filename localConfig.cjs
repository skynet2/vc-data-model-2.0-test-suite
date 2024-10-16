// Rename this file to localConfig.cjs
// Before running the tests, you can specify a BASE_URL, such as
// BASE_URL=http://localhost:40443/zDdfsdfs npm test
const baseUrl = process.env.BASE_URL || 'http://localhost:8075';
module.exports = {
    settings: {},
    implementations: [{
        name: 'TrustBloc',
        implementation: 'TrustBloc Implementation',
        oauth2: {
            "clientId": "profile-user-issuer-1",
            "clientSecret": "profile-user-issuer-1-pwd",
            "tokenAudience": "http://cognito-auth.local:8094/cognito",
            "tokenEndpoint": "http://cognito-auth.local:8094/cognito/oauth2/token",
            "scopes": "org_admin"
        },
        issuers: [{
            id: 'did:myMethod:implementation:issuer:id',
            endpoint: `${baseUrl}/issuer/profiles/vc-data-model-test-suite-issuer/v1.0/credentials/issue`,
            tags: ["vc2.0"]
        }],
        verifiers: [{
            id: 'did:myMethod:implementation:verifier:id',
            endpoint: `${baseUrl}/verifier/profiles/v_myprofile_ldp/v1.0/credentials/verify`,
            tags: ["vc2.0"]
        }],
        vpVerifiers: [{
            id: 'did:myMethod:implementation:verifier:id',
            endpoint: `${baseUrl}/presentations/verify`,
            tags: ["vc2.0"]
        }]
    }]
};
