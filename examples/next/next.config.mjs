import { withStyleThis } from '@style-this/next';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withStyleThis(nextConfig, { atomic: process.env.ATOMIC === '1' });
