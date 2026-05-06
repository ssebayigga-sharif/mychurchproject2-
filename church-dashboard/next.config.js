/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  sassOptions: {
    includePaths: ["./styles"],
  },
};

module.exports = nextConfig;
