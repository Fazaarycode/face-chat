/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 
        '@aws-sdk/credential-provider-node',
        '@aws-sdk/credential-provider-ini',
        '@aws-sdk/credential-provider-process',
        '@aws-sdk/credential-provider-sso',
        '@aws-sdk/credential-provider-web-identity',
        '@aws-sdk/credential-provider-env',
        '@aws-sdk/credential-provider-imds'
      ];
    }
    return config;
  },
}

module.exports = nextConfig 