// Rename this file to localConfig.cjs
// Before running the tests, you can specify a BASE_URL, such as
// BASE_URL=http://localhost:40443/zDdfsdfs npm test
const baseUrl = process.env.BASE_URL || 'http://localhost:8075/id';
module.exports = {
    settings: {},
    implementations: [{
        name: 'TrustBloc',
        implementation: 'TrustBloc Implementation',
        oauth2: {
            "clientId": "profile-user-issuer-1",
            "clientSecret": "profile-user-issuer-1-pwd",
            "tokenAudience": "http://cognito-auth.local:8094/cognito",
            "tokenEndpoint": "http://cognito-auth.local:8094/cognito/oauth2/token"
        },
        issuers: [{
            id: 'did:myMethod:implementation:issuer:id',
            endpoint: `${baseUrl}/credentials/issue`
        }],
        verifiers: [{
            id: 'did:myMethod:implementation:verifier:id',
            endpoint: `${baseUrl}/credentials/verify`
        }],
        vpVerifiers: [{
            id: 'did:myMethod:implementation:verifier:id',
            endpoint: `${baseUrl}/presentations/verify`
        }]
    }]
};
